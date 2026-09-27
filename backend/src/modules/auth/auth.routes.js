import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { query } from '../../config/db.js';
import { authenticate } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { badRequest, unauthorized } from '../../utils/http-error.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
});

const loginSchema = z.object({
  correo: z.email('Correo inválido').trim().toLowerCase(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const toPublicUser = (u) => ({
  id: u.id,
  nombres: u.nombres,
  apellidos: u.apellidos,
  correo: u.correo,
  rol: u.rol,
  personaId: u.persona_id ?? null,
});

router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  const { correo, password } = req.body;
  const [usuario] = await query(
    `SELECT u.id, u.nombres, u.apellidos, u.correo, u.password_hash, u.activo, u.persona_id,
            r.codigo AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
      WHERE u.correo = ?`,
    [correo],
  );

  // Mensaje genérico: no revela si el correo existe (HU-01).
  const valid = usuario?.activo && (await bcrypt.compare(password, usuario.password_hash));
  if (!valid) throw unauthorized('Correo o contraseña incorrectos');

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
