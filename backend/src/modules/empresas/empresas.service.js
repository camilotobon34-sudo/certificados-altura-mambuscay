import { query } from '../../config/db.js';
import { conflict, notFound } from '../../utils/http-error.js';

const SELECT = `SELECT id, nombre AS empresa, nit AS nitEmpresa,
  representante_legal AS representanteLegal, documento_representante AS documentoRepresentante,
  arl, activo, creado_en AS creadoEn, actualizado_en AS actualizadoEn
  FROM empresas_empleadoras`;

const claveNombre = (nombre) => String(nombre ?? '').trim().replace(/\s+/g, ' ').toUpperCase();

const deFilaCertificado = (fila) => ({
  empresa: fila.empresa,
  nitEmpresa: fila.nitEmpresa ?? fila.nit_empresa ?? '',
  representanteLegal: fila.representanteLegal ?? fila.representante_legal ?? '',
  documentoRepresentante: fila.documentoRepresentante ?? fila.documento_representante ?? '',
  arl: fila.arl ?? '',
});

export const listar = async () =>
  query(`${SELECT} WHERE activo = 1 ORDER BY nombre`);

export const obtener = async (id) => {
  const [empresa] = await query(`${SELECT} WHERE id = ?`, [id]);
  if (!empresa) throw notFound('Empresa no encontrada');
  return empresa;
};

const ejecutarGuardar = async ({ nombre, nit, representanteLegal, documentoRepresentante, arl, id }) => {
  const empresa = claveNombre(nombre);
  if (!empresa) throw conflict('Ingrese el nombre de la empresa');
  if (/mambuscay/i.test(empresa)) throw conflict('Altura Mambuscay es el centro, no el empleador');
  const valores = [empresa, nit || null, representanteLegal || null, documentoRepresentante || null, arl || null];
  try {
    if (id) {
      await query(
        `UPDATE empresas_empleadoras
            SET nombre = ?, nit = ?, representante_legal = ?, documento_representante = ?, arl = ?, activo = 1
          WHERE id = ?`,
        [...valores, id],
      );
      return obtener(id);
    }
    const result = await query(
      `INSERT INTO empresas_empleadoras (nombre, nit, representante_legal, documento_representante, arl)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         nit = COALESCE(VALUES(nit), nit),
         representante_legal = COALESCE(VALUES(representante_legal), representante_legal),
         documento_representante = COALESCE(VALUES(documento_representante), documento_representante),
         arl = COALESCE(VALUES(arl), arl),
         activo = 1`,
      valores,
    );
    const insertId = result.insertId || (await query('SELECT id FROM empresas_empleadoras WHERE nombre = ?', [empresa]))[0]?.id;
    return obtener(insertId);
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') throw conflict('Esa empresa ya está registrada');
    throw error;
  }
};

export const crear = (body) =>
  ejecutarGuardar({
    nombre: body.empresa ?? body.nombre,
    nit: body.nitEmpresa ?? body.nit,
    representanteLegal: body.representanteLegal,
    documentoRepresentante: body.documentoRepresentante,
    arl: body.arl,
  });

export const actualizar = (id, body) =>
  ejecutarGuardar({
    id,
    nombre: body.empresa ?? body.nombre,
    nit: body.nitEmpresa ?? body.nit,
    representanteLegal: body.representanteLegal,
    documentoRepresentante: body.documentoRepresentante,
    arl: body.arl,
  });

export const desactivar = async (id) => {
  await obtener(id);
  await query('UPDATE empresas_empleadoras SET activo = 0 WHERE id = ?', [id]);
};

export const guardarDesdeCertificado = async (datos) => {
  const nombre = claveNombre(datos.empresa);
  if (!nombre || /mambuscay/i.test(nombre)) return;
  await ejecutarGuardar({
    nombre,
    nit: datos.nitEmpresa,
    representanteLegal: datos.representanteLegal,
    documentoRepresentante: datos.documentoRepresentante,
    arl: datos.arl,
  });
};

export const listarParaEmision = async () => {
  const [catalogo, deCerts] = await Promise.all([
    query(`${SELECT} WHERE activo = 1`),
    query(
      `SELECT empresa, nit_empresa AS nitEmpresa, representante_legal AS representanteLegal,
              documento_representante AS documentoRepresentante, arl
         FROM certificados
        WHERE empresa IS NOT NULL AND empresa <> '' AND empresa NOT LIKE '%mambuscay%'
        ORDER BY id DESC
        LIMIT 2000`,
    ),
  ]);
  const vistas = new Map();
  for (const fila of deCerts) {
    const clave = claveNombre(fila.empresa);
    if (clave && !vistas.has(clave)) vistas.set(clave, deFilaCertificado(fila));
  }
  for (const fila of catalogo) vistas.set(claveNombre(fila.empresa), deFilaCertificado(fila));
  return [...vistas.values()].sort((a, b) => a.empresa.localeCompare(b.empresa, 'es'));
};
