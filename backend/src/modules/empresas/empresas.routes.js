import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middlewares/validate.js';
import { paginated, parsePagination } from '../../utils/pagination.js';
import * as service from './empresas.service.js';

const router = Router();

const optionalText = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null));

const empresaSchema = z.object({
  empresa: z.string().trim().min(2, 'Ingrese el nombre de la empresa').max(200),
  nitEmpresa: optionalText(30),
  representanteLegal: optionalText(150),
  documentoRepresentante: optionalText(30),
  arl: optionalText(100),
});

router.get('/', async (req, res) => {
  const pagination = parsePagination(req.query);
  const q = String(req.query.q ?? '').trim().toUpperCase();
  const items = await service.listar();
  const filtradas = q ? items.filter((e) => `${e.empresa} ${e.nitEmpresa ?? ''}`.includes(q)) : items;
  const slice = filtradas.slice(pagination.offset, pagination.offset + pagination.size);
  res.json(paginated(slice, filtradas.length, pagination));
});

router.get('/:id', async (req, res) => {
  res.json({ empresa: await service.obtener(req.params.id) });
});

router.post('/', validate(empresaSchema), async (req, res) => {
  const empresa = await service.crear(req.body);
  res.status(201).json({ empresa });
});

router.put('/:id', validate(empresaSchema), async (req, res) => {
  res.json({ empresa: await service.actualizar(req.params.id, req.body) });
});

router.delete('/:id', async (req, res) => {
  await service.desactivar(req.params.id);
  res.status(204).end();
});

export default router;
