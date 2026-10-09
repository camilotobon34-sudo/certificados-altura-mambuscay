-- 004: cursos adicionales de las plantillas de Alexander y datos del centro.
-- Solo datos (sin cambios de esquema). Idempotente: puede ejecutarse más de una vez.

INSERT INTO cursos (nivel_formacion_id, tipo_actividad_id, nombre, intensidad_horaria, descripcion, activo)
SELECT NULL, ta.id, x.nombre, x.horas, x.descripcion, 1
  FROM tipos_actividad ta
  JOIN (SELECT 'Armado de andamios para trabajo en alturas' AS nombre, 10 AS horas,
               'Capacitación en armado, inspección y uso seguro de andamios para trabajo en alturas.' AS descripcion
        UNION ALL SELECT 'Rescate en alturas', 16,
               'Capacitación y entrenamiento en técnicas de rescate de personas en trabajo en alturas.'
        UNION ALL SELECT 'Brigadas de emergencia – Primeros auxilios', 8,
               'Capacitación y entrenamiento de brigadas de emergencia empresariales en primeros auxilios.') x
 WHERE ta.codigo = 'OTRAS_TAREAS_ALTO_RIESGO'
   AND NOT EXISTS (SELECT 1 FROM cursos c WHERE c.nombre = x.nombre);

UPDATE configuracion_centro
   SET nit = '901269652-6',
       ciudad = 'La Ceja (Antioquia)'
 ORDER BY id LIMIT 1;
