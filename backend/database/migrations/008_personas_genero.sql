-- 008: género de la persona certificada, para el Excel del centro.
-- Opcional en la base para no romper registros ya guardados.

ALTER TABLE personas_certificadas
  ADD COLUMN genero CHAR(1) NULL AFTER fecha_nacimiento;
