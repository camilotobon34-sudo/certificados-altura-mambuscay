import { ZodError } from 'zod';
import { env } from '../config/env.js';
import { HttpError } from '../utils/http-error.js';

export const notFoundHandler = (req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensaje: issue.message,
      })),
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, details: err.details });
  }

  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'Ya existe un registro con esos datos únicos' });
  }

  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es JSON válido' });
  }

  if (['ER_USER_LIMIT_REACHED', 'ER_TOO_MANY_USER_CONNECTIONS', 'ER_CON_COUNT_ERROR'].includes(err?.code)) {
    console.error('[db]', err.message);
    return res.status(503).json({ error: 'El servicio está ocupado. Intente de nuevo en unos segundos.' });
  }

  if (err?.code === 'ECONNREFUSED' || err?.code === 'ER_BAD_DB_ERROR') {
    console.error('[db]', err.message);
    return res.status(503).json({ error: 'Base de datos no disponible' });
  }

  console.error(err);
  return res.status(500).json({
    error: 'Error interno del servidor',
    ...(env.isProduction ? {} : { detalle: err?.message }),
  });
};
