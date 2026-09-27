import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { validate } from '../../middlewares/validate.js';
import { enmascararDocumento } from '../../utils/codes.js';
import { estadoEfectivoSql } from '../../utils/constants.js';
import { notFound } from '../../utils/http-error.js';

const router = Router();

// RNF-02: limita los intentos para dificultar la enumeración de documentos y códigos.
const consultaLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiadas consultas. Espere un momento e intente de nuevo.' },
});

router.get('/tipos-documento', async (_req, res) => {
  const tipos = await query('SELECT codigo, nombre FROM tipos_documento ORDER BY id');
  res.json({ tipos });
});

// Los números se guardan en mayúsculas y solo con letras y dígitos (ver módulo personas).
const consultaSchema = z.object({
  tipoDocumento: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{1,20}$/, 'Seleccione el tipo de documento'),
  numeroDocumento: z
    .string()
    .transform((v) => v.replace(/[\s.-]/g, '').toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]{3,30}$/, 'Ingrese un número de identificación válido')),
  codigo: z
    .string()
    .transform((v) => v.replace(/\s/g, '').toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9-]{4,64}$/, 'Ingrese el código de verificación del certificado')),
});

const NO_VERIFICADO = 'No fue posible verificar el certificado con los datos ingresados.';

// RF-15 / RF-16: el certificado solo se muestra si tipo de documento, número y código
// corresponden al mismo certificado. Ante cualquier discrepancia la respuesta es idéntica,
// para no revelar si existe la persona o el código.
router.post('/consulta', consultaLimiter, validate(consultaSchema), async (req, res) => {
  const { tipoDocumento, numeroDocumento, codigo } = req.body;

  const [fila] = await query(
    `SELECT c.numero_certificado, c.codigo_verificacion, c.url_verificacion,
            c.fecha_expedicion, c.fecha_vencimiento, c.intensidad_horaria,
            ${estadoEfectivoSql('c')} AS estado, cu.nombre AS curso,
            nf.nombre AS nivel_formacion, ta.nombre AS tipo_actividad,
            cc.razon_social AS centro_formacion,
            CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
            td.codigo AS tipo_documento, td.nombre AS tipo_documento_nombre, p.numero_documento
       FROM certificados c
       JOIN personas_certificadas p ON p.id = c.persona_id
       JOIN tipos_documento td ON td.id = p.tipo_documento_id
       JOIN cursos cu ON cu.id = c.curso_id
       LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
       JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id
       CROSS JOIN (SELECT razon_social FROM configuracion_centro ORDER BY id LIMIT 1) cc
      WHERE c.codigo_verificacion = ? AND td.codigo = ? AND p.numero_documento = ?
      LIMIT 1`,
    [codigo, tipoDocumento, numeroDocumento],
  );

  res.set('Cache-Control', 'no-store');
  if (!fila) throw notFound(NO_VERIFICADO);

  const { numero_documento: numero, ...certificado } = fila;
  res.json({
    certificado: { ...certificado, numero_documento_enmascarado: enmascararDocumento(numero) },
    consultadoEn: new Date().toISOString(),
  });
});

export default router;
