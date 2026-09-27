# 1. Identidad visual — CERTIFICADOS ALTURA MAMBUSCAY

## 1.1 Concepto de marca

**Nombre completo:** CERTIFICADOS ALTURA MAMBUSCAY  
**Nombre de la empresa:** ALTURA MAMBUSCAY (nunca “Mambuscay” a secas)  
**Nombre corto / producto:** Altura Mambuscay  
**Sector:** Formación y verificación de capacitación en trabajo en alturas (Colombia).  
**Referencia normativa:** Resolución 4272 de 2021 del Ministerio del Trabajo.

La identidad transmite **confianza institucional**, **seguridad industrial** y **transparencia en la verificación pública**. El lenguaje visual se inspira en entornos de trabajo en altura (estructuras, cielo, señalización de seguridad), sin recurrir a clichés genéricos de “tech startup”.

**Personalidad de marca:** formal, clara, verificable, cercana al usuario final (trabajador y empleador), sin tono alarmista.

---

## 1.2 Logo (propuesta conceptual)

### Estructura

| Elemento | Descripción |
| --- | --- |
| Símbolo | Silueta geométrica de un anclaje / punto de anclaje simplificado, o un triángulo de seguridad integrado con una “M” estilizada. Líneas limpias, sin detalles fotográficos. |
| Wordmark | Tipografía sans-serif condensada en mayúsculas para “ALTURA MAMBUSCAY”; antetítulo “CERTIFICADOS” en peso regular, de modo que se lea “CERTIFICADOS ALTURA MAMBUSCAY”. |
| Variantes | Horizontal (principal), apilada (móvil / PWA icon), monocromo (impresión / QR), negativo (fondos oscuros). |

### Reglas de uso

- Área de respeto: mínimo el alto de la letra “M” alrededor del logo.
- No distorsionar, no aplicar sombras decorativas ni brillos.
- Sobre fotografías de obra, usar versión con fondo sólido o bloque de color institucional.

### Favicon / icono PWA

Cuadrado con fondo azul institucional (`#0A3A4A`) y símbolo en ámbar de seguridad (`#D97706`), sin texto largo (legible a 48×48 px).

---

## 1.3 Paleta de color

Inspirada en señalización industrial y cielo/estructura, evitando el cliché púrpura-indigo y fondos crema genéricos.

| Token | Hex | Uso |
| --- | --- | --- |
| `--color-primary` | `#0A3A4A` | Header, botones primarios, identidad fuerte |
| `--color-primary-dark` | `#062833` | Hover / estados activos |
| `--color-accent` | `#D97706` | CTA secundarios, estado VIGENTE, acentos de seguridad |
| `--color-accent-soft` | `#FEF3C7` | Fondos de alerta suave / badges |
| `--color-surface` | `#F3F6F8` | Fondo de aplicación |
| `--color-surface-elevated` | `#FFFFFF` | Formularios y paneles de trabajo |
| `--color-text` | `#1A2332` | Texto principal |
| `--color-text-muted` | `#5B6B7A` | Texto secundario |
| `--color-border` | `#D0DAE2` | Bordes y divisores |
| `--color-success` | `#15803D` | Confirmaciones |
| `--color-warning` | `#B45309` | Vencimiento próximo |
| `--color-danger` | `#B91C1C` | ANULADO / errores |
| `--color-info` | `#0369A1` | SUSPENDIDO / información |

### Colores por estado de certificado

| Estado | Color sugerido | Token |
| --- | --- | --- |
| VIGENTE | Verde institucional | `--color-success` |
| VENCIDO | Ámbar oscuro | `--color-warning` |
| SUSPENDIDO | Azul informativo | `--color-info` |
| ANULADO | Rojo | `--color-danger` |

---

## 1.4 Tipografía

Fuentes con carácter técnico y buena legibilidad en pantallas (evitar Inter / Roboto / Arial como tipografía de marca).

| Rol | Fuente propuesta | Fallback | Uso |
| --- | --- | --- | --- |
| Display / títulos | **Barlow Condensed** o **Oswald** | `sans-serif` | Nombre de marca, títulos de sección |
| Cuerpo / UI | **Source Sans 3** o **IBM Plex Sans** | `system-ui, sans-serif` | Formularios, tablas, párrafos |
| Monospace / códigos | **IBM Plex Mono** o **JetBrains Mono** | `ui-monospace, monospace` | Número de certificado, código de verificación |

### Escala tipográfica (referencia)

- H1: 2rem / 700  
- H2: 1.5rem / 600  
- H3: 1.25rem / 600  
- Body: 1rem / 400  
- Small / labels: 0.875rem / 500  

---

## 1.5 Iconografía e ilustración

- Estilo: line icons de trazo 1.5–2 px, esquinas ligeramente redondeadas.
- Temas: casco, arnés (simplificado), QR, documento verificado, calendario, escudo de autenticidad.
- Fotografía (landing / PWA splash): trabajo en alturas realista, bien iluminado, con EPP visible; nunca imágenes stock genéricas de “office dashboard”.
- No usar emojis como elemento de interfaz.

---

## 1.6 Componentes visuales (guía para etapas posteriores)

| Componente | Criterio |
| --- | --- |
| Botón primario | Fondo `--color-primary`, texto blanco, radio 6px |
| Botón secundario | Borde `--color-primary`, fondo transparente |
| Badge de estado | Pill corto solo para estados (excepción justificada); no usar pills decorativos en hero |
| Tablas | Filas alternadas suaves; prioridad a densidad y lectura |
| Consulta pública | Pantalla limpia: resultado de verificación centrado, sin menú administrativo |
| QR | Alto contraste; incluir logo pequeño del centro solo si no afecta lectura |

---

## 1.7 Tono de voz (microcopy)

- Formal y directo: “Verificar certificado”, “Certificado vigente”, “Motivo de anulación”.
- Evitar jerga innecesaria; cuando se cite normativa, nombrar “Resolución 4272 de 2021”.
- Mensajes de error accionables: “No se encontró un certificado con ese código. Revise el número e intente de nuevo.”

---

## 1.8 Aplicación en PWA

| Elemento | Definición |
| --- | --- |
| `name` | CERTIFICADOS ALTURA MAMBUSCAY |
| `short_name` | Altura Mambuscay |
| `theme_color` | `#0A3A4A` |
| `background_color` | `#F3F6F8` |
| Orientación | `portrait-primary` (consulta) / responsive admin |
| Splash | Logo + fondo surface; sin sobrecarga de texto |

---

## 1.9 Resumen para revisión

Esta identidad fija la dirección visual antes del frontend: **azul profundo institucional + ámbar de seguridad**, tipografía condensada para marca y sans legible para UI, y estados de certificado claramente diferenciados por color. La siguiente etapa de UI (React + Tailwind) deberá mapear estos tokens a variables CSS / tema de Tailwind.
