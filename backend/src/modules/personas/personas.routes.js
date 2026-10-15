import { Router } from 'express';
import { z } from 'zod';
import { query, withTransaction } from '../../config/db.js';
import { validate } from '../../middlewares/validate.js';
import { estadoEfectivoSql } from '../../utils/constants.js';
import { badRequest, notFound } from '../../utils/http-error.js';
import { paginated, parsePagination } from '../../utils/pagination.js';

const router = Router();

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const personaSchema = z.object({
  tipoDocumentoId: z.coerce.number().int().positive('Seleccione el tipo de documento'),
  numeroDocumento: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{3,30}$/, 'Número de documento inválido (solo letras y números)'),
  nombres: z.string().trim().min(2, 'Nombres obligatorios').max(100),
  apellidos: z.string().trim().min(2, 'Apellidos obligatorios').max(100),
  correo: z
    .union([z.email('Correo inválido'), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v ? v.toLowerCase() : null)),
  telefono: optionalText(30),
  activo: z.boolean().optional().default(true),
});

const SELECT_PERSONA = `
  SELECT p.id, p.tipo_documento_id AS tipoDocumentoId, td.codigo AS tipoDocumento,
         p.numero_documento AS numeroDocumento, p.nombres, p.apellidos, p.correo, p.telefono,
         p.activo, p.creado_en AS creadoEn, p.actualizado_en AS actualizadoEn
    FROM personas_certificadas p
    JOIN tipos_documento td ON td.id = p.tipo_documento_id`;

router.get('/', async (req, res) => {
  const pagination = parsePagination(req.query);
  const q = String(req.query.q ?? '').trim();
  const where = q
    ? `WHERE p.numero_documento LIKE ? OR CONCAT(p.nombres, ' ', p.apellidos) LIKE ?`
    : '';
  const params = q ? [`%${q}%`, `%${q}%`] : [];

  const [items, [{ total }]] = await Promise.all([
    query(`${SELECT_PERSONA} ${where} ORDER BY p.apellidos, p.nombres LIMIT ? OFFSET ?`, [
      ...params,
      pagination.size,
      pagination.offset,
    ]),
    query(`SELECT COUNT(*) AS total FROM personas_certificadas p ${where}`, params),
  ]);

  res.json(paginated(items, total, pagination));
});

const normalizar = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

// Con trasposición: "1053" y "1035" están a 1, el error típico al digitar un documento.
const distancia = (a, b) => {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
};

// Posibles duplicados por un error al escribir: mismo nombre (o casi) o documento casi igual.
router.get('/parecidas', async (req, res) => {
  const nombre = normalizar(`${req.query.nombres ?? ''} ${req.query.apellidos ?? ''}`);
  const documento = String(req.query.numeroDocumento ?? '').replace(/[\s.-]/g, '').toUpperCase();
  const excluir = Number(req.query.excluir) || 0;
  if (nombre.length < 5 && documento.length < 5) return res.json({ items: [] });

  const personas = await query(
    `SELECT p.id, td.codigo AS tipoDocumento, p.numero_documento AS numeroDocumento, p.nombres, p.apellidos
       FROM personas_certificadas p
       JOIN tipos_documento td ON td.id = p.tipo_documento_id
      WHERE p.id <> ?`,
    [excluir],
  );

  const items = [];
  for (const p of personas) {
    const motivos = [];
    if (nombre.length >= 5) {
      const otro = normalizar(`${p.nombres} ${p.apellidos}`);
      const dist = Math.abs(otro.length - nombre.length) <= 2 ? distancia(nombre, otro) : 3;
      if (dist === 0) motivos.push('Mismo nombre');
      else if (dist <= 2) motivos.push('Nombre casi igual');
    }
    if (documento.length >= 5 && p.numeroDocumento !== documento) {
      const ancho = Math.abs(p.numeroDocumento.length - documento.length) <= 1;
      if (ancho && distancia(documento, p.numeroDocumento) === 1) motivos.push('Documento casi igual');
    }
    if (motivos.length) items.push({ ...p, motivos });
  }
  res.json({ items: items.slice(0, 5) });
});

router.get('/:id', async (req, res) => {
  const [persona] = await query(`${SELECT_PERSONA} WHERE p.id = ?`, [req.params.id]);
  if (!persona) throw notFound('Persona no encontrada');

  const certificados = await query(
    `SELECT c.id, c.numero_certificado AS numeroCertificado, c.curso_id AS cursoId, cu.nombre AS curso,
            nf.nombre AS nivel, c.fecha_expedicion AS fechaExpedicion,
            c.fecha_vencimiento AS fechaVencimiento, ${estadoEfectivoSql('c')} AS estado,
            c.empresa, c.nit_empresa AS nitEmpresa, c.representante_legal AS representanteLegal,
            c.documento_representante AS documentoRepresentante, c.arl
       FROM certificados c
       JOIN cursos cu ON cu.id = c.curso_id
       LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
      WHERE c.persona_id = ?
      ORDER BY c.fecha_expedicion DESC, c.id DESC`,
    [persona.id],
  );

  res.json({ persona, certificados });
});

const assertTipoDocumento = async (id) => {
  const [tipo] = await query('SELECT id FROM tipos_documento WHERE id = ?', [id]);
  if (!tipo) throw badRequest('Tipo de documento inexistente');
};

router.post('/', validate(personaSchema), async (req, res) => {
  const p = req.body;
  await assertTipoDocumento(p.tipoDocumentoId);
  const result = await query(
    `INSERT INTO personas_certificadas
       (tipo_documento_id, numero_documento, nombres, apellidos, correo, telefono, activo)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [p.tipoDocumentoId, p.numeroDocumento.toUpperCase(), p.nombres, p.apellidos, p.correo, p.telefono, p.activo],
  );
  const [persona] = await query(`${SELECT_PERSONA} WHERE p.id = ?`, [result.insertId]);
  res.status(201).json({ persona });
});

router.put('/:id', validate(personaSchema), async (req, res) => {
  const p = req.body;
  await assertTipoDocumento(p.tipoDocumentoId);
  const numeroDocumento = p.numeroDocumento.toUpperCase();
  // La cuenta de cliente vinculada ingresa con el documento de la persona.
  const result = await withTransaction(async (conn) => {
    const [actualizada] = await conn.execute(
      `UPDATE personas_certificadas
          SET tipo_documento_id = ?, numero_documento = ?, nombres = ?, apellidos = ?,
              correo = ?, telefono = ?, activo = ?
        WHERE id = ?`,
      [p.tipoDocumentoId, numeroDocumento, p.nombres, p.apellidos, p.correo, p.telefono, p.activo, req.params.id],
    );
    await conn.execute('UPDATE usuarios SET tipo_documento_id = ?, numero_documento = ? WHERE persona_id = ?', [
      p.tipoDocumentoId,
      numeroDocumento,
      req.params.id,
    ]);
    return actualizada;
  });
  if (result.affectedRows === 0) throw notFound('Persona no encontrada');
  const [persona] = await query(`${SELECT_PERSONA} WHERE p.id = ?`, [req.params.id]);
  res.json({ persona });
});

export default router;
