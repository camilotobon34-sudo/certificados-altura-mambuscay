import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { badRequest } from '../../utils/http-error.js';
import * as service from './reportes.service.js';

const router = Router();

const diarioSchema = z.object({
  fecha: z.iso.date('Fecha inválida').optional(),
});

const fechaReporte = (req) => {
  const fecha = req.validated.query.fecha ?? service.hoyBogota();
  if (fecha > service.hoyBogota()) throw badRequest('No se puede generar el reporte de una fecha futura');
  return fecha;
};

router.get('/diario', validate(diarioSchema, 'query'), async (req, res) => {
  res.json(await service.reporteDiario(fechaReporte(req)));
});

router.get('/diario/excel', validate(diarioSchema, 'query'), async (req, res) => {
  const fecha = fechaReporte(req);
  const reporte = await service.reporteDiario(fecha);
  const buffer = await service.reporteDiarioExcel(reporte, `${req.user.nombres} ${req.user.apellidos}`);
  res
    .set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="Reporte-diario-${fecha}.xlsx"`,
      'Cache-Control': 'no-store',
    })
    .send(Buffer.from(buffer));
});

export default router;
