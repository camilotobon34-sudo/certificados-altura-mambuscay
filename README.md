# CERTIFICADOS ALTURA MAMBUSCAY

PWA para gestión, consulta y verificación de certificados de formación en **trabajo en alturas**, alineada a la **Resolución 4272 de 2021** (Colombia).

## Estado del proyecto

**Etapa actual:** arquitectura base de frontend y backend implementada.

| Carpeta | Contenido |
| --- | --- |
| [`frontend/`](frontend/README.md) | PWA en React + Vite + Tailwind CSS |
| [`backend/`](backend/README.md) | API REST en Node.js + Express + MySQL |
| `docs/` | Documentación de análisis y diseño (fuente de verdad) |

## Ejecución local

Requisitos: Node.js 20 o superior y MySQL 8 / MariaDB 10.4 (por ejemplo, el de XAMPP) en ejecución.

```bash
# 1. Backend
cd backend
cp .env.example .env        # configure credenciales de BD, JWT_SECRET y administrador inicial
npm install
npm run db:init             # crea la BD a partir de docs/05-script-mysql + migraciones
npm run db:admin            # crea el primer Administrador
npm run db:demo             # opcional: datos ficticios del prototipo
npm run dev                 # http://localhost:4000/api

# 2. Frontend (otra terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

Con `npm run db:demo` se crean estas cuentas y códigos de prueba:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | valor de `ADMIN_CORREO` | valor de `ADMIN_PASSWORD` |
| Personal autorizado | personal@mambuscay.local | Personal12345 |
| Estudiante | laura@mambuscay.local | Estudiante123 |

Códigos de verificación: `7K4P-X9QM-2RTD` (vigente), `VNC4-8HTR-3MQA` (vencido), `SPD7-2KWX-9FJN` (suspendido), `ANL3-6YPB-4CZE` (anulado).

## Documentación de análisis y diseño (aprobada)

| # | Entregable | Ubicación |
| --- | --- | --- |
| 1 | Identidad visual | [docs/01-identidad-visual/identidad-visual.md](docs/01-identidad-visual/identidad-visual.md) |
| 2 | Requisitos funcionales y no funcionales | [docs/02-requisitos/requisitos.md](docs/02-requisitos/requisitos.md) |
| 3 | Historias de usuario | [docs/03-historias-usuario/historias-usuario.md](docs/03-historias-usuario/historias-usuario.md) |
| 4 | Modelo entidad-relación | [docs/04-modelo-er/modelo-entidad-relacion.md](docs/04-modelo-er/modelo-entidad-relacion.md) |
| 5 | Script de base de datos MySQL | [docs/05-script-mysql/certificados_altura_mambuscay.sql](docs/05-script-mysql/certificados_altura_mambuscay.sql) |
| 6 | Contexto y prompts del prototipo en Figma | [docs/06-prototipo-figma/](docs/06-prototipo-figma/contexto-prototipo-figma.md) |
