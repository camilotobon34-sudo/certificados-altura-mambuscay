# Frontend — PWA

React 19 + Vite + Tailwind CSS 4 + React Router, instalable como PWA (`vite-plugin-pwa`).

## Puesta en marcha

```bash
npm install
npm run dev       # http://localhost:5173 (el proxy envía /api a http://localhost:4000)
npm run build     # genera dist/ con service worker y manifest
npm run lint
```

En producción, si la API está en otro dominio, defina `VITE_API_URL` (por ejemplo `https://api.midominio.com`).

## Identidad visual

Los tokens de `docs/01-identidad-visual` y `docs/06-prototipo-figma` están en `src/index.css` (`@theme`):
colores `primary`, `accent`, `surface`, `ink`, `muted`, `line` y los estados `success`, `warning`, `info`, `danger`;
tipografías Barlow Condensed (títulos), Source Sans 3 (interfaz) e IBM Plex Mono (códigos), servidas localmente para funcionar sin conexión.

## Estructura

```
src/
  components/   ui (Button, Field, StatusBadge, Modal, Table...), brand (Logo), certificados (QRBlock), pwa
  context/      AuthContext (sesión JWT)
  hooks/        useApi, useCatalogos, useOnlineStatus
  layouts/      PublicLayout, InternalLayout (menú por rol), StudentLayout
  lib/          cliente API, constantes de roles/estados, formato de fechas (America/Bogota)
  pages/        public, auth, admin, estudiante
  routes/       RequireRole
```

## Rutas

| Ruta | Pantalla (docs/06) | Acceso |
| --- | --- | --- |
| `/` | P-01 Verificar certificado | Público |
| `/escanear` | P-02 Escanear QR | Público |
| `/verificar/:codigo` | P-03a–e Resultado | Público (destino del QR) |
| `/login` | A-01 / A-02 | Público |
| `/admin` … | I-01 a I-16 | Administrador, Personal autorizado (Niveles, Usuarios y Configuración solo Administrador) |
| `/mis-certificados` … | E-01, E-02 | Estudiante |
