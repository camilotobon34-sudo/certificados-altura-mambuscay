-- 009: empresas empleadoras para reutilizar NIT, representante y ARL sin emitir un certificado.

CREATE TABLE IF NOT EXISTS empresas_empleadoras (
  id                       BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nombre                   VARCHAR(200) NOT NULL,
  nit                      VARCHAR(30) NULL,
  representante_legal      VARCHAR(150) NULL,
  documento_representante  VARCHAR(30) NULL,
  arl                      VARCHAR(100) NULL,
  activo                   TINYINT(1) NOT NULL DEFAULT 1,
  creado_en                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_empresas_nombre (nombre)
) ENGINE=InnoDB;
