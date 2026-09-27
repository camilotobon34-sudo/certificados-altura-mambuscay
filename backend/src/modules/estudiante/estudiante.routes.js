import { Router } from 'express';
import { query } from '../../config/db.js';
import { estadoEfectivoSql } from '../../utils/constants.js';
import { forbidden, notFound } from '../../utils/http-error.js';
import { obtenerDetalle } from '../certificados/certificados.service.js';

const router = Router();

// RF-17 / HU-06: la persona certificada solo ve sus propios certificados.
router.use((req, _res, next) => {
  if (!req.user.persona_id) throw forbidden('Su cuenta no está vinculada a una persona certificada');
  next();
});

router.get('/certificados', async (req, res) => {
  const items = await query(
    `SELECT c.id, c.numero_certificado AS numeroCertificado,
            c.codigo_verificacion AS codigoVerificacion, c.url_verificacion AS urlVerificacion,
            c.fecha_expedicion AS fechaExpedicion, c.fecha_vencimiento AS fechaVencimiento,
            c.intensidad_horaria AS intensidadHoraria, ${estadoEfectivoSql('c')} AS estado,
            cu.nombre AS curso, nf.nombre AS nivel, ta.nombre AS tipoActividad,
            ta.codigo AS tipoActividadCodigo
       FROM certificados c
       JOIN cursos cu ON cu.id = c.curso_id
       LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
       JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id
      WHERE c.persona_id = ?
      ORDER BY c.fecha_expedicion DESC`,
    [req.user.persona_id],
  );
  res.json({ items });
});

router.get('/certificados/:id', async (req, res) => {
  const [propio] = await query('SELECT id FROM certificados WHERE id = ? AND persona_id = ?', [
    req.params.id,
    req.user.persona_id,
  ]);
  if (!propio) throw notFound('Certificado no encontrado');
  res.json(await obtenerDetalle(propio.id, { incluirInterno: false }));
});

export default router;
