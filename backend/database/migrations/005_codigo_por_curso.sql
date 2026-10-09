-- 005: cada curso con su propio código de certificado y consecutivo anual (p. ej. AUTORAM26-0001).
-- Los certificados ya emitidos conservan su número.

ALTER TABLE cursos
  ADD COLUMN prefijo_codigo VARCHAR(20) NULL AFTER nombre,
  ADD UNIQUE KEY uk_cursos_prefijo (prefijo_codigo);

CREATE TABLE consecutivos_certificado (
  curso_id BIGINT UNSIGNED NOT NULL,
  anio     SMALLINT UNSIGNED NOT NULL,
  ultimo   INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (curso_id, anio),
  CONSTRAINT fk_consecutivos_curso FOREIGN KEY (curso_id) REFERENCES cursos (id)
) ENGINE=InnoDB;

UPDATE cursos SET prefijo_codigo = CASE id
  WHEN 2  THEN 'AUTORAM'
  WHEN 3  THEN 'C00RDAM-'
  WHEN 8  THEN 'REEAM'
  WHEN 9  THEN 'AMTENC'
  WHEN 10 THEN 'ANDA'
  WHEN 11 THEN 'RESCT'
  WHEN 12 THEN 'AMBRIGEPAUX'
END WHERE id IN (2, 3, 8, 9, 10, 11, 12);
