import { Router } from 'express';
import { z } from 'zod';
import { authorize } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { ESTADOS, ROLES } from '../../utils/constants.js';
import { parsePagination } from '../../utils/pagination.js';
import * as service from './certificados.service.js';

const router = Router();

const fecha = (mensaje) => z.iso.date(mensaje);

const filtrosSchema = z.object({
  q: z.string().trim().max(100).optional(),
  estado: z.enum(Object.values(ESTADOS)).optional(),
  cursoId: z.coerce.number().int().positive().optional(),
  personaId: z.coerce.number().int().positive().optional(),
  desde: fecha('Fecha "desde" inválida').optional(),
  hasta: fecha('Fecha "hasta" inválida').optional(),
});

// Opcional: si se omite, el sistema asigna el consecutivo MAM-{nivel}-{año}-{id}.
const numeroCertificado = z
  .string()
  .trim()
  .toUpperCase()
  .optional()
  .nullable()
  .transform((v) => v || undefined)
  .pipe(
    z
      .string()
      .regex(/^[A-Z0-9][A-Z0-9-]{2,49}$/, 'Número de certificado inválido (letras, números y guiones)')
      .optional(),
  );

const textoOpcional = (max) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .nullable()
    .transform((v) => v || null);

const fechaOpcional = (mensaje) =>
  z
    .string()
    .optional()
    .nullable()
    .transform((v) => v || null)
    .pipe(z.iso.date(mensaje).nullable());

// Datos que imprime la plantilla oficial del curso.
const datosPlantilla = {
  empresa: textoOpcional(200),
  nitEmpresa: textoOpcional(30),
  representanteLegal: textoOpcional(150),
  documentoRepresentante: textoOpcional(30),
  arl: textoOpcional(100),
  fechaInicioFormacion: fechaOpcional('Fecha de inicio de la formación inválida'),
  fechaFinFormacion: fechaOpcional('Fecha de fin de la formación inválida'),
  entrenador: textoOpcional(150),
};

const emitirSchema = z.object({
  personaId: z.coerce.number().int().positive('Seleccione la persona certificada'),
  cursoId: z.coerce.number().int().positive('Seleccione el curso'),
  fechaExpedicion: fecha('Fecha de expedición inválida'),
  fechaVencimiento: fecha('Fecha de vencimiento inválida'),
  intensidadHoraria: z.coerce.number().int().positive().optional(),
  numeroCertificado,
  confirmarDuplicado: z.boolean().optional().default(false),
  ...datosPlantilla,
});

const actualizarSchema = z.object({
  cursoId: z.coerce.number().int().positive('Seleccione el curso'),
  fechaExpedicion: fecha('Fecha de expedición inválida'),
  fechaVencimiento: fecha('Fecha de vencimiento inválida'),
  intensidadHoraria: z.coerce.number().int().positive('La intensidad horaria debe ser mayor a 0'),
  numeroCertificado,
  observacion: z.string().trim().max(500).optional(),
  ...datosPlantilla,
});

const suspenderSchema = z.object({
  observacion: z.string().trim().min(5, 'La observación es obligatoria (mínimo 5 caracteres)').max(1000),
});

const reactivarSchema = z.object({
  observacion: z.string().trim().max(1000).optional(),
});

const anularSchema = z.object({
  motivo: z.string().trim().min(10, 'El motivo es obligatorio (mínimo 10 caracteres)').max(2000),
  confirmacionNumero: z.string().trim().min(1, 'Escriba el número del certificado para confirmar'),
});

const idParam = (req) => Number.parseInt(req.params.id, 10);

router.get('/', validate(filtrosSchema, 'query'), async (req, res) => {
  res.json(await service.listar(req.validated.query, parsePagination(req.query)));
});

router.get('/resumen', async (_req, res) => {
  res.json(await service.resumen());
});

router.get('/empresas', async (_req, res) => {
  res.json({ items: await service.empresasUsadas() });
});

router.get('/:id', async (req, res) => {
  res.json(await service.obtenerDetalle(idParam(req)));
});

router.post('/', validate(emitirSchema), async (req, res) => {
  res.status(201).json(await service.emitir(req.body, req.user));
});

router.put('/:id', authorize(ROLES.ADMIN), validate(actualizarSchema), async (req, res) => {
  res.json(await service.actualizar(idParam(req), req.body, req.user));
});

router.post('/:id/suspender', validate(suspenderSchema), async (req, res) => {
  res.json(await service.suspender(idParam(req), req.body, req.user));
});

router.post('/:id/reactivar', validate(reactivarSchema), async (req, res) => {
  res.json(await service.reactivar(idParam(req), req.body, req.user));
});

// RF-12 / HU-14: la anulación está restringida al Administrador y exige motivo.
router.post('/:id/anular', authorize(ROLES.ADMIN), validate(anularSchema), async (req, res) => {
  res.json(await service.anular(idParam(req), req.body, req.user));
});

export default router;
