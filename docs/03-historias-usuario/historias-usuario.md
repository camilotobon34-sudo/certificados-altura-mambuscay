# 3. Historias de usuario

Formato: **Como** [rol], **quiero** [acción], **para** [beneficio].  
Prioridad: Alta / Media / Baja.  
Criterios de aceptación en formato Given/When/Then o lista verificable.

---

## Épica A — Acceso y usuarios

### HU-01 — Iniciar sesión (Administrador / Personal autorizado)

**Como** usuario interno,  
**quiero** autenticarme con correo y contraseña,  
**para** acceder a las funciones de mi rol.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Credenciales válidas redirigen al panel según rol.
  - Credenciales inválidas muestran mensaje genérico (sin revelar si el correo existe).
  - Sesión expira tras inactividad configurable.

### HU-02 — Gestionar personal autorizado (Administrador)

**Como** Administrador,  
**quiero** crear, editar, activar y desactivar usuarios del Personal autorizado,  
**para** controlar quién emite certificados en el centro.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Solo el Administrador accede a esta función.
  - No se puede eliminar el último Administrador activo.
  - Usuario inactivo no puede iniciar sesión.

### HU-03 — Cerrar sesión

**Como** usuario autenticado,  
**quiero** cerrar sesión,  
**para** proteger el acceso en equipos compartidos.

- **Prioridad:** Alta

---

## Épica B — Personas certificadas

### HU-04 — Registrar persona certificada

**Como** Personal autorizado,  
**quiero** registrar una persona con tipo y número de documento, nombres y apellidos,  
**para** asociarle certificados de formación.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Tipo + número de documento son únicos en el sistema.
  - Validación de campos obligatorios.
  - Se pueden agregar teléfono y correo opcionales (no visibles en consulta pública).

### HU-05 — Buscar y actualizar persona certificada

**Como** Personal autorizado,  
**quiero** buscar personas por documento o nombre y actualizar sus datos,  
**para** corregir información antes o después de emitir certificados.

- **Prioridad:** Alta

### HU-06 — Consultar mis certificados (Estudiante / persona certificada)

**Como** persona certificada,  
**quiero** ver los certificados asociados a mi documento (con autenticación o flujo seguro),  
**para** conocer vigencia y disponer del QR.

- **Prioridad:** Media  
- **Nota:** Independiente de la consulta pública del Visitante.

---

## Épica C — Cursos y niveles (Res. 4272)

### HU-07 — Administrar catálogo de niveles

**Como** Administrador,  
**quiero** mantener los niveles de formación de la Resolución 4272 de 2021,  
**para** que los certificados se emitán solo con niveles válidos.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Niveles base: Jefes de área, Trabajador autorizado, Coordinador, Entrenador.
  - Cada nivel tiene intensidad horaria mínima normativa.
  - Reentrenamiento **no** figura como nivel; se gestiona como tipo de actividad/curso.

### HU-08 — Registrar curso / formación

**Como** Personal autorizado,  
**quiero** crear un curso con nombre, nivel o tipo, e intensidad horaria,  
**para** usarlo al emitir certificados.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Si el curso está ligado a un nivel normativo, la intensidad ≥ mínimo del nivel.
  - Cursos inactivos no aparecen para nuevas emisiones.

---

## Épica D — Emisión y gestión de certificados

### HU-09 — Emitir certificado

**Como** Personal autorizado,  
**quiero** emitir un certificado con los datos mínimos de formación y verificación,  
**para** dejar constancia oficial gestionada por el centro.

- **Prioridad:** Alta  
- **Datos mínimos:**
  - Persona certificada  
  - Tipo y número de documento (desde la persona)  
  - Curso / formación  
  - Nivel de formación (o tipo reentrenamiento)  
  - Intensidad horaria  
  - Fecha de expedición  
  - Fecha de vencimiento  
  - Número de certificado  
  - Código único de verificación  
  - Código QR  
  - Estado  
- **Criterios de aceptación:**
  - El sistema genera código único automáticamente.
  - El número de certificado es único.
  - Estado inicial típico: VIGENTE (si fecha de vencimiento ≥ hoy).
  - Se genera o asocia URL/QR de consulta pública.

### HU-10 — Listar y filtrar certificados

**Como** Personal autorizado,  
**quiero** listar certificados con filtros (estado, fechas, documento, curso),  
**para** gestionar el inventario de emisiones.

- **Prioridad:** Alta

### HU-11 — Ver detalle de certificado (interno)

**Como** Personal autorizado,  
**quiero** ver el detalle completo de un certificado,  
**para** atender solicitudes del centro o de empleadores.

- **Prioridad:** Alta  
- **Nota:** Vista interna puede mostrar más datos que la pública.

### HU-12 — Suspender certificado

**Como** Personal autorizado,  
**quiero** marcar un certificado como SUSPENDIDO con una observación,  
**para** reflejar una situación temporal que impide su uso como vigente.

- **Prioridad:** Media  
- **Criterios de aceptación:**
  - No aplica a certificados ANULADOS.
  - La consulta pública muestra estado SUSPENDIDO (sin datos internos sensibles).

### HU-13 — Reactivar certificado suspendido

**Como** Personal autorizado o Administrador,  
**quiero** quitar la suspensión si corresponde,  
**para** restablecer VIGENTE o VENCIDO según fechas.

- **Prioridad:** Media

### HU-14 — Anular certificado (solo Administrador)

**Como** Administrador,  
**quiero** anular un certificado registrando el motivo,  
**para** invalidar emisiones erróneas o fraudulentas.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Personal autorizado **no** puede anular.
  - Motivo obligatorio (texto).
  - Se guarda usuario, fecha y motivo.
  - Consulta pública indica ANULADO / no válido.
  - No se elimina el registro histórico.

### HU-15 — Vencimiento automático

**Como** sistema,  
**quiero** calcular el estado VENCIDO según la fecha de vencimiento,  
**para** que la consulta pública y los listados reflejen la vigencia real.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Si hoy &gt; fecha_vencimiento y estado no es ANULADO ni SUSPENDIDO → se trata como VENCIDO.
  - ANULADO y SUSPENDIDO no se sobrescriben a VENCIDO por el cálculo automático.

---

## Épica E — Consulta pública (Visitante)

### HU-16 — Verificar certificado sin cuenta

**Como** Visitante,  
**quiero** ingresar un código de verificación o número de certificado,  
**para** comprobar si es auténtico y su estado, sin crear usuario.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - No requiere autenticación.
  - Código inexistente → mensaje “No encontrado”.
  - Código existente → muestra solo datos de verificación permitidos (RF-16).
  - No muestra correo, teléfono, dirección ni motivo detallado de anulación.

### HU-17 — Verificar mediante código QR

**Como** Visitante,  
**quiero** escanear el QR del certificado,  
**para** abrir directamente el resultado de verificación en el móvil.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - El QR resuelve a la URL pública de verificación.
  - Funciona con cámara del dispositivo / lector QR estándar.

### HU-18 — Entender el resultado de verificación

**Como** Visitante (empleador, inspector, tercero),  
**quiero** ver claramente si el certificado está VIGENTE, VENCIDO, SUSPENDIDO o ANULADO,  
**para** tomar una decisión informada.

- **Prioridad:** Alta  
- **Criterios de aceptación:**
  - Estado visible con color/etiqueta acorde a identidad visual.
  - Fechas de expedición y vencimiento visibles.
  - Nombre del centro emisor visible.

---

## Épica F — PWA y experiencia

### HU-19 — Instalar la aplicación

**Como** usuario,  
**quiero** instalar la PWA en mi dispositivo,  
**para** acceder rápidamente a la consulta o al panel.

- **Prioridad:** Media

### HU-20 — Consulta pública usable en campo

**Como** Visitante en obra,  
**quiero** una pantalla de verificación simple y legible en móvil,  
**para** validar certificados en condiciones reales de trabajo.

- **Prioridad:** Alta

---

## Mapa de prioridad sugerida (MVP)

| Orden | Historia | Motivo |
| --- | --- | --- |
| 1 | HU-01, HU-02 | Acceso y control |
| 2 | HU-04, HU-07, HU-08 | Maestros |
| 3 | HU-09, HU-10, HU-11 | Emisión |
| 4 | HU-15, HU-14, HU-12 | Estados |
| 5 | HU-16, HU-17, HU-18 | Valor público |
| 6 | HU-06, HU-19 | Extensiones |

---

## Trazabilidad rápida RF ↔ HU

| RF | Historias |
| --- | --- |
| RF-01, RF-02 | HU-01, HU-02, HU-03 |
| RF-03, RF-04 | HU-04, HU-05 |
| RF-05, RF-06 | HU-07, HU-08 |
| RF-07–RF-09 | HU-09, HU-17 |
| RF-10–RF-13 | HU-12, HU-13, HU-14, HU-15 |
| RF-14 | HU-10, HU-11 |
| RF-15, RF-16 | HU-16, HU-18 |
| RF-17 | HU-06 |
| RF-19 | HU-19, HU-20 |
