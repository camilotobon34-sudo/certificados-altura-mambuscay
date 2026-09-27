-- Vincula una cuenta de rol ESTUDIANTE con su registro de persona certificada
-- (RF-17 / HU-06: la persona solo consulta sus propios certificados).
ALTER TABLE usuarios
  ADD COLUMN persona_id BIGINT UNSIGNED NULL AFTER rol_id,
  ADD UNIQUE KEY uk_usuarios_persona (persona_id),
  ADD CONSTRAINT fk_usuarios_persona
    FOREIGN KEY (persona_id) REFERENCES personas_certificadas (id);
