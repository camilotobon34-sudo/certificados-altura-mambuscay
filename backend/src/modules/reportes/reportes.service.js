import ExcelJS from 'exceljs';
import { query } from '../../config/db.js';
import { estadoEfectivoSql } from '../../utils/constants.js';
import { LOGO_ALTO, LOGO_ANCHO, LOGO_PNG_BASE64 } from '../../assets/logo-altura-mambuscay.js';

export const ACCIONES = ['Emisión', 'Edición', 'Suspensión', 'Reactivación', 'Anulación', 'Cambio de estado'];

// historial_estados registra toda acción sobre un certificado; la acción se deduce del cambio.
const ACCION_SQL = `
  CASE
    WHEN h.estado_anterior IS NULL THEN 'Emisión'
    WHEN h.estado_nuevo = 'ANULADO' THEN 'Anulación'
    WHEN h.observacion LIKE 'Edición de datos%' THEN 'Edición'
    WHEN h.estado_nuevo = 'SUSPENDIDO' THEN 'Suspensión'
    WHEN h.estado_anterior = 'SUSPENDIDO' THEN 'Reactivación'
    ELSE 'Cambio de estado'
  END`;

const DEL_DIA = (columna) => `${columna} >= ? AND ${columna} < DATE_ADD(?, INTERVAL 1 DAY)`;

export const hoyBogota = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date());

export const reporteDiario = async (fecha) => {
  const rango = [fecha, fecha];
  const [actividad, emitidos, personas, totales] = await Promise.all([
    query(
      `SELECT h.id, DATE_FORMAT(h.cambiado_en, '%H:%i:%s') AS hora, ${ACCION_SQL} AS accion,
              c.id AS certificadoId, c.numero_certificado AS numeroCertificado,
              c.codigo_verificacion AS codigoVerificacion,
              CONCAT(p.nombres, ' ', p.apellidos) AS persona,
              td.codigo AS tipoDocumento, p.numero_documento AS numeroDocumento,
              cu.nombre AS curso, h.estado_anterior AS estadoAnterior, h.estado_nuevo AS estadoNuevo,
              IFNULL(CONCAT(u.nombres, ' ', u.apellidos), 'Sistema') AS usuario,
              COALESCE(a.motivo, h.observacion) AS observacion
         FROM historial_estados h
         JOIN certificados c ON c.id = h.certificado_id
         JOIN personas_certificadas p ON p.id = c.persona_id
         JOIN tipos_documento td ON td.id = p.tipo_documento_id
         JOIN cursos cu ON cu.id = c.curso_id
         LEFT JOIN usuarios u ON u.id = h.usuario_id
         LEFT JOIN anulaciones a ON a.certificado_id = c.id AND h.estado_nuevo = 'ANULADO'
        WHERE ${DEL_DIA('h.cambiado_en')}
        ORDER BY h.cambiado_en, h.id`,
      rango,
    ),
    query(
      `SELECT c.id, DATE_FORMAT(c.creado_en, '%H:%i:%s') AS hora,
              c.numero_certificado AS numeroCertificado, c.codigo_verificacion AS codigoVerificacion,
              CONCAT(p.nombres, ' ', p.apellidos) AS persona,
              td.codigo AS tipoDocumento, p.numero_documento AS numeroDocumento,
              p.correo, p.telefono,
              cu.nombre AS curso, c.intensidad_horaria AS intensidadHoraria,
              c.fecha_expedicion AS fechaExpedicion, c.fecha_vencimiento AS fechaVencimiento,
              ${estadoEfectivoSql('c')} AS estado,
              CONCAT(ue.nombres, ' ', ue.apellidos) AS emitidoPor
         FROM certificados c
         JOIN personas_certificadas p ON p.id = c.persona_id
         JOIN tipos_documento td ON td.id = p.tipo_documento_id
         JOIN cursos cu ON cu.id = c.curso_id
         JOIN usuarios ue ON ue.id = c.emitido_por_usuario_id
        WHERE ${DEL_DIA('c.creado_en')}
        ORDER BY c.creado_en, c.id`,
      rango,
    ),
    query(
      `SELECT p.id, DATE_FORMAT(p.creado_en, '%H:%i:%s') AS hora,
              CONCAT(p.nombres, ' ', p.apellidos) AS persona,
              td.codigo AS tipoDocumento, p.numero_documento AS numeroDocumento,
              p.correo, p.telefono,
              (SELECT COUNT(*) FROM certificados c WHERE c.persona_id = p.id) AS certificados
         FROM personas_certificadas p
         JOIN tipos_documento td ON td.id = p.tipo_documento_id
        WHERE ${DEL_DIA('p.creado_en')}
        ORDER BY p.creado_en, p.id`,
      rango,
    ),
    query(`SELECT ${estadoEfectivoSql('c')} AS estado, COUNT(*) AS total FROM certificados c GROUP BY 1`),
  ]);

  const resumen = Object.fromEntries(ACCIONES.map((accion) => [accion, 0]));
  for (const fila of actividad) resumen[fila.accion] += 1;

  const totalesSistema = { VIGENTE: 0, VENCIDO: 0, SUSPENDIDO: 0, ANULADO: 0 };
  for (const { estado, total } of totales) totalesSistema[estado] = Number(total);

  return {
    fecha,
    resumen,
    personasRegistradas: personas.length,
    totalesSistema,
    actividad,
    emitidos,
    personas: personas.map((p) => ({ ...p, certificados: Number(p.certificados) })),
  };
};

// ---------------------------------------------------------------------------
// Excel
// ---------------------------------------------------------------------------

// Datos de las plantillas oficiales; se usan si Configuración no los tiene diligenciados.
const EMPRESA = {
  nombre: 'ALTURA MAMBUSCAY S.A.S',
  nit: '901269652-6',
  licencia: 'Licencia de Salud Ocupacional (DSSA) 97325',
  direccion: 'Km 3 vía La Ceja - San Nicolás, La Ceja (Antioquia)',
  telefono: '314 823 7245',
  correo: 'alturamambuscay@gmail.com',
};

const COLOR = {
  primario: 'FF0A3A4A',
  acento: 'FFD97706',
  texto: 'FF1F2937',
  gris: 'FF6B7280',
  linea: 'FFD1D5DB',
  zebra: 'FFF4F7F9',
  suave: 'FFE6EEF1',
  blanco: 'FFFFFFFF',
};

const ESTADO_LABEL = { VIGENTE: 'Vigente', VENCIDO: 'Vencido', SUSPENDIDO: 'Suspendido', ANULADO: 'Anulado' };

// [fondo, texto] para resaltar estados y acciones como etiquetas de color.
const TONOS = {
  Vigente: ['FFDCFCE7', 'FF166534'],
  Vencido: ['FFFEF3C7', 'FF92400E'],
  Suspendido: ['FFDBEAFE', 'FF1E40AF'],
  Anulado: ['FFFEE2E2', 'FF991B1B'],
  Emisión: ['FFDCFCE7', 'FF166534'],
  Edición: ['FFE0F2FE', 'FF075985'],
  Suspensión: ['FFFEF3C7', 'FF92400E'],
  Reactivación: ['FFD1FAE5', 'FF065F46'],
  Anulación: ['FFFEE2E2', 'FF991B1B'],
  'Cambio de estado': ['FFF3F4F6', 'FF374151'],
};

const ACCION_TITULO = {
  Emisión: 'Certificados emitidos',
  Edición: 'Certificados editados',
  Suspensión: 'Certificados suspendidos',
  Reactivación: 'Certificados reactivados',
  Anulación: 'Certificados anulados',
  'Cambio de estado': 'Otros cambios de estado',
};

const relleno = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
const lineaFina = { style: 'thin', color: { argb: COLOR.linea } };
const BORDES = { top: lineaFina, left: lineaFina, bottom: lineaFina, right: lineaFina };

const fechaExcel = (iso) => {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

const fechaLarga = (iso) => {
  const texto = new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeZone: 'UTC' }).format(fechaExcel(iso));
  return texto.charAt(0).toUpperCase() + texto.slice(1);
};

const ahoraBogota = () =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Bogota',
  }).format(new Date());

// exceljs no ajusta la altura de filas con texto largo: se estima por el texto más largo de la fila.
const altoFila = (columnas, datos) => {
  const lineas = columnas.map((col) => {
    const valor = datos[col.key];
    const texto = valor instanceof Date ? 'dd/mm/aaaa' : String(valor ?? '');
    const capacidad = Math.max(1, Math.floor((col.width ?? 15) * 1.15));
    return texto.split('\n').reduce((total, parte) => total + Math.max(1, Math.ceil(parte.length / capacidad)), 0);
  });
  return Math.max(20, Math.max(...lineas) * 13 + 7);
};

const configurarImpresion = (hoja, filaTitulos) => {
  hoja.pageSetup = {
    paperSize: 1,
    orientation: 'landscape',
    fitToPage: true,
    fitToWidth: 1,
    fitToHeight: 0,
    horizontalCentered: true,
    margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.6, header: 0.2, footer: 0.3 },
    ...(filaTitulos ? { printTitlesRow: `${filaTitulos}:${filaTitulos}` } : {}),
  };
  hoja.headerFooter = {
    oddFooter: '&L&8Altura Mambuscay S.A.S · Reporte diario&C&8Página &P de &N&R&8Uso interno',
  };
};

// Banda superior común: logo, datos de la empresa, título y franja de color. Devuelve la siguiente fila libre.
const encabezado = (hoja, { logoId, empresa, titulo, colTexto, ultimaColumna }) => {
  [28, 17, 17, 22].forEach((alto, i) => {
    hoja.getRow(i + 1).height = alto;
  });
  const altoLogo = 98;
  hoja.addImage(logoId, {
    tl: { col: 0.1, row: 0.1 },
    ext: { width: Math.round((LOGO_ANCHO * altoLogo) / LOGO_ALTO), height: altoLogo },
    editAs: 'oneCell',
  });

  // Sin combinar celdas: así el texto largo se extiende a las columnas vacías de la derecha.
  const linea = (fila, texto, font) => {
    const celda = hoja.getCell(fila, colTexto);
    celda.value = texto;
    celda.font = { name: 'Calibri', ...font };
    celda.alignment = { vertical: 'middle', horizontal: 'left' };
  };
  linea(1, empresa.nombre, { bold: true, size: 18, color: { argb: COLOR.primario } });
  linea(2, `NIT ${empresa.nit}  ·  ${empresa.licencia}`, { size: 10, color: { argb: COLOR.gris } });
  linea(3, `${empresa.direccion}  ·  Tel. ${empresa.telefono}  ·  ${empresa.correo}`, {
    size: 10,
    color: { argb: COLOR.gris },
  });
  linea(4, titulo, { bold: true, size: 13, color: { argb: COLOR.acento } });

  hoja.getRow(5).height = 6;
  for (let col = 1; col <= ultimaColumna; col += 1) hoja.getCell(5, col).fill = relleno(COLOR.primario);
  hoja.getRow(6).height = 10;
  return 7;
};

const tituloSeccion = (hoja, fila, texto, ultimaColumna) => {
  hoja.mergeCells(fila, 1, fila, ultimaColumna);
  const celda = hoja.getCell(fila, 1);
  celda.value = texto.toUpperCase();
  celda.font = { bold: true, size: 11, color: { argb: COLOR.primario } };
  celda.alignment = { vertical: 'bottom' };
  celda.border = { bottom: { style: 'medium', color: { argb: COLOR.acento } } };
  hoja.getRow(fila).height = 22;
  return fila + 1;
};

const estiloEncabezadoTabla = (celda) => {
  celda.font = { bold: true, size: 10, color: { argb: COLOR.blanco } };
  celda.fill = relleno(COLOR.primario);
  celda.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
  celda.border = BORDES;
};

const aplicarTono = (celda) => {
  const tono = TONOS[celda.value];
  if (!tono) return;
  celda.fill = relleno(tono[0]);
  celda.font = { bold: true, size: 10, color: { argb: tono[1] } };
  celda.alignment = { ...celda.alignment, horizontal: 'center' };
};

// Tabla con encabezado de color, filas alternas, bordes y etiquetas de color. Devuelve la siguiente fila libre.
const tabla = (hoja, filaInicio, columnas, filas, vacio, { filtro = true } = {}) => {
  const encabezadoTabla = hoja.getRow(filaInicio);
  encabezadoTabla.height = 32;
  columnas.forEach((col, i) => {
    const celda = encabezadoTabla.getCell(i + 1);
    celda.value = col.header;
    estiloEncabezadoTabla(celda);
  });

  if (filas.length === 0) {
    const fila = filaInicio + 1;
    hoja.mergeCells(fila, 1, fila, columnas.length);
    const celda = hoja.getCell(fila, 1);
    celda.value = vacio;
    celda.font = { italic: true, size: 10, color: { argb: COLOR.gris } };
    celda.alignment = { horizontal: 'center', vertical: 'middle' };
    celda.border = BORDES;
    hoja.getRow(fila).height = 30;
    return fila + 2;
  }

  filas.forEach((datos, idx) => {
    const fila = hoja.getRow(filaInicio + 1 + idx);
    fila.height = altoFila(columnas, datos);
    columnas.forEach((col, i) => {
      const celda = fila.getCell(i + 1);
      celda.value = datos[col.key] ?? '';
      celda.font = { size: 10, color: { argb: COLOR.texto }, ...(col.negrita ? { bold: true } : {}) };
      celda.alignment = { vertical: 'middle', horizontal: col.align ?? 'left', wrapText: true };
      celda.border = BORDES;
      if (col.numFmt) celda.numFmt = col.numFmt;
      if (idx % 2 === 1) celda.fill = relleno(COLOR.zebra);
      if (col.etiqueta) aplicarTono(celda);
    });
  });

  const ultimaFila = filaInicio + filas.length;
  if (filtro) {
    hoja.autoFilter = { from: { row: filaInicio, column: 1 }, to: { row: ultimaFila, column: columnas.length } };
  }
  return ultimaFila + 2;
};

const pieDePagina = (hoja, fila, ultimaColumna, generadoPor) => {
  hoja.mergeCells(fila, 1, fila, ultimaColumna);
  const celda = hoja.getCell(fila, 1);
  celda.value = `Generado por ${generadoPor} el ${ahoraBogota()} desde Certificados Altura Mambuscay. Documento de uso interno.`;
  celda.font = { italic: true, size: 9, color: { argb: COLOR.gris } };
};

// Filas 1-6: encabezado; 7: título de sección; 8: encabezado de la tabla (fijo al desplazarse e impreso en cada página).
const FILA_ENCABEZADO_TABLA = 8;

const hojaDeDatos = (libro, { nombre, tab, titulo, columnas, filas, vacio, contexto }) => {
  const hoja = libro.addWorksheet(nombre, {
    properties: { tabColor: { argb: tab } },
    views: [{ state: 'frozen', ySplit: FILA_ENCABEZADO_TABLA, showGridLines: false }],
  });
  columnas.forEach((col, i) => {
    hoja.getColumn(i + 1).width = col.width;
  });
  const ultima = columnas.length;
  let fila = encabezado(hoja, { ...contexto, titulo, colTexto: 3, ultimaColumna: ultima });
  fila = tituloSeccion(hoja, fila, `${nombre} · ${filas.length} ${filas.length === 1 ? 'registro' : 'registros'}`, ultima);
  fila = tabla(hoja, fila, columnas, filas, vacio);
  pieDePagina(hoja, fila, ultima, contexto.generadoPor);
  configurarImpresion(hoja, FILA_ENCABEZADO_TABLA);
  return hoja;
};

const cargarEmpresa = async () => {
  const [config] = await query('SELECT nit, ciudad, direccion, telefono, correo FROM configuracion_centro ORDER BY id LIMIT 1');
  return {
    ...EMPRESA,
    nit: config?.nit || EMPRESA.nit,
    direccion: config?.direccion ? [config.direccion, config.ciudad].filter(Boolean).join(', ') : EMPRESA.direccion,
    telefono: config?.telefono || EMPRESA.telefono,
    correo: config?.correo || EMPRESA.correo,
  };
};

export const reporteDiarioExcel = async (reporte, generadoPor) => {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Certificados Altura Mambuscay';
  libro.company = EMPRESA.nombre;
  libro.title = `Reporte diario ${reporte.fecha}`;
  libro.created = new Date();

  const contexto = {
    empresa: await cargarEmpresa(),
    logoId: libro.addImage({ base64: LOGO_PNG_BASE64, extension: 'png' }),
    generadoPor,
  };
  const titulo = `Reporte diario de actividad  ·  ${fechaLarga(reporte.fecha)}`;

  // --- Resumen -------------------------------------------------------------
  const resumen = libro.addWorksheet('Resumen', {
    properties: { tabColor: { argb: COLOR.acento } },
    views: [{ showGridLines: false }],
  });
  [34, 15, 15, 15, 15, 15, 13].forEach((ancho, i) => {
    resumen.getColumn(i + 1).width = ancho;
  });
  const ULTIMA = 7;
  let fila = encabezado(resumen, { ...contexto, titulo, colTexto: 2, ultimaColumna: ULTIMA });

  fila = tituloSeccion(resumen, fila, 'Datos del reporte', ULTIMA);
  const datos = [
    ['Fecha del reporte', fechaLarga(reporte.fecha)],
    ['Generado por', generadoPor],
    ['Fecha y hora de generación', ahoraBogota()],
    ['Total de acciones sobre certificados', reporte.actividad.length],
  ];
  for (const [etiqueta, valor] of datos) {
    const celdaEtiqueta = resumen.getCell(fila, 1);
    celdaEtiqueta.value = etiqueta;
    celdaEtiqueta.font = { bold: true, size: 10, color: { argb: COLOR.primario } };
    celdaEtiqueta.fill = relleno(COLOR.suave);
    celdaEtiqueta.border = BORDES;
    resumen.mergeCells(fila, 2, fila, ULTIMA);
    const celdaValor = resumen.getCell(fila, 2);
    celdaValor.value = valor;
    celdaValor.font = { size: 10, color: { argb: COLOR.texto } };
    celdaValor.alignment = { horizontal: 'left', vertical: 'middle' };
    celdaValor.border = BORDES;
    resumen.getRow(fila).height = 20;
    fila += 1;
  }
  fila += 1;

  fila = tituloSeccion(resumen, fila, 'Resumen de la actividad del día', ULTIMA);
  const indicadores = ACCIONES.filter((a) => a !== 'Cambio de estado' || reporte.resumen[a] > 0).map((a) => ({
    indicador: ACCION_TITULO[a],
    accion: a,
    cantidad: reporte.resumen[a],
  }));
  indicadores.push({ indicador: 'Personas registradas', accion: '', cantidad: reporte.personasRegistradas });
  const inicioIndicadores = fila;
  fila = tabla(
    resumen,
    fila,
    [
      { header: 'Indicador', key: 'indicador', width: 34, negrita: true },
      { header: 'Cantidad', key: 'cantidad', align: 'center' },
    ],
    indicadores,
    '',
    { filtro: false },
  );
  indicadores.forEach(({ accion }, idx) => {
    const tono = TONOS[accion];
    if (tono) resumen.getCell(inicioIndicadores + 1 + idx, 1).border = { ...BORDES, left: { style: 'thick', color: { argb: tono[1] } } };
  });
  const filaTotal = fila - 1;
  ['Total de acciones del día', reporte.actividad.length].forEach((valor, i) => {
    const celda = resumen.getCell(filaTotal, i + 1);
    celda.value = valor;
    celda.font = { bold: true, size: 11, color: { argb: COLOR.blanco } };
    celda.fill = relleno(COLOR.acento);
    celda.alignment = { horizontal: i ? 'center' : 'left', vertical: 'middle' };
    celda.border = BORDES;
  });
  resumen.getRow(filaTotal).height = 22;
  fila += 1;

  fila = tituloSeccion(resumen, fila, 'Actividad por usuario', ULTIMA);
  const porUsuario = new Map();
  for (const { usuario, accion } of reporte.actividad) {
    const conteo = porUsuario.get(usuario) ?? { usuario, total: 0 };
    conteo[accion] = (conteo[accion] ?? 0) + 1;
    conteo.total += 1;
    porUsuario.set(usuario, conteo);
  }
  fila = tabla(
    resumen,
    fila,
    [
      { header: 'Usuario', key: 'usuario', width: 34, negrita: true },
      { header: 'Emisiones', key: 'Emisión', align: 'center' },
      { header: 'Ediciones', key: 'Edición', align: 'center' },
      { header: 'Suspensiones', key: 'Suspensión', align: 'center' },
      { header: 'Reactivaciones', key: 'Reactivación', align: 'center' },
      { header: 'Anulaciones', key: 'Anulación', align: 'center' },
      { header: 'Total', key: 'total', align: 'center', negrita: true },
    ],
    [...porUsuario.values()].map((u) => ({ ...Object.fromEntries(ACCIONES.map((a) => [a, 0])), ...u })),
    'Ningún usuario registró actividad este día.',
    { filtro: false },
  );

  fila = tituloSeccion(resumen, fila, 'Estado general de los certificados (al momento de generar el reporte)', ULTIMA);
  const estados = Object.entries(reporte.totalesSistema).map(([estado, total]) => ({
    estado: ESTADO_LABEL[estado],
    total,
  }));
  fila = tabla(
    resumen,
    fila,
    [
      { header: 'Estado', key: 'estado', width: 34, etiqueta: true },
      { header: 'Certificados', key: 'total', align: 'center' },
    ],
    estados,
    '',
    { filtro: false },
  );
  const totalCertificados = estados.reduce((suma, e) => suma + e.total, 0);
  const filaTotalEstados = fila - 1;
  ['Total de certificados registrados', totalCertificados].forEach((valor, i) => {
    const celda = resumen.getCell(filaTotalEstados, i + 1);
    celda.value = valor;
    celda.font = { bold: true, size: 11, color: { argb: COLOR.blanco } };
    celda.fill = relleno(COLOR.primario);
    celda.alignment = { horizontal: i ? 'center' : 'left', vertical: 'middle' };
    celda.border = BORDES;
  });
  resumen.getRow(filaTotalEstados).height = 22;
  fila += 1;

  pieDePagina(resumen, fila, ULTIMA, generadoPor);
  configurarImpresion(resumen);
  resumen.pageSetup.orientation = 'portrait';

  // --- Hojas de detalle -----------------------------------------------------
  const documento = (f) => `${f.tipoDocumento} ${f.numeroDocumento}`;

  hojaDeDatos(libro, {
    nombre: 'Actividad del día',
    tab: COLOR.primario,
    titulo,
    contexto,
    vacio: 'No hubo actividad sobre certificados este día.',
    columnas: [
      { header: 'Hora', key: 'hora', width: 10, align: 'center' },
      { header: 'Acción', key: 'accion', width: 15, etiqueta: true },
      { header: 'Número de certificado', key: 'numeroCertificado', width: 23, negrita: true },
      { header: 'Código de verificación', key: 'codigoVerificacion', width: 19, align: 'center' },
      { header: 'Persona', key: 'persona', width: 30 },
      { header: 'Documento', key: 'documento', width: 17 },
      { header: 'Curso', key: 'curso', width: 38 },
      { header: 'Estado anterior', key: 'estadoAnterior', width: 17, etiqueta: true },
      { header: 'Estado nuevo', key: 'estadoNuevo', width: 16, etiqueta: true },
      { header: 'Realizado por', key: 'usuario', width: 24 },
      { header: 'Observación / motivo', key: 'observacion', width: 46 },
    ],
    filas: reporte.actividad.map((f) => ({
      ...f,
      documento: documento(f),
      estadoAnterior: ESTADO_LABEL[f.estadoAnterior] ?? '—',
      estadoNuevo: ESTADO_LABEL[f.estadoNuevo] ?? '',
    })),
  });

  hojaDeDatos(libro, {
    nombre: 'Certificados emitidos',
    tab: 'FF16A34A',
    titulo,
    contexto,
    vacio: 'No se emitieron certificados este día.',
    columnas: [
      { header: 'Hora', key: 'hora', width: 10, align: 'center' },
      { header: 'Número de certificado', key: 'numeroCertificado', width: 23, negrita: true },
      { header: 'Código de verificación', key: 'codigoVerificacion', width: 19, align: 'center' },
      { header: 'Persona', key: 'persona', width: 30 },
      { header: 'Documento', key: 'documento', width: 17 },
      { header: 'Correo', key: 'correo', width: 28 },
      { header: 'Teléfono', key: 'telefono', width: 15 },
      { header: 'Curso', key: 'curso', width: 38 },
      { header: 'Horas', key: 'intensidadHoraria', width: 8, align: 'center' },
      { header: 'Expedición', key: 'fechaExpedicion', width: 12, align: 'center', numFmt: 'dd/mm/yyyy' },
      { header: 'Vencimiento', key: 'fechaVencimiento', width: 12, align: 'center', numFmt: 'dd/mm/yyyy' },
      { header: 'Estado actual', key: 'estado', width: 13, etiqueta: true },
      { header: 'Emitido por', key: 'emitidoPor', width: 24 },
    ],
    filas: reporte.emitidos.map((f) => ({
      ...f,
      documento: documento(f),
      fechaExpedicion: fechaExcel(f.fechaExpedicion),
      fechaVencimiento: fechaExcel(f.fechaVencimiento),
      estado: ESTADO_LABEL[f.estado] ?? f.estado,
    })),
  });

  hojaDeDatos(libro, {
    nombre: 'Personas registradas',
    tab: 'FF2563EB',
    titulo,
    contexto,
    vacio: 'No se registraron personas este día.',
    columnas: [
      { header: 'Hora', key: 'hora', width: 10, align: 'center' },
      { header: 'Persona', key: 'persona', width: 32, negrita: true },
      { header: 'Documento', key: 'documento', width: 18 },
      { header: 'Correo', key: 'correo', width: 34 },
      { header: 'Teléfono', key: 'telefono', width: 18 },
      { header: 'Certificados a la fecha', key: 'certificados', width: 16, align: 'center' },
    ],
    filas: reporte.personas.map((f) => ({ ...f, documento: documento(f) })),
  });

  return libro.xlsx.writeBuffer();
};
