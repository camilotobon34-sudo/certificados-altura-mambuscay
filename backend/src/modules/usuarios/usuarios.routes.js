import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { validate } from '../../middlewares/validate.js';
import { ROLES } from '../../utils/constants.js';
import { normalizarNumeroDocumento } from '../../utils/documentos.js';
import { badRequest, conflict, notFound } from '../../utils/http-error.js';

const router = Router();

const baseSchema = {
  nombres: z.string().trim().min(2, 'Nombres obligatorios').max(100),
  apellidos: z.string().trim().min(2, 'Apellidos obligatorios').max(100),
  correo: z.union([z.email('Correo inválido').trim().toLowerCase(), z.literal('').transform(() => null)]).nullish(),
  tipoDocumentoId: z.coerce.number().int().positive().nullish(),
  numeroDocumento: z.string().max(40).transform(normalizarNumeroDocumento).nullish(),
  rolId: z.coerce.number().int().positive('Seleccione el rol'),
  personaId: z.coerce.number().int().positive().nullable().optional(),
  activo: z.boolean().optional().default(true),
};

const password = z.string().min(10, 'La contraseña debe tener al menos 10 caracteres').max(128);

const crearSchema = z.object({ ...baseSchema, password });
const actualizarSchema = z.object({
  ...baseSchema,
  password: z.union([password, z.literal('')]).optional(),
});

const SELECT_USUARIO = `
  SELECT u.id, u.nombres, u.apellidos, u.correo, u.activo, u.rol_id AS rolId,
         u.tipo_documento_id AS tipoDocumentoId, td.codigo AS tipoDocumento,
         u.numero_documento AS numeroDocumento,
         r.codigo AS rol, r.nombre AS rolNombre, u.persona_id AS personaId,
         CONCAT(p.nombres, ' ', p.apellidos) AS persona, u.creado_en AS creadoEn
    FROM usuarios u
    JOIN roles r ON r.id = u.rol_id
    LEFT JOIN tipos_documento td ON td.id = u.tipo_documento_id
    LEFT JOIN personas_certificadas p ON p.id = u.persona_id`;

// Un cliente ingresa con el documento de su persona certificada; los demás roles lo registran aquí.
const resolverRol = async ({ rolId, personaId, tipoDocumentoId, numeroDocumento }) => {
  const [rol] = await query('SELECT codigo FROM roles WHERE id = ?', [rolId]);
  if (!rol) throw badRequest('Rol inexistente');
  if (rol.codigo === ROLES.ESTUDIANTE) {
    if (!personaId) throw badRequest('Un usuario cliente debe estar vinculado a una persona certificada');
    const [persona] = await query(
      'SELECT id, tipo_documento_id, numero_documento FROM personas_certificadas WHERE id = ?',
      [personaId],
    );
    if (!persona) throw badRequest('La persona certificada no existe');
    return {
      rol: rol.codigo,
      personaId,
      tipoDocumentoId: persona.tipo_documento_id,
      numeroDocumento: persona.numero_documento,
    };
  }

  if (!tipoDocumentoId) throw badRequest('Seleccione el tipo de identificación');
  if (!/^[A-Z0-9]{3,30}$/.test(numeroDocumento ?? '')) {
    throw badRequest('Número de identificación inválido (solo letras y números)');
  }
  const [tipo] = await query('SELECT id FROM tipos_documento WHERE id = ?', [tipoDocumentoId]);
  if (!tipo) throw badRequest('Tipo de identificación inexistente');
  return { rol: rol.codigo, personaId: null, tipoDocumentoId, numeroDocumento };
};

const conDuplicados = async (operacion) => {
  try {
    return await operacion();
  } catch (err) {
    if (err?.code !== 'ER_DUP_ENTRY') throw err;
    if (err.message.includes('uk_usuarios_documento')) throw conflict('Ya existe un usuario con ese documento');
    if (err.message.includes('correo')) throw conflict('Ya existe un usuario con ese correo');
    throw err;
  }
};

const contarAdminsActivos = async (excluirId) => {
  const [{ total }] = await query(
    `SELECT COUNT(*) AS total FROM usuarios u JOIN roles r ON r.id = u.rol_id
      WHERE r.codigo = 'ADMIN' AND u.activo = 1 AND u.id <> ?`,
    [excluirId],
  );
  return Number(total);
};

router.get('/', async (_req, res) => {
  res.json({ items: await query(`${SELECT_USUARIO} ORDER BY u.activo DESC, u.apellidos, u.nombres`) });
});

router.get('/:id', async (req, res) => {
  const [usuario] = await query(`${SELECT_USUARIO} WHERE u.id = ?`, [req.params.id]);
  if (!usuario) throw notFound('Usuario no encontrado');
  res.json({ usuario });
});

router.post('/', validate(crearSchema), async (req, res) => {
  const u = req.body;
  const { personaId, tipoDocumentoId, numeroDocumento } = await resolverRol(u);
  const hash = await bcrypt.hash(u.password, 12);
  const result = await conDuplicados(() =>
    query(
      `INSERT INTO usuarios
         (rol_id, persona_id, tipo_documento_id, numero_documento, nombres, apellidos, correo, password_hash, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.rolId, personaId, tipoDocumentoId, numeroDocumento, u.nombres, u.apellidos, u.correo ?? null, hash, u.activo],
    ),
  );
  const [usuario] = await query(`${SELECT_USUARIO} WHERE u.id = ?`, [result.insertId]);
  res.status(201).json({ usuario });
});

router.put('/:id', validate(actualizarSchema), async (req, res) => {
  const id = Number.parseInt(req.params.id, 10);
  const u = req.body;
  const [actual] = await query(`${SELECT_USUARIO} WHERE u.id = ?`, [id]);
  if (!actual) throw notFound('Usuario no encontrado');

  const { rol, personaId, tipoDocumentoId, numeroDocumento } = await resolverRol(u);
  const dejaDeSerAdminActivo = actual.rol === ROLES.ADMIN && actual.activo && (rol !== ROLES.ADMIN || !u.activo);
  if (dejaDeSerAdminActivo && (await contarAdminsActivos(id)) === 0) {
    throw conflict('Debe existir al menos un Administrador activo');
  }
  if (id === req.user.id && !u.activo) throw conflict('No puede desactivar su propia cuenta');

  const campos = [
    'rol_id = ?',
    'persona_id = ?',
    'tipo_documento_id = ?',
    'numero_documento = ?',
    'nombres = ?',
    'apellidos = ?',
    'correo = ?',
    'activo = ?',
  ];
  const params = [u.rolId, personaId, tipoDocumentoId, numeroDocumento, u.nombres, u.apellidos, u.correo ?? null, u.activo];
  if (u.password) {
    campos.push('password_hash = ?');
    params.push(await bcrypt.hash(u.password, 12));
  }
  await conDuplicados(() => query(`UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`, [...params, id]));

  const [usuario] = await query(`${SELECT_USUARIO} WHERE u.id = ?`, [id]);
  res.json({ usuario });
});

export default router;
