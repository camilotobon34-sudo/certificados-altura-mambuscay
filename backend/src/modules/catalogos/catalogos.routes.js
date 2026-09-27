import { Router } from 'express';
import { query } from '../../config/db.js';

const router = Router();

router.get('/', async (_req, res) => {
  const [roles, tiposDocumento, niveles, tiposActividad] = await Promise.all([
    query('SELECT id, codigo, nombre, descripcion FROM roles ORDER BY id'),
    query('SELECT id, codigo, nombre FROM tipos_documento ORDER BY id'),
    query(
      `SELECT id, codigo, nombre, intensidad_minima_horas, descripcion, es_nivel_normativo, activo
         FROM niveles_formacion ORDER BY intensidad_minima_horas`,
    ),
    query('SELECT id, codigo, nombre, descripcion FROM tipos_actividad ORDER BY id'),
  ]);
  res.json({ roles, tiposDocumento, niveles, tiposActividad });
});

export default router;
