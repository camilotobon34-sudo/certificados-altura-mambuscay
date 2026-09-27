# 4. Modelo entidad-relación

## 4.1 Descripción

Modelo conceptual y lógico para **CERTIFICADOS ALTURA MAMBUSCAY**, orientado a MySQL. Soporta gestión interna de certificados de formación en trabajo en alturas y verificación pública por código único / QR.

**Convenciones:**

- Claves primarias: `id` (BIGINT UNSIGNED AUTO_INCREMENT) salvo catálogos pequeños.
- Auditoría común: `creado_en`, `actualizado_en`.
- Soft-delete solo donde se indique; certificados **no** se borran físicamente al anular.

---

## 4.2 Diagrama entidad-relación (textual / Mermaid)

```mermaid
erDiagram
    ROLES ||--o{ USUARIOS : "tiene"
    USUARIOS ||--o{ CERTIFICADOS : "emite"
    USUARIOS ||--o{ CERTIFICADOS : "anula"
    TIPOS_DOCUMENTO ||--o{ PERSONAS_CERTIFICADAS : "identifica"
    PERSONAS_CERTIFICADAS ||--o{ CERTIFICADOS : "posee"
    NIVELES_FORMACION ||--o{ CURSOS : "clasifica"
    TIPOS_ACTIVIDAD ||--o{ CURSOS : "define"
    CURSOS ||--o{ CERTIFICADOS : "certifica"
    CERTIFICADOS ||--o| ANULACIONES : "tiene"
    CERTIFICADOS ||--o{ HISTORIAL_ESTADOS : "registra"
    USUARIOS ||--o{ HISTORIAL_ESTADOS : "cambia"
    USUARIOS ||--o{ ANULACIONES : "registra"

    ROLES {
        bigint id PK
        varchar codigo UK
        varchar nombre
        text descripcion
    }

    USUARIOS {
        bigint id PK
        bigint rol_id FK
        varchar nombres
        varchar apellidos
        varchar correo UK
        varchar password_hash
        tinyint activo
        datetime creado_en
        datetime actualizado_en
    }

    TIPOS_DOCUMENTO {
        bigint id PK
        varchar codigo UK
        varchar nombre
    }

    PERSONAS_CERTIFICADAS {
        bigint id PK
        bigint tipo_documento_id FK
        varchar numero_documento UK
        varchar nombres
        varchar apellidos
        varchar correo
        varchar telefono
        tinyint activo
        datetime creado_en
        datetime actualizado_en
    }

    NIVELES_FORMACION {
        bigint id PK
        varchar codigo UK
        varchar nombre
        int intensidad_minima_horas
        text descripcion
        tinyint es_nivel_normativo
        tinyint activo
    }

    TIPOS_ACTIVIDAD {
        bigint id PK
        varchar codigo UK
        varchar nombre
        text descripcion
    }

    CURSOS {
        bigint id PK
        bigint nivel_formacion_id FK
        bigint tipo_actividad_id FK
        varchar nombre
        int intensidad_horaria
        text descripcion
        tinyint activo
        datetime creado_en
        datetime actualizado_en
    }

    CERTIFICADOS {
        bigint id PK
        bigint persona_id FK
        bigint curso_id FK
        bigint emitido_por_usuario_id FK
        varchar numero_certificado UK
        varchar codigo_verificacion UK
        varchar url_verificacion
        date fecha_expedicion
        date fecha_vencimiento
        int intensidad_horaria
        varchar estado
        text observacion_suspension
        datetime creado_en
        datetime actualizado_en
    }

    ANULACIONES {
        bigint id PK
        bigint certificado_id FK UK
        bigint anulado_por_usuario_id FK
        text motivo
        datetime anulado_en
    }

    HISTORIAL_ESTADOS {
        bigint id PK
        bigint certificado_id FK
        bigint usuario_id FK
        varchar estado_anterior
        varchar estado_nuevo
        text observacion
        datetime cambiado_en
    }
```

---

## 4.3 Entidades y atributos

### `roles`

Catálogo de roles del sistema.

| Atributo | Tipo lógico | Notas |
| --- | --- | --- |
| id | PK | |
| codigo | UK | `ADMIN`, `PERSONAL_AUTORIZADO`, `ESTUDIANTE` |
| nombre | string | |
| descripcion | text | |

### `usuarios`

Usuarios autenticados (Administrador, Personal autorizado; opcionalmente Estudiante).

| Atributo | Tipo lógico | Notas |
| --- | --- | --- |
| id | PK | |
| rol_id | FK → roles | |
| nombres, apellidos | string | |
| correo | UK | login |
| password_hash | string | nunca texto plano |
| activo | boolean | |
| creado_en, actualizado_en | datetime | |

### `tipos_documento`

| Atributo | Notas |
| --- | --- |
| codigo | CC, CE, TI, PA, PPT, etc. |
| nombre | Cédula de ciudadanía, … |

### `personas_certificadas`

Personas que reciben formación (pueden o no tener usuario).

| Atributo | Notas |
| --- | --- |
| tipo_documento_id | FK |
| numero_documento | único junto con tipo (UK compuesto recomendado) |
| nombres, apellidos | |
| correo, telefono | **privados** — no salen en consulta pública |
| activo | |

**UK:** (`tipo_documento_id`, `numero_documento`).

### `niveles_formacion`

Catálogo alineado a Res. 4272 Art. 10.

| codigo | nombre | intensidad_minima_horas | es_nivel_normativo |
| --- | --- | --- | --- |
| JEFE_AREA | Jefes de área para trabajos en alturas | 8 | 1 |
| TRABAJADOR_AUTORIZADO | Trabajador autorizado | 32 | 1 |
| COORDINADOR | Coordinador de trabajo en alturas | 80 | 1 |
| ENTRENADOR | Entrenador en trabajo en alturas | 130 | 1 |

### `tipos_actividad`

Distingue formación inicial vs. reentrenamiento (este **no** es nivel).

| codigo | nombre |
| --- | --- |
| FORMACION_INICIAL | Formación / capacitación y entrenamiento |
| REENTRENAMIENTO | Reentrenamiento (Art. 27 — no es nivel) |

### `cursos`

Oferta académica del centro.

| Atributo | Notas |
| --- | --- |
| nivel_formacion_id | FK nullable si solo aplica a reentrenamiento genérico; en práctica suele apuntar a Trabajador autorizado |
| tipo_actividad_id | FK |
| nombre | |
| intensidad_horaria | ≥ mínimo del nivel cuando aplica |
| activo | |

### `certificados`

Entidad central.

| Atributo | Notas |
| --- | --- |
| persona_id | FK |
| curso_id | FK |
| emitido_por_usuario_id | FK usuarios |
| numero_certificado | UK |
| codigo_verificacion | UK, alta entropía |
| url_verificacion | URL pública (base para QR) |
| fecha_expedicion | date |
| fecha_vencimiento | date |
| intensidad_horaria | snapshot al emitir |
| estado | ENUM lógico: VIGENTE, VENCIDO, SUSPENDIDO, ANULADO |
| observacion_suspension | texto opcional |

**Nota de diseño:** El “código QR” no requiere tabla aparte: se genera a partir de `url_verificacion` o `codigo_verificacion`. Si se desea almacenar imagen, se puede añadir `qr_ruta` en una fase posterior.

### `anulaciones`

1:1 con certificado anulado.

| Atributo | Notas |
| --- | --- |
| certificado_id | UK + FK |
| anulado_por_usuario_id | debe ser rol ADMIN (regla de aplicación) |
| motivo | obligatorio |
| anulado_en | datetime |

### `historial_estados`

Trazabilidad de cambios de estado (incluye paso a VENCIDO por proceso automático; `usuario_id` nullable si es sistema).

---

## 4.4 Cardinalidades

| Relación | Cardinalidad |
| --- | --- |
| Rol → Usuarios | 1:N |
| Tipo documento → Personas | 1:N |
| Persona → Certificados | 1:N |
| Nivel → Cursos | 1:N |
| Tipo actividad → Cursos | 1:N |
| Curso → Certificados | 1:N |
| Usuario → Certificados (emisión) | 1:N |
| Certificado → Anulación | 1:0..1 |
| Certificado → Historial estados | 1:N |

---

## 4.5 Estados — máquina simplificada

```text
                  (cálculo automático)
     ┌──────────────────────────────────┐
     │                                  v
[emitir] --> VIGENTE ----------------> VENCIDO
               │  ^                      │
               │  │ reactivar*           │
               v  │                      v
           SUSPENDIDO <-----------------+
               │
               │ (solo ADMIN + motivo)
               v
            ANULADO  (estado terminal de negocio)
```

\*Reactivar desde SUSPENDIDO recalcula VIGENTE o VENCIDO según `fecha_vencimiento`.

---

## 4.6 Datos visibles en consulta pública (proyección)

No es una tabla; es una **vista lógica** sobre `certificados` + `personas` + `cursos` + `niveles` + datos del centro:

- nombre completo  
- tipo documento + número enmascarado (ej. `CC **********1234`)  
- curso, nivel, intensidad  
- fechas, número certificado, estado  
- nombre del centro (configuración)

**Excluye:** correo, teléfono, observaciones internas, motivo de anulación, datos de usuarios.

---

## 4.7 Normalización

- 3FN: catálogos separados (roles, documentos, niveles, tipos actividad, cursos).  
- Snapshot de `intensidad_horaria` y (vía curso) datos de formación en el certificado para no alterar histórico si el curso cambia después.  
- Opcional futuro: snapshot de `nombre_curso` / `nombre_nivel` en `certificados` para inmutabilidad total del documento emitido.

---

## 4.8 Entidad de configuración (opcional recomendada)

`configuracion_centro` (1 fila): razón social, NIT, ciudad, logo, URL base pública. Facilita el nombre del centro en la consulta pública sin hardcode.
