# 6. Contexto para el prototipo visual en Figma

Documento puente entre los entregables aprobados (1–5) y la implementación. Sirve para construir en Figma el **sistema de diseño** y las **pantallas principales** de CERTIFICADOS ALTURA MAMBUSCAY, ya sea a mano o con ayuda de Figma AI (Figma Make / First Draft).

Fuentes de verdad:

- Identidad visual: [01-identidad-visual/identidad-visual.md](../01-identidad-visual/identidad-visual.md)
- Requisitos: [02-requisitos/requisitos.md](../02-requisitos/requisitos.md)
- Historias de usuario: [03-historias-usuario/historias-usuario.md](../03-historias-usuario/historias-usuario.md)
- Modelo de datos: [04-modelo-er/modelo-entidad-relacion.md](../04-modelo-er/modelo-entidad-relacion.md)

Prompt listo para pegar en Figma AI: [prompt-figma.md](prompt-figma.md)

---

## 6.1 Estructura del archivo Figma

Nombre del archivo: **Certificados Altura Mambuscay — Prototipo v1**

| Página | Contenido |
| --- | --- |
| `00 Portada` | Nombre del proyecto, versión, fecha, estado (En revisión / Aprobado) |
| `01 Fundamentos` | Variables de color, estilos de texto, grilla, espaciado, radios, sombras, iconos |
| `02 Logo` | Símbolo, wordmark, variantes (horizontal, apilada, monocromo, negativo), icono PWA |
| `03 Componentes` | Biblioteca de componentes con variantes |
| `04 Público — Móvil` | Pantallas de consulta pública (390 × 844) |
| `05 Público — Desktop` | Consulta pública en escritorio (1440 × 900) |
| `06 Interno — Desktop` | Panel de Administrador y Personal autorizado (1440 × 900) |
| `07 Interno — Móvil` | Versiones responsive clave del panel (390 × 844) |
| `08 Estudiante` | Portal de la persona certificada |
| `09 Prototipo` | Flujos conectados para presentación |
| `10 Handoff` | Notas para desarrollo (mapeo a Tailwind, estados, reglas) |

---

## 6.2 Fundamentos (página `01 Fundamentos`)

### Variables de color (colección `Altura Mambuscay / Color`)

| Variable Figma | Hex | Uso |
| --- | --- | --- |
| `color/primary` | `#0A3A4A` | Header, botón primario, sidebar |
| `color/primary-dark` | `#062833` | Hover / activo |
| `color/accent` | `#D97706` | Acentos de seguridad, CTA secundario, foco |
| `color/accent-soft` | `#FEF3C7` | Fondos de aviso suave |
| `color/surface` | `#F3F6F8` | Fondo general |
| `color/surface-elevated` | `#FFFFFF` | Tarjetas, formularios, tablas |
| `color/text` | `#1A2332` | Texto principal |
| `color/text-muted` | `#5B6B7A` | Texto secundario, placeholders |
| `color/border` | `#D0DAE2` | Bordes y divisores |
| `color/success` | `#15803D` | VIGENTE, confirmaciones |
| `color/warning` | `#B45309` | VENCIDO, próximo a vencer |
| `color/danger` | `#B91C1C` | ANULADO, errores |
| `color/info` | `#0369A1` | SUSPENDIDO, información |

Para cada color de estado crear también una variante de fondo suave (10–12 % de opacidad sobre blanco) para badges y paneles de resultado:

| Variable | Valor sugerido |
| --- | --- |
| `color/success-soft` | `#DCFCE7` |
| `color/warning-soft` | `#FEF3C7` |
| `color/danger-soft` | `#FEE2E2` |
| `color/info-soft` | `#E0F2FE` |

Verificar contraste AA (≥ 4.5:1) de texto sobre cada fondo con un plugin de contraste.

### Tipografía (estilos de texto)

Las tres familias están en Google Fonts y disponibles en Figma.

| Estilo Figma | Familia | Tamaño / Interlineado | Peso |
| --- | --- | --- | --- |
| `Display/Brand` | Barlow Condensed | 40 / 44 | Bold 700, mayúsculas, tracking +2 % |
| `Heading/H1` | Barlow Condensed | 32 / 38 | SemiBold 600 |
| `Heading/H2` | Barlow Condensed | 24 / 30 | SemiBold 600 |
| `Heading/H3` | Source Sans 3 | 20 / 28 | SemiBold 600 |
| `Body/Default` | Source Sans 3 | 16 / 24 | Regular 400 |
| `Body/Strong` | Source Sans 3 | 16 / 24 | SemiBold 600 |
| `Label/Default` | Source Sans 3 | 14 / 20 | Medium 500 |
| `Caption` | Source Sans 3 | 12 / 16 | Regular 400 |
| `Code/Certificate` | IBM Plex Mono | 16 / 24 | Medium 500 |
| `Code/Small` | IBM Plex Mono | 13 / 18 | Regular 400 |

`Code/*` se usa para número de certificado, código de verificación y número de documento enmascarado.

### Grilla y espaciado

| Breakpoint | Frame | Grilla |
| --- | --- | --- |
| Móvil | 390 × 844 | 4 columnas, margen 16, gutter 16 |
| Tablet | 834 × 1194 | 8 columnas, margen 32, gutter 24 |
| Desktop | 1440 × 900 | 12 columnas, margen 80 (público) / contenido fluido con sidebar 256 (interno), gutter 24 |

- Escala de espaciado (base 4): 4, 8, 12, 16, 24, 32, 48, 64.
- Radios: 4 (inputs pequeños), 6 (botones, inputs), 10 (tarjetas), 999 (solo badges de estado).
- Sombras: `elevation/1` = y 1, blur 2, `#1A2332` 8 %; `elevation/2` = y 4, blur 12, `#1A2332` 10 %.
- Área táctil mínima en móvil: 44 × 44.

### Iconografía

- Set recomendado: **Lucide** o **Phosphor (Regular)**, trazo 1.5–2 px.
- Iconos necesarios: escudo con check (verificado), QR, escáner, documento, calendario, reloj, usuario, usuarios, casco, libro/curso, filtro, búsqueda, descargar, imprimir, pausa (suspender), prohibido (anular), cerrar sesión, menú, alerta, información.
- Sin emojis en la interfaz.

---

## 6.3 Logo (página `02 Logo`)

Construir el logo como vector editable siguiendo la propuesta aprobada:

| Pieza | Especificación |
| --- | --- |
| Símbolo | “M” geométrica integrada en un triángulo de seguridad o punto de anclaje simplificado. Trazo sólido, sin degradados. |
| Wordmark | “ALTURA MAMBUSCAY” en Barlow Condensed Bold, mayúsculas. Encima, “CERTIFICADOS” en Source Sans 3 SemiBold, tracking +8 %. |
| Horizontal | Símbolo a la izquierda + wordmark. Uso principal en header y landing. |
| Apilada | Símbolo arriba, wordmark centrado. Uso en splash y login. |
| Monocromo | Todo en `color/primary` o negro. Uso en impresión y junto al QR. |
| Negativo | Blanco sobre `color/primary`. Uso en sidebar y header oscuro. |
| Icono PWA | Fondo `#0A3A4A`, símbolo en `#D97706`, sin texto. Exportar 192, 512 y 512 maskable (zona segura 80 %). |
| Favicon | Símbolo simplificado a 32 × 32 y 16 × 16. |

Documentar el área de respeto (alto de la “M”) y ejemplos de uso incorrecto (deformado, con sombra, sobre foto sin fondo).

---

## 6.4 Componentes (página `03 Componentes`)

Crear como componentes con variantes y propiedades de Figma:

| Componente | Variantes / propiedades |
| --- | --- |
| `Button` | tipo: primary, secondary, ghost, danger · tamaño: sm, md, lg · estado: default, hover, focus, disabled, loading · icono: none, leading, trailing |
| `Input` | estado: default, focus, error, disabled · con label, ayuda y mensaje de error |
| `Select` | igual a Input + lista desplegable |
| `DatePicker` | campo + calendario |
| `SearchBar` | con icono y botón de búsqueda |
| `StatusBadge` | VIGENTE, VENCIDO, SUSPENDIDO, ANULADO |
| `VerificationResult` | VIGENTE, VENCIDO, SUSPENDIDO, ANULADO, NO_ENCONTRADO (panel grande de resultado público) |
| `CertificateCard` | resumen de certificado (lista del estudiante y móvil interno) |
| `DataTable` | encabezado, fila, fila hover, fila seleccionada, vacía, cargando, paginación |
| `Sidebar` | rol: admin, personal · ítem activo/inactivo · colapsado |
| `Topbar` | con usuario, rol y cerrar sesión |
| `PublicHeader` | logo + enlace “Acceso personal” |
| `Modal` | default, confirmación, destructivo (anular) |
| `Toast` | success, error, info, warning |
| `EmptyState` | sin resultados, sin datos |
| `QRBlock` | QR + código de verificación + botones descargar/imprimir |
| `MaskedDocument` | tipo + número enmascarado (`CC ******1234`) |
| `Stepper` | pasos del formulario de emisión |
| `InstallBanner` | aviso para instalar la PWA |
| `OfflineBanner` | aviso sin conexión |

---

## 6.5 Mapa de pantallas

### Público (sin cuenta)

| ID | Pantalla | Historias | Contenido principal |
| --- | --- | --- | --- |
| P-01 | Inicio / Verificar certificado | HU-16, HU-20 | Logo, título “Verifique la autenticidad de un certificado”, campo de código o número de certificado, botón “Verificar”, botón “Escanear QR”, texto breve sobre la Res. 4272 de 2021, enlace discreto “Acceso personal autorizado” |
| P-02 | Escanear QR | HU-17 | Vista de cámara con marco de escaneo, instrucción, botón “Ingresar código manualmente” |
| P-03a | Resultado — VIGENTE | HU-18 | Panel verde con escudo, “Certificado vigente”, datos de verificación |
| P-03b | Resultado — VENCIDO | HU-18 | Panel ámbar, “Certificado vencido el [fecha]” |
| P-03c | Resultado — SUSPENDIDO | HU-18 | Panel azul, “Certificado suspendido”, sin motivo interno |
| P-03d | Resultado — ANULADO | HU-18 | Panel rojo, “Certificado anulado — no válido”, sin motivo |
| P-03e | Resultado — No encontrado | HU-16 | “No se encontró un certificado con ese código. Revise el número e intente de nuevo.” |
| P-04 | Sin conexión | RNF-10 | Mensaje offline con opción de reintentar |

**Datos visibles en el resultado (RF-16), en este orden:**

1. Estado (badge grande)
2. Nombre completo
3. Documento enmascarado (`CC ******1234`)
4. Curso y nivel de formación
5. Intensidad horaria
6. Fecha de expedición y fecha de vencimiento
7. Número de certificado (monoespaciado)
8. Centro de formación emisor
9. Fecha y hora de la consulta

**Nunca mostrar:** correo, teléfono, observaciones internas, motivo de anulación, usuario que emitió o anuló.

### Autenticación

| ID | Pantalla | Historias |
| --- | --- | --- |
| A-01 | Iniciar sesión (correo, contraseña, botón “Ingresar”, error genérico) | HU-01 |
| A-02 | Sesión expirada | HU-01 |

### Interno — Administrador y Personal autorizado

| ID | Pantalla | Rol | Historias | Contenido principal |
| --- | --- | --- | --- | --- |
| I-01 | Panel principal | Ambos | HU-10 | Contadores por estado (vigentes, vencidos, suspendidos, anulados), próximos a vencer (30 días), últimas emisiones, acceso rápido “Emitir certificado” |
| I-02 | Personas certificadas — lista | Ambos | HU-05 | Búsqueda por documento/nombre, tabla, botón “Registrar persona” |
| I-03 | Persona — formulario | Ambos | HU-04, HU-05 | Tipo de documento, número, nombres, apellidos, correo y teléfono (marcados como privados) |
| I-04 | Persona — detalle | Ambos | HU-05 | Datos y lista de certificados de la persona |
| I-05 | Cursos — lista | Ambos | HU-08 | Nombre, nivel, tipo de actividad, intensidad, activo |
| I-06 | Curso — formulario | Ambos | HU-08 | Nivel (Res. 4272), tipo de actividad, intensidad con validación de mínimo del nivel |
| I-07 | Niveles de formación | Admin | HU-07 | Tabla de solo lectura/edición controlada con los 4 niveles y horas mínimas; nota “El reentrenamiento no es un nivel de formación” |
| I-08 | Certificados — lista | Ambos | HU-10 | Filtros: estado, curso, rango de fechas, documento; tabla con badge de estado |
| I-09 | Emitir certificado (stepper) | Ambos | HU-09 | Paso 1 persona · Paso 2 curso y nivel · Paso 3 fechas e intensidad · Paso 4 revisión · Confirmación con número, código y QR |
| I-10 | Certificado — detalle | Ambos | HU-11 | Todos los datos, `QRBlock`, historial de estados, acciones según rol |
| I-11 | Modal suspender | Ambos | HU-12 | Observación obligatoria, botón “Suspender” |
| I-12 | Modal reactivar | Ambos | HU-13 | Confirmación; aviso de que el estado resultante será VIGENTE o VENCIDO según fecha |
| I-13 | Modal anular | Solo Admin | HU-14 | Advertencia destructiva, motivo obligatorio, escribir el número de certificado para confirmar, botón rojo “Anular certificado” |
| I-14 | Usuarios internos — lista | Solo Admin | HU-02 | Nombre, correo, rol, activo |
| I-15 | Usuario — formulario | Solo Admin | HU-02 | Datos, rol, activar/desactivar |
| I-16 | Configuración del centro | Solo Admin | — | Razón social, NIT, ciudad, URL pública, logo |

**Diferencias visibles por rol:**

- Personal autorizado **no ve** el botón “Anular”, ni los menús Usuarios, Niveles y Configuración.
- En certificados ANULADOS, todas las acciones de edición quedan deshabilitadas y se muestra el bloque de anulación (motivo, fecha, usuario) solo en la vista interna.

### Estudiante / persona certificada

| ID | Pantalla | Historias |
| --- | --- | --- |
| E-01 | Mis certificados (tarjetas con estado, curso, vencimiento) | HU-06 |
| E-02 | Detalle de mi certificado con QR y descarga | HU-06 |

### PWA

| ID | Pantalla | Historias |
| --- | --- | --- |
| W-01 | Splash (logo apilado sobre `color/surface`) | HU-19 |
| W-02 | Banner de instalación | HU-19 |

---

## 6.6 Flujos del prototipo (página `09 Prototipo`)

| Flujo | Recorrido | Dispositivo |
| --- | --- | --- |
| F1 — Verificación por código | P-01 → P-03a (y variantes b–e) | Móvil y desktop |
| F2 — Verificación por QR | P-01 → P-02 → P-03a | Móvil |
| F3 — Emisión de certificado | A-01 → I-01 → I-09 (4 pasos) → confirmación → I-10 | Desktop |
| F4 — Suspender y reactivar | I-08 → I-10 → I-11 → I-10 (SUSPENDIDO) → I-12 → I-10 | Desktop |
| F5 — Anulación (Admin) | I-08 → I-10 → I-13 → I-10 (ANULADO) → P-03d | Desktop |
| F6 — Restricción de rol | Mismo I-10 visto como Personal autorizado (sin botón Anular) | Desktop |
| F7 — Portal estudiante | A-01 → E-01 → E-02 | Móvil |

Interacciones: `On click → Navigate to` con transición `Smart animate` 200 ms; modales como `Open overlay` centrado con fondo `#1A2332` al 40 %.

---

## 6.7 Contenido de ejemplo (datos ficticios)

Usar siempre datos ficticios y coherentes con la normativa:

| Campo | Ejemplo |
| --- | --- |
| Persona | Laura Marcela Gómez Rincón |
| Documento | CC 1.087.654.321 → público: `CC ******4321` |
| Curso | Capacitación y entrenamiento — Trabajador autorizado |
| Nivel | Trabajador autorizado |
| Intensidad | 32 horas |
| Expedición | 15/03/2026 |
| Vencimiento | 15/09/2027 |
| Número de certificado | `MAM-TA-2026-000123` |
| Código de verificación | `7K4P-X9QM-2RTD` |
| Centro | CERTIFICADOS ALTURA MAMBUSCAY |

Otros ejemplos para tablas: Jefe de área (8 h), Coordinador de trabajo en alturas (80 h), Entrenador en trabajo en alturas (130 h), Reentrenamiento trabajador autorizado (8 h, tipo de actividad “Reentrenamiento”).

**Nota:** la vigencia de 18 meses del ejemplo es ilustrativa, tomada de la periodicidad de reentrenamiento; la fecha de vencimiento real la define el centro al emitir.

Formato de fechas: `DD/MM/AAAA`. Idioma: español (Colombia).

---

## 6.8 Accesibilidad y criterios visuales

- Contraste AA en textos y estados; el estado nunca se comunica solo con color (siempre icono + texto).
- Foco visible: anillo de 2 px `color/accent` con separación de 2 px.
- Etiquetas visibles en todos los campos (no solo placeholder).
- Tamaño mínimo de texto: 14 px en UI, 16 px en inputs móviles.
- Pantalla de resultado público legible a pleno sol: fondos sólidos, texto grande, sin decoraciones.

---

## 6.9 Handoff para desarrollo (página `10 Handoff`)

Anotar en Figma, junto a cada pantalla:

- Nombre de la ruta prevista (ej. `/verificar/:codigo`, `/admin/certificados/:id`).
- Rol que puede verla.
- Estados de la pantalla: cargando, vacío, error, éxito.
- Reglas de negocio visibles (prioridad de estados: ANULADO > SUSPENDIDO > VENCIDO > VIGENTE).
- Correspondencia de variables de Figma con los tokens de la identidad visual, para mapearlos después al tema de Tailwind.

---

## 6.10 Checklist de revisión del prototipo

- [ ] Variables de color y estilos de texto creados según la identidad aprobada.
- [ ] Logo vectorial con sus cinco variantes e icono PWA.
- [ ] Biblioteca de componentes con variantes de estado.
- [ ] Las cinco variantes del resultado público (P-03a–e).
- [ ] Consulta pública sin datos sensibles.
- [ ] Botón y modal de anulación visibles solo para Administrador, con motivo obligatorio.
- [ ] Niveles de formación coinciden con la Res. 4272 de 2021; reentrenamiento como tipo de actividad.
- [ ] Flujos F1–F7 navegables.
- [ ] Versiones móvil y desktop de la consulta pública.
