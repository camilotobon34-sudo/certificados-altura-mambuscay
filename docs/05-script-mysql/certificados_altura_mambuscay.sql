-- =============================================================================
-- CERTIFICADOS ALTURA MAMBUSCAY
-- Script de base de datos MySQL (etapa de análisis y diseño)
-- Motor: MySQL 8.0+
-- Charset: utf8mb4
-- Zona horaria de negocio: America/Bogota (aplicar en capa de aplicación)
-- Referencia normativa: Resolución 4272 de 2021 (niveles e intensidades)
-- =============================================================================

CREATE DATABASE IF NOT EXISTS certificados_altura_mambuscay
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE certificados_altura_mambuscay;

SET NAMES utf8mb4;

-- -----------------------------------------------------------------------------
-- Catálogos
-- -----------------------------------------------------------------------------

CREATE TABLE roles (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo        VARCHAR(40)  NOT NULL,
  nombre        VARCHAR(100) NOT NULL,
  descripcion   VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE tipos_documento (
  id      BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo  VARCHAR(20)  NOT NULL,
  nombre  VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipos_documento_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE niveles_formacion (
  id                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo                    VARCHAR(40)  NOT NULL,
  nombre                    VARCHAR(150) NOT NULL,
  intensidad_minima_horas   INT UNSIGNED NOT NULL,
  descripcion               TEXT NULL,
  es_nivel_normativo        TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = nivel Res. 4272 Art. 10',
  activo                    TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (id),
  UNIQUE KEY uk_niveles_codigo (codigo)
) ENGINE=InnoDB;

CREATE TABLE tipos_actividad (
  id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  codigo      VARCHAR(40)  NOT NULL,
  nombre      VARCHAR(150) NOT NULL,
  descripcion VARCHAR(255) NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tipos_actividad_codigo (codigo)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Usuarios internos / opcional estudiante
-- -----------------------------------------------------------------------------

CREATE TABLE usuarios (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  rol_id          BIGINT UNSIGNED NOT NULL,
  nombres         VARCHAR(100) NOT NULL,
  apellidos       VARCHAR(100) NOT NULL,
  correo          VARCHAR(150) NOT NULL,
  password_hash   VARCHAR(255) NOT NULL,
  activo          TINYINT(1) NOT NULL DEFAULT 1,
  creado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_usuarios_correo (correo),
  KEY idx_usuarios_rol (rol_id),
  CONSTRAINT fk_usuarios_rol
    FOREIGN KEY (rol_id) REFERENCES roles (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Personas certificadas
-- -----------------------------------------------------------------------------

CREATE TABLE personas_certificadas (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  tipo_documento_id   BIGINT UNSIGNED NOT NULL,
  numero_documento    VARCHAR(30)  NOT NULL,
  nombres             VARCHAR(100) NOT NULL,
  apellidos           VARCHAR(100) NOT NULL,
  correo              VARCHAR(150) NULL COMMENT 'Dato privado: no exponer en consulta pública',
  telefono            VARCHAR(30)  NULL COMMENT 'Dato privado: no exponer en consulta pública',
  activo              TINYINT(1) NOT NULL DEFAULT 1,
  creado_en           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_persona_documento (tipo_documento_id, numero_documento),
  KEY idx_personas_apellidos (apellidos, nombres),
  CONSTRAINT fk_personas_tipo_documento
    FOREIGN KEY (tipo_documento_id) REFERENCES tipos_documento (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Cursos / formaciones del centro
-- -----------------------------------------------------------------------------

CREATE TABLE cursos (
  id                    BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  nivel_formacion_id    BIGINT UNSIGNED NULL,
  tipo_actividad_id     BIGINT UNSIGNED NOT NULL,
  nombre                VARCHAR(200) NOT NULL,
  intensidad_horaria    INT UNSIGNED NOT NULL,
  descripcion           TEXT NULL,
  activo                TINYINT(1) NOT NULL DEFAULT 1,
  creado_en             DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_cursos_nivel (nivel_formacion_id),
  KEY idx_cursos_tipo (tipo_actividad_id),
  CONSTRAINT fk_cursos_nivel
    FOREIGN KEY (nivel_formacion_id) REFERENCES niveles_formacion (id),
  CONSTRAINT fk_cursos_tipo_actividad
    FOREIGN KEY (tipo_actividad_id) REFERENCES tipos_actividad (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Certificados
-- estado: VIGENTE | VENCIDO | SUSPENDIDO | ANULADO
-- El cálculo de VENCIDO puede resolverse en consulta (vista) y/o job de actualización.
-- -----------------------------------------------------------------------------

CREATE TABLE certificados (
  id                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  persona_id                BIGINT UNSIGNED NOT NULL,
  curso_id                  BIGINT UNSIGNED NOT NULL,
  emitido_por_usuario_id    BIGINT UNSIGNED NOT NULL,
  numero_certificado        VARCHAR(50)  NOT NULL,
  codigo_verificacion       VARCHAR(64)  NOT NULL,
  url_verificacion          VARCHAR(500) NULL COMMENT 'Base para generar el código QR',
  fecha_expedicion          DATE NOT NULL,
  fecha_vencimiento         DATE NOT NULL,
  intensidad_horaria        INT UNSIGNED NOT NULL COMMENT 'Snapshot al momento de emisión',
  estado                    ENUM('VIGENTE', 'VENCIDO', 'SUSPENDIDO', 'ANULADO') NOT NULL DEFAULT 'VIGENTE',
  observacion_suspension    TEXT NULL,
  creado_en                 DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_certificados_numero (numero_certificado),
  UNIQUE KEY uk_certificados_codigo (codigo_verificacion),
  KEY idx_certificados_persona (persona_id),
  KEY idx_certificados_curso (curso_id),
  KEY idx_certificados_estado (estado),
  KEY idx_certificados_vencimiento (fecha_vencimiento),
  CONSTRAINT fk_certificados_persona
    FOREIGN KEY (persona_id) REFERENCES personas_certificadas (id),
  CONSTRAINT fk_certificados_curso
    FOREIGN KEY (curso_id) REFERENCES cursos (id),
  CONSTRAINT fk_certificados_emisor
    FOREIGN KEY (emitido_por_usuario_id) REFERENCES usuarios (id),
  CONSTRAINT chk_certificados_fechas
    CHECK (fecha_vencimiento >= fecha_expedicion)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Anulación (solo Administrador a nivel de aplicación; motivo obligatorio)
-- -----------------------------------------------------------------------------

CREATE TABLE anulaciones (
  id                        BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  certificado_id            BIGINT UNSIGNED NOT NULL,
  anulado_por_usuario_id    BIGINT UNSIGNED NOT NULL,
  motivo                    TEXT NOT NULL,
  anulado_en                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_anulaciones_certificado (certificado_id),
  KEY idx_anulaciones_usuario (anulado_por_usuario_id),
  CONSTRAINT fk_anulaciones_certificado
    FOREIGN KEY (certificado_id) REFERENCES certificados (id),
  CONSTRAINT fk_anulaciones_usuario
    FOREIGN KEY (anulado_por_usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Historial de estados (auditoría)
-- usuario_id NULL = cambio automático del sistema (p. ej. a VENCIDO)
-- -----------------------------------------------------------------------------

CREATE TABLE historial_estados (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  certificado_id    BIGINT UNSIGNED NOT NULL,
  usuario_id        BIGINT UNSIGNED NULL,
  estado_anterior   ENUM('VIGENTE', 'VENCIDO', 'SUSPENDIDO', 'ANULADO') NULL,
  estado_nuevo      ENUM('VIGENTE', 'VENCIDO', 'SUSPENDIDO', 'ANULADO') NOT NULL,
  observacion       TEXT NULL,
  cambiado_en       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_historial_certificado (certificado_id),
  KEY idx_historial_usuario (usuario_id),
  CONSTRAINT fk_historial_certificado
    FOREIGN KEY (certificado_id) REFERENCES certificados (id),
  CONSTRAINT fk_historial_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
) ENGINE=InnoDB;

-- -----------------------------------------------------------------------------
-- Configuración del centro (una fila esperada)
-- -----------------------------------------------------------------------------

CREATE TABLE configuracion_centro (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  razon_social      VARCHAR(200) NOT NULL,
  nit               VARCHAR(30)  NULL,
  ciudad            VARCHAR(100) NULL,
  direccion         VARCHAR(200) NULL,
  telefono          VARCHAR(30)  NULL,
  correo            VARCHAR(150) NULL,
  url_base_publica  VARCHAR(300) NOT NULL COMMENT 'Ej: https://dominio.com/verificar',
  logo_ruta         VARCHAR(300) NULL,
  actualizado_en    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

-- =============================================================================
-- Datos iniciales (seed)
-- =============================================================================

INSERT INTO roles (codigo, nombre, descripcion) VALUES
  ('ADMIN', 'Administrador', 'Control total; único rol autorizado para anular certificados'),
  ('PERSONAL_AUTORIZADO', 'Personal autorizado', 'Gestión de personas, cursos y emisión de certificados'),
  ('ESTUDIANTE', 'Estudiante / persona certificada', 'Consulta de certificados propios (opcional)');

INSERT INTO tipos_documento (codigo, nombre) VALUES
  ('CC', 'Cédula de ciudadanía'),
  ('CE', 'Cédula de extranjería'),
  ('TI', 'Tarjeta de identidad'),
  ('PA', 'Pasaporte'),
  ('PPT', 'Permiso por protección temporal');

-- Niveles según Resolución 4272 de 2021, Artículo 10
INSERT INTO niveles_formacion
  (codigo, nombre, intensidad_minima_horas, descripcion, es_nivel_normativo, activo)
VALUES
  ('JEFE_AREA', 'Jefes de área para trabajos en alturas', 8,
   'Mínimo 8 horas, 100% teórico (Art. 10 y Art. 27 Res. 4272/2021).', 1, 1),
  ('TRABAJADOR_AUTORIZADO', 'Trabajador autorizado', 32,
   'Mínimo 32 horas; 40% teórico y 60% práctico; modalidad presencial.', 1, 1),
  ('COORDINADOR', 'Coordinador de trabajo en alturas', 80,
   'Mínimo 80 horas; 40% teórico y 60% práctico; modalidad presencial.', 1, 1),
  ('ENTRENADOR', 'Entrenador en trabajo en alturas', 130,
   'Mínimo 130 horas: 40 h capacitación, 50 h pedagógica y 40 h práctica.', 1, 1);

INSERT INTO tipos_actividad (codigo, nombre, descripcion) VALUES
  ('FORMACION_INICIAL', 'Formación / capacitación y entrenamiento',
   'Programa de formación correspondiente a un nivel de la Res. 4272/2021.'),
  ('REENTRENAMIENTO', 'Reentrenamiento',
   'No es un nivel de formación (Art. 27). Mínimo 8 horas; 20% teórico y 80% práctico.');

INSERT INTO configuracion_centro
  (razon_social, nit, ciudad, url_base_publica)
VALUES
  ('CERTIFICADOS ALTURA MAMBUSCAY', NULL, NULL, 'https://ejemplo.com/verificar');

-- Cursos de ejemplo (plantilla; ajustar nombres reales del centro)
INSERT INTO cursos (nivel_formacion_id, tipo_actividad_id, nombre, intensidad_horaria, descripcion, activo)
SELECT nf.id, ta.id,
       CONCAT('Capacitación y entrenamiento — ', nf.nombre),
       nf.intensidad_minima_horas,
       CONCAT('Curso alineado al nivel ', nf.nombre, ' (Res. 4272/2021).'),
       1
FROM niveles_formacion nf
CROSS JOIN tipos_actividad ta
WHERE ta.codigo = 'FORMACION_INICIAL';

INSERT INTO cursos (nivel_formacion_id, tipo_actividad_id, nombre, intensidad_horaria, descripcion, activo)
SELECT nf.id, ta.id,
       'Reentrenamiento trabajador autorizado',
       8,
       'Reentrenamiento Art. 27 Res. 4272/2021. No constituye un nuevo nivel de formación.',
       1
FROM niveles_formacion nf
JOIN tipos_actividad ta ON ta.codigo = 'REENTRENAMIENTO'
WHERE nf.codigo = 'TRABAJADOR_AUTORIZADO';

-- =============================================================================
-- Vista de consulta pública (solo campos necesarios para verificación)
-- El enmascaramiento fino del documento se puede completar en la API.
-- =============================================================================

CREATE OR REPLACE VIEW vw_consulta_publica_certificado AS
SELECT
  c.numero_certificado,
  c.codigo_verificacion,
  c.url_verificacion,
  c.fecha_expedicion,
  c.fecha_vencimiento,
  c.intensidad_horaria,
  CASE
    WHEN c.estado = 'ANULADO' THEN 'ANULADO'
    WHEN c.estado = 'SUSPENDIDO' THEN 'SUSPENDIDO'
    WHEN c.fecha_vencimiento < CURDATE() THEN 'VENCIDO'
    ELSE 'VIGENTE'
  END AS estado_publico,
  CONCAT(p.nombres, ' ', p.apellidos) AS nombre_completo,
  td.codigo AS tipo_documento,
  CONCAT(
    REPEAT('*', GREATEST(CHAR_LENGTH(p.numero_documento) - 4, 0)),
    RIGHT(p.numero_documento, 4)
  ) AS numero_documento_enmascarado,
  cu.nombre AS curso,
  nf.nombre AS nivel_formacion,
  ta.nombre AS tipo_actividad,
  cc.razon_social AS centro_formacion
FROM certificados c
JOIN personas_certificadas p ON p.id = c.persona_id
JOIN tipos_documento td ON td.id = p.tipo_documento_id
JOIN cursos cu ON cu.id = c.curso_id
LEFT JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id
CROSS JOIN configuracion_centro cc;

-- =============================================================================
-- Procedimiento auxiliar: marcar vencidos (job programado o ejecución manual)
-- No altera ANULADO ni SUSPENDIDO.
-- =============================================================================

DELIMITER $$

CREATE PROCEDURE sp_actualizar_certificados_vencidos()
BEGIN
  DROP TEMPORARY TABLE IF EXISTS tmp_certificados_a_vencer;

  CREATE TEMPORARY TABLE tmp_certificados_a_vencer AS
  SELECT id
  FROM certificados
  WHERE estado = 'VIGENTE'
    AND fecha_vencimiento < CURDATE();

  UPDATE certificados c
  INNER JOIN tmp_certificados_a_vencer t ON t.id = c.id
  SET c.estado = 'VENCIDO';

  INSERT INTO historial_estados (
    certificado_id, usuario_id, estado_anterior, estado_nuevo, observacion
  )
  SELECT
    t.id,
    NULL,
    'VIGENTE',
    'VENCIDO',
    'Actualización automática por fecha de vencimiento'
  FROM tmp_certificados_a_vencer t;

  DROP TEMPORARY TABLE IF EXISTS tmp_certificados_a_vencer;
END$$

DELIMITER ;

-- =============================================================================
-- Notas de implementación (no ejecutar como SQL)
-- 1. Crear el primer usuario ADMIN desde la aplicación con password hasheado.
-- 2. La anulación debe: validar rol ADMIN, insertar en anulaciones, poner estado ANULADO
--    e insertar historial_estados en una misma transacción.
-- 3. La consulta pública debe usar vw_consulta_publica_certificado (o equivalente en API)
--    y aplicar rate limiting.
-- 4. El QR se genera en frontend/backend a partir de url_verificacion.
-- =============================================================================
