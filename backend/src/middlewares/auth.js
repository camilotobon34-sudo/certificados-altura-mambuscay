import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { query } from '../config/db.js';
import { forbidden, unauthorized } from '../utils/http-error.js';

export const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) throw unauthorized();

  let payload;
  try {
    payload = jwt.verify(token, env.jwt.secret);
  } catch {
    throw unauthorized('La sesión expiró o no es válida');
  }

  // Se consulta en cada petición para respetar desactivaciones y cambios de rol.
  const [usuario] = await query(
    `SELECT u.id, u.nombres, u.apellidos, u.correo, u.activo, u.persona_id, r.codigo AS rol
       FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
      WHERE u.id = ?`,
    [payload.sub],
  );
  if (!usuario || !usuario.activo) throw unauthorized('Usuario inactivo o inexistente');

  req.user = usuario;
  next();
};

export const authorize =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) throw forbidden();
    next();
  };
