-- 003: ingreso con tipo y número de documento; el correo pasa a ser opcional.
-- No borra datos. Las cuentas de clientes toman el documento de su persona certificada.

ALTER TABLE usuarios
  ADD COLUMN tipo_documento_id BIGINT UNSIGNED NULL AFTER persona_id,
  ADD COLUMN numero_documento  VARCHAR(30) NULL AFTER tipo_documento_id,
  MODIFY correo VARCHAR(150) NULL,
  ADD UNIQUE KEY uk_usuarios_documento (tipo_documento_id, numero_documento),
  ADD CONSTRAINT fk_usuarios_tipo_documento
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento (id);

UPDATE usuarios u
  JOIN personas_certificadas p ON p.id = u.persona_id
   SET u.tipo_documento_id = p.tipo_documento_id,
       u.numero_documento  = p.numero_documento;

UPDATE roles SET nombre = 'Cliente' WHERE codigo = 'ESTUDIANTE';
