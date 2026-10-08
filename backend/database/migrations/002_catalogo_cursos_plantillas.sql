-- 002: catálogo de cursos alineado a las plantillas oficiales de certificados.
-- Solo datos (sin cambios de esquema). Idempotente: puede ejecutarse más de una vez.

INSERT INTO tipos_actividad (codigo, nombre, descripcion)
SELECT 'OTRAS_TAREAS_ALTO_RIESGO', 'Otras tareas de alto riesgo',
       'Formación en tareas de alto riesgo distintas al trabajo en alturas (p. ej. trabajo en caliente)'
 WHERE NOT EXISTS (SELECT 1 FROM tipos_actividad WHERE codigo = 'OTRAS_TAREAS_ALTO_RIESGO');

UPDATE cursos
   SET nombre = 'Trabajo en alturas – Trabajador autorizado',
       descripcion = 'Capacitación y entrenamiento para trabajadores que realizan tareas en alturas con riesgo de caída de 2 m o más. Intensidad de 32 horas (Res. 4272 de 2021).'
 WHERE id = 2;

UPDATE cursos
   SET nombre = 'Trabajo en alturas – Coordinador',
       descripcion = 'Formación para quien identifica peligros, verifica las medidas de prevención y protección contra caídas y coordina el trabajo en alturas. Intensidad de 80 horas (Res. 4272 de 2021).'
 WHERE id = 3;

UPDATE cursos
   SET nombre = 'Reentrenamiento sectorial – Trabajo en alturas',
       descripcion = 'Reentrenamiento anual obligatorio para mantener vigente la competencia en trabajo en alturas. Mínimo 8 horas (Res. 4272 de 2021, Art. 27).'
 WHERE id = 8;

-- Sin plantilla vigente: dejan de ofrecerse para nuevas emisiones; sus certificados no cambian.
UPDATE cursos SET activo = 0 WHERE id IN (1, 4);

INSERT INTO cursos (nivel_formacion_id, tipo_actividad_id, nombre, intensidad_horaria, descripcion, activo)
SELECT NULL, ta.id, 'Tareas de alto riesgo y trabajo en caliente', 10,
       'Capacitación y entrenamiento en tareas de alto riesgo y trabajo en caliente (soldadura, corte y actividades que generan chispas o llamas). Intensidad de 10 horas.',
       1
  FROM tipos_actividad ta
 WHERE ta.codigo = 'OTRAS_TAREAS_ALTO_RIESGO'
   AND NOT EXISTS (SELECT 1 FROM cursos WHERE nombre = 'Tareas de alto riesgo y trabajo en caliente');
