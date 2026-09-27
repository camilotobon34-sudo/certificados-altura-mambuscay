import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { ROLES } from '../../utils/constants.js';

const router = Router();

const optional = (max) =>
  z.string().trim().max(max).optional().nullable().transform((v) => (v ? v : null));

const configuracionSchema = z.object({
  razonSocial: z.string().trim().min(3, 'La razón social es obligatoria').max(200),
  nit: optional(30),
  ciudad: optional(100),
  direccion: optional(200),
  telefono: optional(30),
  correo: z
    .union([z.email('Correo inválido'), z.literal('')])
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  urlBasePublica: z.url('URL inválida').max(300),
});

const SELECT_CONFIG = `
  SELECT id, razon_social AS razonSocial, nit, ciudad, direccion, telefono, correo,
         url_base_publica AS urlBasePublica, logo_ruta AS logoRuta, actualizado_en AS actualizadoEn
    FROM configuracion_centro ORDER BY id LIMIT 1`;

router.get('/', async (_req, res) => {
  const [configuracion] = await query(SELECT_CONFIG);
  res.json({ configuracion: configuracion ?? null });
});

router.put('/', authorize(ROLES.ADMIN), validate(configuracionSchema), async (req, res) => {
  const c = req.body;
  await query(
    `UPDATE configuracion_centro
        SET razon_social = ?, nit = ?, ciudad = ?, direccion = ?, telefono = ?, correo = ?,
            url_base_publica = ?
      ORDER BY id LIMIT 1`,
    [c.razonSocial, c.nit, c.ciudad, c.direccion, c.telefono, c.correo, c.urlBasePublica.replace(/\/+$/, '')],
  );
  const [configuracion] = await query(SELECT_CONFIG);
  res.json({ configuracion });
});

export default router;
