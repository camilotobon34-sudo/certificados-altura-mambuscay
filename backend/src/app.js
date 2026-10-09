import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { z } from 'zod';
import { env } from './config/env.js';
import { query } from './config/db.js';
import { authenticate, authorize } from './middlewares/auth.js';
import { errorHandler, notFoundHandler } from './middlewares/error-handler.js';
import { ROLES } from './utils/constants.js';
import authRoutes from './modules/auth/auth.routes.js';
import publicRoutes from './modules/public/public.routes.js';
import catalogosRoutes from './modules/catalogos/catalogos.routes.js';
import personasRoutes from './modules/personas/personas.routes.js';
import cursosRoutes from './modules/cursos/cursos.routes.js';
import certificadosRoutes from './modules/certificados/certificados.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import estudianteRoutes from './modules/estudiante/estudiante.routes.js';
import configuracionRoutes from './modules/configuracion/configuracion.routes.js';
import reportesRoutes from './modules/reportes/reportes.routes.js';

z.config(z.locales.es());

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/api/health', async (_req, res) => {
    let database = 'ok';
    try {
      await query('SELECT 1');
    } catch {
      database = 'no disponible';
    }
    res.json({ status: 'ok', database, time: new Date().toISOString() });
  });

  const internos = [authenticate, authorize(ROLES.ADMIN, ROLES.PERSONAL)];

  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/catalogos', authenticate, catalogosRoutes);
  app.use('/api/personas', ...internos, personasRoutes);
  app.use('/api/cursos', ...internos, cursosRoutes);
  app.use('/api/certificados', ...internos, certificadosRoutes);
  app.use('/api/configuracion', ...internos, configuracionRoutes);
  app.use('/api/usuarios', authenticate, authorize(ROLES.ADMIN), usuariosRoutes);
  app.use('/api/reportes', authenticate, authorize(ROLES.ADMIN), reportesRoutes);
  app.use('/api/estudiante', authenticate, authorize(ROLES.ESTUDIANTE), estudianteRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
