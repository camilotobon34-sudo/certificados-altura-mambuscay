import ExcelJS from 'exceljs';
import { query } from '../../config/db.js';
import { estadoEfectivoSql } from '../../utils/constants.js';

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
  const [actividad, emitidos, personas] = await Promise.all([
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
              p.correo, p.telefono
         FROM personas_certificadas p
         JOIN tipos_documento td ON td.id = p.tipo_documento_id
        WHERE ${DEL_DIA('p.creado_en')}
        ORDER BY p.creado_en, p.id`,
      rango,
    ),
  ]);

  const resumen = Object.fromEntries(ACCIONES.map((accion) => [accion, 0]));
  for (const fila of actividad) resumen[fila.accion] += 1;

  return { fecha, resumen, personasRegistradas: personas.length, actividad, emitidos, personas };
};

const COLOR_PRIMARIO = 'FF0A3A4A';
const ESTADO_LABEL = { VIGENTE: 'Vigente', VENCIDO: 'Vencido', SUSPENDIDO: 'Suspendido', ANULADO: 'Anulado' };
const fechaDMY = (iso) => (iso ? iso.slice(0, 10).split('-').reverse().join('/') : '');

const agregarHoja = (libro, nombre, columnas, filas, vacio) => {
  const hoja = libro.addWorksheet(nombre, { views: [{ state: 'frozen', ySplit: 1 }] });
  hoja.columns = columnas.map(({ header, key, width }) => ({ header, key, width }));
  const encabezado = hoja.getRow(1);
  encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARIO } };
  encabezado.alignment = { vertical: 'middle' };
  encabezado.height = 22;

  if (filas.length === 0) {
    hoja.addRow({ [columnas[0].key]: vacio }).font = { italic: true, color: { argb: 'FF6B7280' } };
    return hoja;
  }
  hoja.addRows(filas);
  hoja.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columnas.length } };
  hoja.eachRow((fila, n) => {
    if (n > 1) fila.alignment = { vertical: 'top', wrapText: true };
  });
  return hoja;
};

export const reporteDiarioExcel = async (reporte, generadoPor) => {
  const libro = new ExcelJS.Workbook();
  libro.creator = 'Certificados Altura Mambuscay';
  libro.created = new Date();

  const resumen = libro.addWorksheet('Resumen');
  resumen.columns = [{ width: 34 }, { width: 16 }];
  resumen.addRow(['CERTIFICADOS ALTURA MAMBUSCAY']).font = { bold: true, size: 14, color: { argb: COLOR_PRIMARIO } };
  resumen.addRow([`Reporte diario de actividad — ${fechaDMY(reporte.fecha)}`]).font = { bold: true, size: 12 };
  resumen.addRow([`Generado por ${generadoPor} el ${new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' })}`])
    .font = { italic: true, color: { argb: 'FF6B7280' } };
  resumen.addRow([]);
  const encabezado = resumen.addRow(['Actividad', 'Cantidad']);
  encabezado.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  encabezado.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLOR_PRIMARIO } };
  const plural = { Emisión: 'Certificados emitidos', Edición: 'Ediciones de certificados', Suspensión: 'Suspensiones',
    Reactivación: 'Reactivaciones', Anulación: 'Anulaciones', 'Cambio de estado': 'Otros cambios de estado' };
  for (const accion of ACCIONES) resumen.addRow([plural[accion], reporte.resumen[accion]]);
  resumen.addRow(['Personas registradas', reporte.personasRegistradas]);
  const total = resumen.addRow(['Total de acciones sobre certificados', reporte.actividad.length]);
  total.font = { bold: true };

  agregarHoja(
    libro,
    'Actividad',
    [
      { header: 'Hora', key: 'hora', width: 10 },
      { header: 'Acción', key: 'accion', width: 16 },
      { header: 'Número de certificado', key: 'numeroCertificado', width: 24 },
      { header: 'Código de verificación', key: 'codigoVerificacion', width: 22 },
      { header: 'Persona', key: 'persona', width: 30 },
      { header: 'Tipo doc.', key: 'tipoDocumento', width: 10 },
      { header: 'Número de documento', key: 'numeroDocumento', width: 20 },
      { header: 'Curso', key: 'curso', width: 34 },
      { header: 'Estado anterior', key: 'estadoAnterior', width: 16 },
      { header: 'Estado nuevo', key: 'estadoNuevo', width: 16 },
      { header: 'Realizado por', key: 'usuario', width: 26 },
      { header: 'Observación / motivo', key: 'observacion', width: 50 },
    ],
    reporte.actividad.map((f) => ({
      ...f,
      estadoAnterior: ESTADO_LABEL[f.estadoAnterior] ?? '',
      estadoNuevo: ESTADO_LABEL[f.estadoNuevo] ?? '',
    })),
    'No hubo actividad sobre certificados este día.',
  );

  agregarHoja(
    libro,
    'Certificados emitidos',
    [
      { header: 'Hora', key: 'hora', width: 10 },
      { header: 'Número de certificado', key: 'numeroCertificado', width: 24 },
      { header: 'Código de verificación', key: 'codigoVerificacion', width: 22 },
      { header: 'Persona', key: 'persona', width: 30 },
      { header: 'Tipo doc.', key: 'tipoDocumento', width: 10 },
      { header: 'Número de documento', key: 'numeroDocumento', width: 20 },
      { header: 'Curso', key: 'curso', width: 34 },
      { header: 'Horas', key: 'intensidadHoraria', width: 8 },
      { header: 'Expedición', key: 'fechaExpedicion', width: 12 },
      { header: 'Vencimiento', key: 'fechaVencimiento', width: 12 },
      { header: 'Estado actual', key: 'estado', width: 14 },
      { header: 'Emitido por', key: 'emitidoPor', width: 26 },
    ],
    reporte.emitidos.map((f) => ({
      ...f,
      fechaExpedicion: fechaDMY(f.fechaExpedicion),
      fechaVencimiento: fechaDMY(f.fechaVencimiento),
      estado: ESTADO_LABEL[f.estado] ?? f.estado,
    })),
    'No se emitieron certificados este día.',
  );

  agregarHoja(
    libro,
    'Personas registradas',
    [
      { header: 'Hora', key: 'hora', width: 10 },
      { header: 'Persona', key: 'persona', width: 30 },
      { header: 'Tipo doc.', key: 'tipoDocumento', width: 10 },
      { header: 'Número de documento', key: 'numeroDocumento', width: 20 },
      { header: 'Correo', key: 'correo', width: 30 },
      { header: 'Teléfono', key: 'telefono', width: 16 },
    ],
    reporte.personas,
    'No se registraron personas este día.',
  );

  return libro.xlsx.writeBuffer();
};
