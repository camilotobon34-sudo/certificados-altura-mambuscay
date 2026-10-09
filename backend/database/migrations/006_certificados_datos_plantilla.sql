-- 006: datos que imprimen las plantillas oficiales (empleador, ARL, fechas de formación y entrenador).
-- Son opcionales; los certificados ya emitidos quedan con NULL.

ALTER TABLE certificados
  ADD COLUMN empresa                 VARCHAR(200) NULL AFTER intensidad_horaria,
  ADD COLUMN nit_empresa             VARCHAR(30)  NULL AFTER empresa,
  ADD COLUMN representante_legal     VARCHAR(150) NULL AFTER nit_empresa,
  ADD COLUMN documento_representante VARCHAR(30)  NULL AFTER representante_legal,
  ADD COLUMN arl                     VARCHAR(100) NULL AFTER documento_representante,
  ADD COLUMN fecha_inicio_formacion  DATE NULL AFTER arl,
  ADD COLUMN fecha_fin_formacion     DATE NULL AFTER fecha_inicio_formacion,
  ADD COLUMN entrenador              VARCHAR(150) NULL AFTER fecha_fin_formacion;
