import { env } from '../../config/env.js';
import { query, withTransaction } from '../../config/db.js';
import { formatearCodigoCurso, formatearNumeroCertificado, generarCodigoVerificacion } from '../../utils/codes.js';
import {
  ESTADOS,
  REENTRENAMIENTO_MIN_HORAS,
  TIPOS_ACTIVIDAD,
  estadoEfectivoSql,
} from '../../utils/constants.js';
import { badRequest, conflict, notFound } from '../../utils/http-error.js';
import { paginated } from '../../utils/pagination.js';

const SELECT_LISTADO = `
  SELECT c.id, c.numero_certificado AS numeroCertificado,
         c.codigo_verificacion AS codigoVerificacion,
         c.fecha_expedicion AS fechaExpedicion, c.fecha_vencimiento AS fechaVencimiento,
         c.intensidad_horaria AS intensidadHoraria, ${estadoEfectivoSql('c')} AS estado,
         p.id AS personaId, CONCAT(p.nombres, ' ', p.apellidos) AS persona,
         td.codigo AS tipoDocumento, p.numero_documento AS numeroDocumento,
         cu.id AS cursoId, cu.nombre AS curso, nf.nombre AS nivel, ta.nombre AS tipoActividad,
         ta.codigo AS tipoActividadCodigo
    FROM certificados c
    JOIN personas_certificadas p ON p.id = c.persona_id
    JOIN tipos_documento td ON td.id = p.tipo_documento_id
    JOIN cursos cu ON cu.id = c.curso_id
    LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
    JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id`;

export const listar = async (filtros, pagination) => {
  const where = [];
  const params = [];

  if (filtros.q) {
    where.push(`(p.numero_documento LIKE ? OR c.numero_certificado LIKE ?
                 OR c.codigo_verificacion LIKE ? OR CONCAT(p.nombres, ' ', p.apellidos) LIKE ?)`);
    params.push(...Array(4).fill(`%${filtros.q}%`));
  }
  if (filtros.estado) {
    where.push(`${estadoEfectivoSql('c')} = ?`);
    params.push(filtros.estado);
  }
  if (filtros.cursoId) {
    where.push('c.curso_id = ?');
    params.push(filtros.cursoId);
  }
  if (filtros.personaId) {
    where.push('c.persona_id = ?');
    params.push(filtros.personaId);
  }
  if (filtros.desde) {
    where.push('c.fecha_expedicion >= ?');
    params.push(filtros.desde);
  }
  if (filtros.hasta) {
    where.push('c.fecha_expedicion <= ?');
    params.push(filtros.hasta);
  }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const [items, [{ total }]] = await Promise.all([
    query(`${SELECT_LISTADO} ${whereSql} ORDER BY c.fecha_expedicion DESC, c.id DESC LIMIT ? OFFSET ?`, [
      ...params,
      pagination.size,
      pagination.offset,
    ]),
    query(
      `SELECT COUNT(*) AS total
         FROM certificados c
         JOIN personas_certificadas p ON p.id = c.persona_id
       ${whereSql}`,
      params,
    ),
  ]);

  return paginated(items, total, pagination);
};

export const resumen = async () => {
  const [conteos, proximosAVencer, ultimasEmisiones] = await Promise.all([
    query(`SELECT ${estadoEfectivoSql('c')} AS estado, COUNT(*) AS total FROM certificados c GROUP BY 1`),
    query(
      `${SELECT_LISTADO}
        WHERE c.estado NOT IN ('ANULADO', 'SUSPENDIDO')
          AND c.fecha_vencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
        ORDER BY c.fecha_vencimiento
        LIMIT 10`,
    ),
    query(`${SELECT_LISTADO} ORDER BY c.id DESC LIMIT 5`),
  ]);

  const totales = Object.fromEntries(Object.values(ESTADOS).map((estado) => [estado, 0]));
  for (const { estado, total } of conteos) totales[estado] = Number(total);

  return { totales, proximosAVencer, ultimasEmisiones };
};

export const obtenerDetalle = async (id, { incluirInterno = true } = {}) => {
  const [certificado] = await query(
    `SELECT c.id, c.numero_certificado AS numeroCertificado,
            c.codigo_verificacion AS codigoVerificacion, c.url_verificacion AS urlVerificacion,
            c.fecha_expedicion AS fechaExpedicion, c.fecha_vencimiento AS fechaVencimiento,
            c.intensidad_horaria AS intensidadHoraria, c.estado AS estadoRegistrado,
            c.empresa, c.nit_empresa AS nitEmpresa, c.representante_legal AS representanteLegal,
            c.documento_representante AS documentoRepresentante, c.arl,
            c.fecha_inicio_formacion AS fechaInicioFormacion, c.fecha_fin_formacion AS fechaFinFormacion,
            c.entrenador, cu.prefijo_codigo AS prefijoCodigo,
            ${estadoEfectivoSql('c')} AS estado, c.observacion_suspension AS observacionSuspension,
            c.creado_en AS creadoEn,
            p.id AS personaId, p.nombres, p.apellidos, td.codigo AS tipoDocumento,
            p.numero_documento AS numeroDocumento, p.correo, p.telefono,
            cu.id AS cursoId, cu.nombre AS curso, nf.nombre AS nivel, nf.codigo AS nivelCodigo,
            ta.nombre AS tipoActividad, ta.codigo AS tipoActividadCodigo,
            CONCAT(ue.nombres, ' ', ue.apellidos) AS emitidoPor,
            cc.razon_social AS centroFormacion
       FROM certificados c
       JOIN personas_certificadas p ON p.id = c.persona_id
       JOIN tipos_documento td ON td.id = p.tipo_documento_id
       JOIN cursos cu ON cu.id = c.curso_id
       LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
       JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id
       JOIN usuarios ue ON ue.id = c.emitido_por_usuario_id
       CROSS JOIN (SELECT razon_social FROM configuracion_centro ORDER BY id LIMIT 1) cc
      WHERE c.id = ?`,
    [id],
  );
  if (!certificado) throw notFound('Certificado no encontrado');

  if (!incluirInterno) {
    const { correo: _c, telefono: _t, observacionSuspension: _o, emitidoPor: _e, estadoRegistrado: _r, ...visible } =
      certificado;
    return { certificado: visible };
  }

  const [historial, [anulacion]] = await Promise.all([
    query(
      `SELECT h.id, h.estado_anterior AS estadoAnterior, h.estado_nuevo AS estadoNuevo,
              h.observacion, h.cambiado_en AS cambiadoEn,
              IFNULL(CONCAT(u.nombres, ' ', u.apellidos), 'Sistema') AS usuario
         FROM historial_estados h
         LEFT JOIN usuarios u ON u.id = h.usuario_id
        WHERE h.certificado_id = ?
        ORDER BY h.cambiado_en DESC, h.id DESC`,
      [id],
    ),
    query(
      `SELECT a.motivo, a.anulado_en AS anuladoEn, CONCAT(u.nombres, ' ', u.apellidos) AS anuladoPor
         FROM anulaciones a
         JOIN usuarios u ON u.id = a.anulado_por_usuario_id
        WHERE a.certificado_id = ?`,
      [id],
    ),
  ]);

  return { certificado, historial, anulacion: anulacion ?? null };
};

const registrarHistorial = (conn, { certificadoId, usuarioId, anterior, nuevo, observacion }) =>
  conn.query(
    `INSERT INTO historial_estados (certificado_id, usuario_id, estado_anterior, estado_nuevo, observacion)
     VALUES (?, ?, ?, ?, ?)`,
    [certificadoId, usuarioId, anterior, nuevo, observacion ?? null],
  );

// Dentro de una transacción se debe pasar su conexión: en Vercel el pool tiene una sola y
// pedir otra deja la petición esperando para siempre.
const cargarCurso = async (cursoId, { permitirInactivo = false, conn } = {}) => {
  const consultar = conn ? async (sql, params) => (await conn.query(sql, params))[0] : query;
  const [curso] = await consultar(
    `SELECT cu.id, cu.activo, cu.intensidad_horaria, cu.prefijo_codigo, nf.codigo AS nivelCodigo,
            nf.nombre AS nivelNombre, nf.intensidad_minima_horas, ta.codigo AS actividadCodigo
       FROM cursos cu
       LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
       JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id
      WHERE cu.id = ?`,
    [cursoId],
  );
  if (!curso) throw badRequest('El curso no existe');
  if (!curso.activo && !permitirInactivo) {
    throw badRequest('El curso está inactivo y no admite nuevas emisiones');
  }
  return curso;
};

const validarIntensidadYFechas = (curso, intensidad, { fechaExpedicion, fechaVencimiento }) => {
  const minimo =
    curso.actividadCodigo === TIPOS_ACTIVIDAD.REENTRENAMIENTO
      ? REENTRENAMIENTO_MIN_HORAS
      : curso.intensidad_minima_horas;
  if (minimo && intensidad < minimo) {
    throw badRequest(`La intensidad horaria mínima para este curso es ${minimo} horas (Res. 4272 de 2021)`);
  }
  if (fechaVencimiento < fechaExpedicion) {
    throw badRequest('La fecha de vencimiento no puede ser anterior a la fecha de expedición');
  }
};

const validarFechasFormacion = ({ fechaInicioFormacion, fechaFinFormacion }) => {
  if (fechaInicioFormacion && fechaFinFormacion && fechaFinFormacion < fechaInicioFormacion) {
    throw badRequest('La fecha final de la formación no puede ser anterior a la inicial');
  }
};

const COLUMNAS_PLANTILLA = {
  empresa: 'empresa',
  nit_empresa: 'nitEmpresa',
  representante_legal: 'representanteLegal',
  documento_representante: 'documentoRepresentante',
  arl: 'arl',
  fecha_inicio_formacion: 'fechaInicioFormacion',
  fecha_fin_formacion: 'fechaFinFormacion',
  entrenador: 'entrenador',
};

const valoresPlantilla = (datos) => Object.values(COLUMNAS_PLANTILLA).map((campo) => datos[campo] ?? null);

const esDuplicadoDe = (error, indice) =>
  error.code === 'ER_DUP_ENTRY' && String(error.sqlMessage ?? error.message).includes(indice);

const NUMERO_DUPLICADO = 'Ya existe un certificado con ese número de certificado';

// Consecutivo anual por curso. La fila queda bloqueada hasta el fin de la transacción, así dos
// emisiones simultáneas no obtienen el mismo número y un fallo posterior no consume el consecutivo.
const siguienteConsecutivo = async (conn, cursoId, anio) => {
  await conn.query(
    `INSERT INTO consecutivos_certificado (curso_id, anio, ultimo) VALUES (?, ?, LAST_INSERT_ID(1))
     ON DUPLICATE KEY UPDATE ultimo = LAST_INSERT_ID(ultimo + 1)`,
    [cursoId, anio],
  );
  const [[{ consecutivo }]] = await conn.query('SELECT LAST_INSERT_ID() AS consecutivo');
  return Number(consecutivo);
};

export const emitir = async (datos, usuario) => {
  const [persona] = await query('SELECT id, activo FROM personas_certificadas WHERE id = ?', [
    datos.personaId,
  ]);
  if (!persona) throw badRequest('La persona certificada no existe');
  if (!persona.activo) throw badRequest('La persona certificada está inactiva');

  const curso = await cargarCurso(datos.cursoId);
  const intensidad = datos.intensidadHoraria ?? curso.intensidad_horaria;
  validarIntensidadYFechas(curso, intensidad, datos);
  validarFechasFormacion(datos);

  // Evita emitir dos veces el mismo curso cuando la empresa reenvía a la persona.
  if (!datos.confirmarDuplicado) {
    const [vigente] = await query(
      `SELECT c.numero_certificado AS numero, DATE_FORMAT(c.fecha_expedicion, '%d/%m/%Y') AS expedicion
         FROM certificados c
        WHERE c.persona_id = ? AND c.curso_id = ? AND ${estadoEfectivoSql('c')} = 'VIGENTE'
        ORDER BY c.fecha_expedicion DESC LIMIT 1`,
      [datos.personaId, datos.cursoId],
    );
    if (vigente) {
      throw conflict(
        `La persona ya tiene un certificado vigente de este curso (${vigente.numero}, expedido el ${vigente.expedicion}). Confirme si debe emitirse otro.`,
      );
    }
  }

  const id = await withTransaction(async (conn) => {
    const [[{ hoy }]] = await conn.query('SELECT CURDATE() AS hoy');
    const estadoInicial = datos.fechaVencimiento < hoy ? ESTADOS.VENCIDO : ESTADOS.VIGENTE;
    const [[config]] = await conn.query(
      'SELECT url_base_publica FROM configuracion_centro ORDER BY id LIMIT 1',
    );
    const baseUrl = (config?.url_base_publica || env.publicVerifyBaseUrl).replace(/\/+$/, '');
    const anio = datos.fechaExpedicion.slice(0, 4);

    let insertId;
    let codigo;
    for (let intento = 0; intento < 5 && !insertId; intento += 1) {
      codigo = generarCodigoVerificacion();
      try {
        // Sin número manual, numero_certificado temporal = código (único); luego se asigna el consecutivo por id.
        const [result] = await conn.query(
          `INSERT INTO certificados
             (persona_id, curso_id, emitido_por_usuario_id, numero_certificado, codigo_verificacion,
              url_verificacion, fecha_expedicion, fecha_vencimiento, intensidad_horaria, estado,
              ${Object.keys(COLUMNAS_PLANTILLA).join(', ')})
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            datos.personaId, datos.cursoId, usuario.id, datos.numeroCertificado ?? codigo, codigo,
            `${baseUrl}/${codigo}`, datos.fechaExpedicion,
            datos.fechaVencimiento, intensidad, estadoInicial,
            ...valoresPlantilla(datos),
          ],
        );
        insertId = result.insertId;
      } catch (error) {
        if (esDuplicadoDe(error, 'uk_certificados_numero')) throw conflict(NUMERO_DUPLICADO);
        if (!esDuplicadoDe(error, 'uk_certificados_codigo')) throw error;
      }
    }
    if (!insertId) throw conflict('No fue posible generar un código único; intente de nuevo');

    if (!datos.numeroCertificado) {
      const numero = curso.prefijo_codigo
        ? formatearCodigoCurso({
            prefijo: curso.prefijo_codigo,
            anio,
            consecutivo: await siguienteConsecutivo(conn, curso.id, anio),
          })
        : formatearNumeroCertificado({
            id: insertId,
            codigoNivel: curso.nivelCodigo,
            codigoActividad: curso.actividadCodigo,
            anio,
          });
      try {
        await conn.query('UPDATE certificados SET numero_certificado = ? WHERE id = ?', [numero, insertId]);
      } catch (error) {
        if (esDuplicadoDe(error, 'uk_certificados_numero')) throw conflict(`El código ${numero} ya está en uso`);
        throw error;
      }
    }
    await registrarHistorial(conn, {
      certificadoId: insertId,
      usuarioId: usuario.id,
      anterior: null,
      nuevo: estadoInicial,
      observacion: `Emisión del certificado (código de verificación ${codigo})`,
    });
    return insertId;
  });

  return obtenerDetalle(id);
};

const CAMPOS_EDITABLES = {
  numero_certificado: 'número de certificado',
  curso_id: 'curso',
  intensidad_horaria: 'intensidad horaria',
  fecha_expedicion: 'fecha de expedición',
  fecha_vencimiento: 'fecha de vencimiento',
  empresa: 'empresa',
  nit_empresa: 'NIT de la empresa',
  representante_legal: 'representante legal',
  documento_representante: 'documento del representante',
  arl: 'ARL',
  fecha_inicio_formacion: 'fecha de inicio de la formación',
  fecha_fin_formacion: 'fecha de fin de la formación',
  entrenador: 'entrenador',
};

// Edición de datos (solo Administrador). El código de verificación y la persona no cambian.
export const actualizar = async (id, datos, usuario) => {
  await withTransaction(async (conn) => {
    const [[actual]] = await conn.query(
      `SELECT c.id, c.estado, c.numero_certificado, c.curso_id, c.intensidad_horaria,
              c.fecha_expedicion, c.fecha_vencimiento, ${Object.keys(COLUMNAS_PLANTILLA).join(', ')},
              ${estadoEfectivoSql('c')} AS efectivo
         FROM certificados c WHERE c.id = ? FOR UPDATE`,
      [id],
    );
    if (!actual) throw notFound('Certificado no encontrado');
    if (actual.estado === ESTADOS.ANULADO) throw conflict('Un certificado anulado no puede editarse');

    const curso = await cargarCurso(datos.cursoId, { permitirInactivo: datos.cursoId === actual.curso_id, conn });
    validarIntensidadYFechas(curso, datos.intensidadHoraria, datos);
    validarFechasFormacion(datos);

    const nuevos = {
      numero_certificado: datos.numeroCertificado ?? actual.numero_certificado,
      curso_id: datos.cursoId,
      intensidad_horaria: datos.intensidadHoraria,
      fecha_expedicion: datos.fechaExpedicion,
      fecha_vencimiento: datos.fechaVencimiento,
      ...Object.fromEntries(Object.entries(COLUMNAS_PLANTILLA).map(([col, campo]) => [col, datos[campo] ?? null])),
    };
    const cambios = Object.keys(CAMPOS_EDITABLES).filter(
      (campo) => String(nuevos[campo] ?? '') !== String(actual[campo] ?? ''),
    );
    if (cambios.length === 0) return;

    const [[{ hoy }]] = await conn.query('SELECT CURDATE() AS hoy');
    const vencido = nuevos.fecha_vencimiento < hoy;
    const estado =
      actual.estado === ESTADOS.SUSPENDIDO ? ESTADOS.SUSPENDIDO : vencido ? ESTADOS.VENCIDO : ESTADOS.VIGENTE;

    try {
      await conn.query(
        `UPDATE certificados
            SET ${Object.keys(nuevos).map((col) => `${col} = ?`).join(', ')}, estado = ?
          WHERE id = ?`,
        [...Object.values(nuevos), estado, id],
      );
    } catch (error) {
      if (esDuplicadoDe(error, 'uk_certificados_numero')) throw conflict(NUMERO_DUPLICADO);
      throw error;
    }

    const detalle = cambios.map((campo) => CAMPOS_EDITABLES[campo]).join(', ');
    await registrarHistorial(conn, {
      certificadoId: id,
      usuarioId: usuario.id,
      anterior: actual.efectivo,
      nuevo: estado,
      observacion: `Edición de datos: ${detalle}${datos.observacion ? `. ${datos.observacion}` : ''}`,
    });
  });
  return obtenerDetalle(id);
};

const bloquear = async (conn, id) => {
  const [[row]] = await conn.query(
    `SELECT c.id, c.estado, c.numero_certificado, ${estadoEfectivoSql('c')} AS efectivo,
            (c.fecha_vencimiento < CURDATE()) AS vencido
       FROM certificados c WHERE c.id = ? FOR UPDATE`,
    [id],
  );
  if (!row) throw notFound('Certificado no encontrado');
  return row;
};

export const suspender = async (id, { observacion }, usuario) => {
  await withTransaction(async (conn) => {
    const cert = await bloquear(conn, id);
    if (cert.efectivo === ESTADOS.ANULADO) throw conflict('Un certificado anulado no puede suspenderse');
    if (cert.efectivo === ESTADOS.SUSPENDIDO) throw conflict('El certificado ya está suspendido');

    await conn.query(
      "UPDATE certificados SET estado = 'SUSPENDIDO', observacion_suspension = ? WHERE id = ?",
      [observacion, id],
    );
    await registrarHistorial(conn, {
      certificadoId: id, usuarioId: usuario.id, anterior: cert.efectivo,
      nuevo: ESTADOS.SUSPENDIDO, observacion,
    });
  });
  return obtenerDetalle(id);
};

export const reactivar = async (id, { observacion }, usuario) => {
  await withTransaction(async (conn) => {
    const cert = await bloquear(conn, id);
    if (cert.estado !== ESTADOS.SUSPENDIDO) throw conflict('Solo se pueden reactivar certificados suspendidos');

    const nuevo = cert.vencido ? ESTADOS.VENCIDO : ESTADOS.VIGENTE;
    await conn.query(
      'UPDATE certificados SET estado = ?, observacion_suspension = NULL WHERE id = ?',
      [nuevo, id],
    );
    await registrarHistorial(conn, {
      certificadoId: id, usuarioId: usuario.id, anterior: ESTADOS.SUSPENDIDO, nuevo,
      observacion: observacion || 'Reactivación del certificado',
    });
  });
  return obtenerDetalle(id);
};

export const anular = async (id, { motivo, confirmacionNumero }, usuario) => {
  await withTransaction(async (conn) => {
    const cert = await bloquear(conn, id);
    if (cert.estado === ESTADOS.ANULADO) throw conflict('El certificado ya está anulado');
    if (confirmacionNumero.trim().toUpperCase() !== cert.numero_certificado) {
      throw badRequest('El número de confirmación no coincide con el número del certificado');
    }

    await conn.query("UPDATE certificados SET estado = 'ANULADO' WHERE id = ?", [id]);
    await conn.query(
      'INSERT INTO anulaciones (certificado_id, anulado_por_usuario_id, motivo) VALUES (?, ?, ?)',
      [id, usuario.id, motivo],
    );
    await registrarHistorial(conn, {
      certificadoId: id, usuarioId: usuario.id, anterior: cert.efectivo,
      nuevo: ESTADOS.ANULADO, observacion: 'Anulación registrada por el Administrador',
    });
  });
  return obtenerDetalle(id);
};
