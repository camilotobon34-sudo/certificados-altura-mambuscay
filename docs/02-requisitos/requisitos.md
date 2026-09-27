# 2. Requisitos funcionales y no funcionales

## 2.1 Alcance del sistema

**CERTIFICADOS ALTURA MAMBUSCAY** es una PWA para que un centro de formación gestione certificados de capacitación en trabajo en alturas y permita la **verificación pública** de autenticidad sin crear cuenta.

**Incluye (esta versión de alcance):**

- Gestión de usuarios internos (Administrador y Personal autorizado).
- Registro de personas certificadas y de certificados.
- Catálogo de cursos/niveles alineado a la Resolución 4272 de 2021.
- Estados de certificado: VIGENTE, VENCIDO, SUSPENDIDO, ANULADO.
- Consulta pública por código de verificación / número de certificado / QR.
- Generación de código único y soporte a código QR para consulta.

**No incluye (fuera de alcance inicial):**

- Integración con aplicativos del Ministerio del Trabajo o ARL.
- Emisión de certificados de competencia laboral por organismos certificadores (distintos de la constancia del centro).
- Pagos en línea, CRM comercial o LMS completo de cursos.
- Firma digital avanzada / PKI (puede evaluarse en una fase posterior).

---

## 2.2 Roles

| Rol | Descripción | Autenticación |
| --- | --- | --- |
| **Administrador** | Control total del sistema: usuarios, configuración, anulación de certificados, auditoría. | Sí |
| **Personal autorizado** | Personal del centro que registra personas, emite y actualiza certificados (salvo anular). | Sí |
| **Estudiante / persona certificada** | Consulta sus propios certificados (vista autenticada opcional o por documento). | Opcional* |
| **Visitante** | Verifica autenticidad de un certificado públicamente. | No |

\*La consulta pública no exige cuenta. Si se habilita portal de estudiante, será autenticado y limitado a sus propios registros.

---

## 2.3 Referencia normativa — Resolución 4272 de 2021

Los **niveles de formación** que el sistema debe contemplar como catálogo base (Artículo 10) son:

| Nivel | Intensidad mínima | Observaciones |
| --- | --- | --- |
| Jefes de área para trabajos en alturas | Mínimo **8 horas** (100 % teórico) | Decisiones administrativas |
| Trabajador autorizado | Mínimo **32 horas** (40 % teórico / 60 % práctico) | Modalidad presencial |
| Coordinador de trabajo en alturas | Mínimo **80 horas** (40 % teórico / 60 % práctico) | Modalidad presencial |
| Entrenador en trabajo en alturas | Mínimo **130 horas** (40 h capacitación + 50 h pedagógica + 40 h práctica) | Modalidad presencial |

**Reentrenamiento** (Artículo 27): **no es un nivel de formación**. Es un proceso complementario (mínimo **8 horas**, 20 % teórico / 80 % práctico) que el empleador requiere para mantener activo al trabajador autorizado (p. ej. cada **18 meses** o ante cambios de condiciones / nuevo ingreso). El sistema puede registrar certificados o constancias de **reentrenamiento** como tipo de curso/actividad, sin clasificarlo como “nivel” de la Res. 4272.

Las intensidades horarias registradas en cursos no deben ser inferiores a los mínimos normativos del nivel asociado.

---

## 2.4 Requisitos funcionales (RF)

### RF-01 — Autenticación y sesión

El sistema debe permitir iniciar y cerrar sesión a Administrador y Personal autorizado mediante credenciales válidas, con control de rol en cada operación.

### RF-02 — Gestión de usuarios internos

El Administrador debe poder crear, activar, desactivar y actualizar usuarios del Personal autorizado, asignando rol y datos básicos de contacto.

### RF-03 — Gestión de personas certificadas

El Personal autorizado y el Administrador deben poder registrar y actualizar personas certificadas con al menos: nombres, apellidos, tipo de documento, número de documento y datos de contacto opcionales.

### RF-04 — Catálogo de tipos de documento

El sistema debe mantener tipos de documento (p. ej. CC, CE, TI, PASAPORTE, PPT) para asociarlos a personas certificadas.

### RF-05 — Catálogo de niveles de formación

El sistema debe mantener los niveles definidos por la Res. 4272 (y permitir marcar reentrenamiento como actividad distinta, no como nivel).

### RF-06 — Gestión de cursos / formaciones

El sistema debe permitir registrar cursos con: nombre, nivel o tipo de actividad, intensidad horaria mínima aplicable, descripción y estado activo/inactivo.

### RF-07 — Emisión de certificados

El Personal autorizado y el Administrador deben poder emitir un certificado asociando persona, curso, nivel, intensidad horaria, fecha de expedición, fecha de vencimiento, número de certificado, código único de verificación y estado inicial.

### RF-08 — Código único de verificación

Cada certificado debe tener un código único, no predecible, usado para consulta pública y para el payload del QR.

### RF-09 — Código QR

Al emitir o consultar un certificado, el sistema debe disponer de un código QR que apunte a la URL pública de verificación (o contenga el código único según diseño de implementación posterior).

### RF-10 — Estados del certificado

El sistema debe soportar estados:

| Estado | Regla |
| --- | --- |
| **VIGENTE** | Dentro de vigencia y sin suspensión/anulación. |
| **VENCIDO** | Calculado automáticamente cuando la fecha actual es posterior a la fecha de vencimiento (si no está ANULADO ni SUSPENDIDO). |
| **SUSPENDIDO** | Marcado manualmente por Personal autorizado o Administrador, con observación. |
| **ANULADO** | Solo Administrador; exige motivo registrado; irreversible o con restricciones fuertes de reversión. |

### RF-11 — Cálculo automático de VENCIDO

Un proceso (consulta en tiempo real y/o job programado) debe tratar como VENCIDO todo certificado cuya fecha de vencimiento haya pasado y cuyo estado operativo no sea ANULADO ni SUSPENDIDO.

### RF-12 — Anulación restringida

Solo el Administrador puede anular. Debe registrar: motivo, fecha/hora, usuario que anula. Un certificado anulado no debe presentarse como válido en consulta pública.

### RF-13 — Suspensión

Personal autorizado y Administrador pueden suspender/reactivar (según reglas) un certificado vigente, dejando traza.

### RF-14 — Consulta y listado interno

Usuarios autenticados deben poder buscar certificados por número, documento de la persona, código de verificación, curso, estado y rango de fechas.

### RF-15 — Consulta pública sin cuenta

Un Visitante debe poder verificar un certificado ingresando código de verificación (y/o número de certificado) o escaneando el QR, **sin registrarse**.

### RF-16 — Respuesta de verificación pública (mínima necesaria)

La consulta pública debe mostrar solo información suficiente para verificar autenticidad, por ejemplo:

- Resultado: válido / no válido / no encontrado  
- Nombre completo de la persona certificada (necesario para cotejo)  
- Tipo de documento y **número parcialmente enmascarado**  
- Nombre del curso / nivel de formación  
- Intensidad horaria  
- Fecha de expedición y de vencimiento  
- Número de certificado  
- Estado actual  
- Nombre del centro de formación  

**No debe exponer:** correo, teléfono, dirección, observaciones internas, motivo de anulación detallado (solo indicar “ANULADO”), datos de usuarios internos ni historial administrativo completo.

### RF-17 — Portal de persona certificada (opcional de alcance cercano)

Si se habilita, la persona certificada autenticada podrá ver únicamente sus certificados y descargar/visualizar constancia + QR.

### RF-18 — Auditoría básica

El sistema debe registrar eventos relevantes: creación/edición de certificado, cambio de estado, anulación, inicio de sesión fallido (según diseño de seguridad).

### RF-19 — Manifest / instalación PWA

La aplicación debe ser instalable como PWA (manifest, iconos, service worker básico en etapa de implementación).

---

## 2.5 Requisitos no funcionales (RNF)

### RNF-01 — Arquitectura tecnológica (planificada)

- Frontend: React + Vite + Tailwind CSS (PWA).  
- Backend: Node.js + Express.  
- Base de datos: MySQL.  

*(En esta etapa no se implementa; se documenta como restricción de diseño.)*

### RNF-02 — Seguridad

- Contraseñas almacenadas con hash seguro (p. ej. bcrypt/argon2).  
- Autorización por rol en API.  
- HTTPS en producción.  
- Protección CSRF/XSS según stack.  
- Rate limiting en endpoint de consulta pública para reducir enumeración de códigos.  
- Códigos de verificación con entropía suficiente.

### RNF-03 — Privacidad y Habeas Data

- Cumplir principios de minimización de datos en consulta pública.  
- Acceso a datos personales completos solo para roles autorizados.  
- Política de tratamiento de datos (documento legal a publicar en implementación).

### RNF-04 — Disponibilidad

- Consulta pública disponible 24/7 con objetivo de alta disponibilidad razonable para un centro de formación (p. ej. ≥ 99 % mensual en hosting productivo).

### RNF-05 — Rendimiento

- Verificación pública: respuesta útil en &lt; 2 s bajo carga normal.  
- Listados internos paginados.

### RNF-06 — Usabilidad

- Interfaz en español.  
- Consulta pública usable en móvil (caso principal: escaneo QR en campo).  
- Formularios con validación clara.

### RNF-07 — Integridad de datos

- Números de certificado y códigos de verificación únicos.  
- Integridad referencial en MySQL (FK, restricciones).  
- Intensidad horaria coherente con el nivel/curso.

### RNF-08 — Trazabilidad

- Anulaciones y cambios de estado auditables.  
- Fechas en zona horaria de Colombia (`America/Bogota`).

### RNF-09 — Mantenibilidad

- Separación frontend/backend.  
- Documentación de análisis (este repositorio `docs/`) antes de codificar.

### RNF-10 — Compatibilidad

- Navegadores modernos (Chrome, Edge, Firefox, Safari) en desktop y móvil.  
- Criterios PWA: instalable, responsive, offline mínimo (al menos shell o página de consulta cacheable según diseño posterior).

---

## 2.6 Reglas de negocio clave

1. No se emite certificado sin persona certificada y curso válidos.  
2. El estado ANULADO prevalece sobre VENCIDO/VIGENTE.  
3. SUSPENDIDO prevalece sobre el cálculo automático de vigencia hasta que se reactive.  
4. Solo Administrador anula, con motivo obligatorio.  
5. La consulta pública nunca confirma datos sensibles no necesarios.  
6. Los niveles y horas mínimas no contradicen la Res. 4272 de 2021.  
7. El reentrenamiento se modela como actividad/curso, no como nivel de formación.

---

## 2.7 Criterios de aceptación globales (etapa análisis)

- [ ] Roles y permisos definidos y revisados.  
- [ ] Estados y reglas de vencimiento/anulación claros.  
- [ ] Datos mínimos del certificado completos.  
- [ ] Alcance de consulta pública vs. privacidad acordado.  
- [ ] Catálogo normativo alineado a Res. 4272.
