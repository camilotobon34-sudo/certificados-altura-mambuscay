# Prompts para Figma AI (Figma Make / First Draft)

Usar un prompt por bloque para obtener resultados más controlados. Después de cada generación, ajustar manualmente a las variables y estilos definidos en [contexto-prototipo-figma.md](contexto-prototipo-figma.md).

---

## Prompt 0 — Contexto general (pegar primero)

```text
Diseña el prototipo de una PWA en español (Colombia) llamada "CERTIFICADOS ALTURA MAMBUSCAY".
Es un sistema para que un centro de formación gestione certificados de capacitación en trabajo
en alturas (Resolución 4272 de 2021 de Colombia) y para que cualquier persona verifique
públicamente, sin crear cuenta, la autenticidad de un certificado mediante código o QR.

Estilo: institucional, confiable, de seguridad industrial. Limpio, alto contraste, sin
decoraciones innecesarias, sin emojis, sin degradados morados.

Colores:
- Primario azul petróleo #0A3A4A (hover #062833)
- Acento ámbar de seguridad #D97706 (suave #FEF3C7)
- Fondo #F3F6F8, tarjetas #FFFFFF, bordes #D0DAE2
- Texto #1A2332, texto secundario #5B6B7A
- Estados: VIGENTE #15803D, VENCIDO #B45309, SUSPENDIDO #0369A1, ANULADO #B91C1C

Tipografía:
- Títulos y marca: Barlow Condensed (600–700)
- Interfaz y párrafos: Source Sans 3
- Números de certificado y códigos: IBM Plex Mono

Iconos de línea (estilo Lucide), trazo 1.5–2 px. Radios: 6 px botones/inputs, 10 px tarjetas.
Los estados siempre llevan icono + texto, nunca solo color.
```

## Prompt 1 — Logo e icono PWA

```text
Crea el logo de "CERTIFICADOS ALTURA MAMBUSCAY": un símbolo geométrico que integre una letra
"M" con un triángulo de seguridad o un punto de anclaje simplificado, trazo sólido sin degradados.
Wordmark "ALTURA MAMBUSCAY" en Barlow Condensed Bold mayúsculas y encima "CERTIFICADOS" en
Source Sans 3 SemiBold con tracking amplio (se lee "CERTIFICADOS ALTURA MAMBUSCAY").
Genera variantes: horizontal, apilada, monocromo #0A3A4A, negativo blanco sobre #0A3A4A,
e icono de app cuadrado con fondo #0A3A4A y símbolo en #D97706 sin texto.
```

## Prompt 2 — Consulta pública (móvil 390 × 844)

```text
Pantalla móvil de inicio pública. Header con logo horizontal y enlace discreto
"Acceso personal autorizado". Título "Verifique la autenticidad de un certificado".
Campo "Código de verificación o número de certificado", botón primario "Verificar"
y botón secundario con icono QR "Escanear código QR". Texto breve: "Certificados de formación
en trabajo en alturas conforme a la Resolución 4272 de 2021". Pie con nombre del centro.
Genera también la pantalla de escaneo QR con marco de cámara y opción
"Ingresar código manualmente".
```

## Prompt 3 — Resultados de verificación (móvil)

```text
Genera cinco variantes de la pantalla de resultado de verificación:
1) VIGENTE (verde #15803D, escudo con check, "Certificado vigente")
2) VENCIDO (ámbar #B45309, "Certificado vencido el 15/09/2025")
3) SUSPENDIDO (azul #0369A1, "Certificado suspendido")
4) ANULADO (rojo #B91C1C, "Certificado anulado — no válido")
5) NO ENCONTRADO ("No se encontró un certificado con ese código. Revise el número e intente de nuevo.")

En las variantes 1–4 muestra solo: nombre completo "Laura Marcela Gómez Rincón",
documento enmascarado "CC ******4321", curso "Capacitación y entrenamiento — Trabajador autorizado",
nivel "Trabajador autorizado", intensidad "32 horas", expedición "15/03/2026",
vencimiento "15/09/2027", número "MAM-TA-2026-000123" en fuente monoespaciada,
centro "CERTIFICADOS ALTURA MAMBUSCAY" y fecha/hora de consulta.
No muestres correo, teléfono ni motivos internos. Botón "Verificar otro certificado".
```

## Prompt 4 — Login y panel interno (desktop 1440 × 900)

```text
Pantalla de inicio de sesión con logo apilado, campos correo y contraseña, botón "Ingresar".
Luego un panel interno con sidebar azul #0A3A4A (logo en negativo) con menú: Panel,
Certificados, Personas certificadas, Cursos, Niveles de formación, Usuarios, Configuración.
Topbar con nombre del usuario, rol "Administrador" y "Cerrar sesión".
Contenido del panel: cuatro tarjetas con contadores por estado (Vigentes, Vencidos,
Suspendidos, Anulados), tabla "Próximos a vencer (30 días)", tabla "Últimas emisiones"
y botón primario "Emitir certificado".
```

## Prompt 5 — Gestión de certificados (desktop)

```text
Pantalla "Certificados": filtros por estado, curso, rango de fechas y documento; tabla con
número de certificado (monoespaciado), persona, documento, curso, nivel, expedición,
vencimiento y badge de estado; paginación.

Pantalla "Emitir certificado" con stepper de 4 pasos: 1) Persona (buscar por documento o
registrar nueva), 2) Curso y nivel (niveles: Jefes de área 8 h, Trabajador autorizado 32 h,
Coordinador de trabajo en alturas 80 h, Entrenador en trabajo en alturas 130 h; y tipo de
actividad Formación inicial o Reentrenamiento 8 h), 3) Fechas e intensidad horaria,
4) Revisión. Pantalla de confirmación con número de certificado, código de verificación
"7K4P-X9QM-2RTD" y bloque QR con botones Descargar e Imprimir.

Pantalla "Detalle de certificado" con todos los datos, bloque QR, historial de estados
y acciones: Suspender, Reactivar y Anular (botón rojo, solo Administrador).
```

## Prompt 6 — Modales de estado

```text
Modal "Suspender certificado" con campo de observación obligatorio.
Modal "Reactivar certificado" con aviso de que el estado será Vigente o Vencido según la fecha.
Modal destructivo "Anular certificado" (solo Administrador): advertencia en rojo de que la acción
es irreversible, campo "Motivo de la anulación" obligatorio, campo para escribir el número
de certificado como confirmación y botón rojo "Anular certificado".
```

## Prompt 7 — Personas, cursos, usuarios y portal del estudiante

```text
Pantallas desktop: lista y formulario de Personas certificadas (tipo de documento CC, CE, TI,
PA, PPT; número; nombres; apellidos; correo y teléfono marcados como "dato privado");
lista y formulario de Cursos con validación de intensidad mínima según el nivel;
tabla de Niveles de formación con la nota "El reentrenamiento no es un nivel de formación
(Res. 4272 de 2021, Art. 27)"; lista y formulario de Usuarios internos con rol y activo.

Pantallas móviles del portal del estudiante: "Mis certificados" con tarjetas (curso, estado,
vencimiento) y detalle con QR y botón de descarga.
```
