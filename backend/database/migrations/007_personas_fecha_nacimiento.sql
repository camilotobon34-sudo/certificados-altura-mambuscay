-- 007: fecha de nacimiento de la persona certificada, para el Excel del centro.
-- Es opcional en la base para no romper registros ya guardados.

ALTER TABLE personas_certificadas
  ADD COLUMN fecha_nacimiento DATE NULL AFTER apellidos;
