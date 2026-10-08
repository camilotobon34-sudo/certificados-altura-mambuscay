import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { query } from '../../config/db.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { ROLES } from '../../utils/constants.js';
import { normalizarNumeroDocumento } from '../../utils/documentos.js';
import { badRequest, unauthorized } from '../../utils/http-error.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
});

// Tipo de usuario elegido en la pantalla de ingreso y los roles que admite cada uno.
const TIPOS_USUARIO = {
  ADMINISTRADOR: [ROLES.ADMIN, ROLES.PERSONAL],
  CLIENTE: [ROLES.ESTUDIANTE],
};

const loginSchema = z.object({
  tipoUsuario: z.enum(Object.keys(TIPOS_USUARIO), 'Seleccione el tipo de usuario'),
  tipoDocumento: z.string().trim().toUpperCase().min(1, 'Seleccione el tipo de identificación').max(10),
  numeroDocumento: z
    .string()
    .transform(normalizarNumeroDocumento)
    .pipe(z.string().min(3, 'Ingrese el número de identificación').max(30)),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const toPublicUser = (u) => ({
  id: u.id,
  nombres: u.nombres,
  apellidos: u.apellidos,
  correo: u.correo,
  tipoDocumento: u.tipo_documento ?? null,
  numeroDocumento: u.numero_documento ?? null,
  rol: u.rol,
  personaId: u.persona_id ?? null,
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { tipoUsuario, tipoDocumento, numeroDocumento, password } = req.body;
  const [usuario] = await query(
    `SELECT u.id, u.nombres, u.apellidos, u.correo, u.password_hash, u.activo, u.persona_id,
            td.codigo AS tipo_documento, u.numero_documento, r.codigo AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       JOIN tipos_documento td ON td.id = u.tipo_documento_id
      WHERE td.codigo = ? AND u.numero_documento = ?`,
    [tipoDocumento, numeroDocumento],
  );

  // Mensaje genérico: no revela si el documento existe ni qué tipo de usuario es (HU-01).
  const valid =
    usuario?.activo &&
    TIPOS_USUARIO[tipoUsuario].includes(usuario.rol) &&
    (await bcrypt.compare(password, usuario.password_hash));
  if (!valid) throw unauthorized('Los datos de ingreso no son correctos');

  const token = jwt.sign({ sub: usuario.id, rol: usuario.rol }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });

  res.json({ token, usuario: toPublicUser(usuario) });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ usuario: toPublicUser(req.user) });
});

const cambioPasswordSchema = z
  .object({
    actual: z.string().min(1, 'Ingrese su contraseña actual'),
    nueva: z.string().min(10, 'La nueva contraseña debe tener al menos 10 caracteres').max(128),
  })
  .refine((d) => d.actual !== d.nueva, { path: ['nueva'], message: 'La nueva contraseña debe ser diferente a la actual' });

router.put('/password', loginLimiter, authenticate, validate(cambioPasswordSchema), async (req, res) => {
  const [usuario] = await query('SELECT password_hash FROM usuarios WHERE id = ?', [req.user.id]);
  if (!usuario || !(await bcrypt.compare(req.body.actual, usuario.password_hash))) {
    throw badRequest('La contraseña actual no es correcta');
  }
  await query('UPDATE usuarios SET password_hash = ? WHERE id = ?', [
    await bcrypt.hash(req.body.nueva, 12),
    req.user.id,
  ]);
  res.json({ mensaje: 'Contraseña actualizada' });
});

export default router;
