import { Router } from 'express';
import { z } from 'zod';
import { query } from '../../config/db.js';
import { validate } from '../../middlewares/validate.js';
import { REENTRENAMIENTO_MIN_HORAS, TIPOS_ACTIVIDAD } from '../../utils/constants.js';
import { formatearCodigoCurso } from '../../utils/codes.js';
import { badRequest, conflict, notFound } from '../../utils/http-error.js';

const router = Router();

const cursoSchema = z.object({
  nombre: z.string().trim().min(3, 'Nombre obligatorio').max(200),
  nivelFormacionId: z.coerce.number().int().positive().nullable().optional(),
  tipoActividadId: z.coerce.number().int().positive('Seleccione el tipo de actividad'),
  intensidadHoraria: z.coerce.number().int().positive('La intensidad horaria debe ser mayor a 0'),
  descripcion: z.string().trim().max(2000).optional().nullable(),
  prefijoCodigo: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z0-9][A-Z0-9-]{1,19}$/, 'Use solo letras, números y guiones (máx. 20)')
    .optional()
    .nullable()
    .or(z.literal('').transform(() => null)),
  activo: z.boolean().optional().default(true),
});

const SELECT_CURSO = `
  SELECT cu.id, cu.nombre, cu.prefijo_codigo AS prefijoCodigo,
         (SELECT k.ultimo FROM consecutivos_certificado k
           WHERE k.curso_id = cu.id AND k.anio = YEAR(CURDATE())) AS ultimoConsecutivo,
         YEAR(CURDATE()) AS anioActual,
         cu.nivel_formacion_id AS nivelFormacionId, nf.codigo AS nivelCodigo,
         nf.nombre AS nivel, nf.intensidad_minima_horas AS nivelIntensidadMinima,
         cu.tipo_actividad_id AS tipoActividadId, ta.codigo AS tipoActividadCodigo,
         ta.nombre AS tipoActividad, cu.intensidad_horaria AS intensidadHoraria,
         cu.descripcion, cu.activo,
         (SELECT COUNT(*) FROM certificados c WHERE c.curso_id = cu.id) AS certificadosEmitidos
    FROM cursos cu
    LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
    JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id`;

const conConteo = (curso) => {
  if (!curso) return curso;
  const { ultimoConsecutivo, anioActual, ...resto } = curso;
  return {
    ...resto,
    certificadosEmitidos: Number(curso.certificadosEmitidos),
    proximoCodigo: curso.prefijoCodigo
      ? formatearCodigoCurso({
          prefijo: curso.prefijoCodigo,
          anio: anioActual,
          consecutivo: Number(ultimoConsecutivo ?? 0) + 1,
        })
      : null,
  };
};

const conPrefijoUnico = async (operacion) => {
  try {
    return await operacion();
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY' && String(error.message).includes('uk_cursos_prefijo')) {
      throw conflict('Ese prefijo de código ya lo usa otro curso');
    }
    throw error;
  }
};

// Valida las intensidades mínimas de la Res. 4272 de 2021 (Art. 10 y Art. 27) y devuelve el
// nivel que debe guardarse: las otras tareas de alto riesgo no son niveles de trabajo en alturas.
const validarReglasNormativas = async ({ nivelFormacionId, tipoActividadId, intensidadHoraria }) => {
  const [tipo] = await query('SELECT codigo FROM tipos_actividad WHERE id = ?', [tipoActividadId]);
  if (!tipo) throw badRequest('Tipo de actividad inexistente');

  if (tipo.codigo === TIPOS_ACTIVIDAD.OTRAS_TAREAS_ALTO_RIESGO) return null;

  if (tipo.codigo === TIPOS_ACTIVIDAD.REENTRENAMIENTO) {
    if (intensidadHoraria < REENTRENAMIENTO_MIN_HORAS) {
      throw badRequest(
        `El reentrenamiento requiere mínimo ${REENTRENAMIENTO_MIN_HORAS} horas (Res. 4272 de 2021, Art. 27)`,
      );
    }
    return nivelFormacionId ?? null;
  }

  if (!nivelFormacionId) {
    throw badRequest('La formación inicial debe estar asociada a un nivel de formación');
  }
  const [nivel] = await query(
    'SELECT nombre, intensidad_minima_horas FROM niveles_formacion WHERE id = ? AND activo = 1',
    [nivelFormacionId],
  );
  if (!nivel) throw badRequest('Nivel de formación inexistente o inactivo');
  if (intensidadHoraria < nivel.intensidad_minima_horas) {
    throw badRequest(
      `El nivel "${nivel.nombre}" requiere mínimo ${nivel.intensidad_minima_horas} horas (Res. 4272 de 2021)`,
    );
  }
  return nivelFormacionId;
};

router.get('/', async (req, res) => {
  const soloActivos = req.query.activos === '1';
  const items = await query(
    `${SELECT_CURSO} ${soloActivos ? 'WHERE cu.activo = 1' : ''}
      ORDER BY ta.id, nf.intensidad_minima_horas, cu.id`,
  );
  res.json({ items: items.map(conConteo) });
});

router.get('/:id', async (req, res) => {
  const [curso] = await query(`${SELECT_CURSO} WHERE cu.id = ?`, [req.params.id]);
  if (!curso) throw notFound('Curso no encontrado');
  res.json({ curso: conConteo(curso) });
});

router.post('/', validate(cursoSchema), async (req, res) => {
  const c = req.body;
  const nivelId = await validarReglasNormativas(c);
  const result = await conPrefijoUnico(() =>
    query(
      `INSERT INTO cursos
         (nivel_formacion_id, tipo_actividad_id, nombre, prefijo_codigo, intensidad_horaria, descripcion, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nivelId, c.tipoActividadId, c.nombre, c.prefijoCodigo ?? null, c.intensidadHoraria, c.descripcion ?? null, c.activo],
    ),
  );
  const [curso] = await query(`${SELECT_CURSO} WHERE cu.id = ?`, [result.insertId]);
  res.status(201).json({ curso: conConteo(curso) });
});

router.put('/:id', validate(cursoSchema), async (req, res) => {
  const c = req.body;
  const nivelId = await validarReglasNormativas(c);
  const result = await conPrefijoUnico(() =>
    query(
      `UPDATE cursos
          SET nivel_formacion_id = ?, tipo_actividad_id = ?, nombre = ?, prefijo_codigo = ?, intensidad_horaria = ?,
              descripcion = ?, activo = ?
        WHERE id = ?`,
      [
        nivelId, c.tipoActividadId, c.nombre, c.prefijoCodigo ?? null, c.intensidadHoraria,
        c.descripcion ?? null, c.activo, req.params.id,
      ],
    ),
  );
  if (result.affectedRows === 0) throw notFound('Curso no encontrado');
  const [curso] = await query(`${SELECT_CURSO} WHERE cu.id = ?`, [req.params.id]);
  res.json({ curso: conConteo(curso) });
});

export default router;
