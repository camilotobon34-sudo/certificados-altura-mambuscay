# Backend — API REST

Node.js + Express 5 + MySQL (compatible con MariaDB 10.4 de XAMPP).

## Puesta en marcha

```bash
cp .env.example .env      # ajuste DB_*, JWT_SECRET y ADMIN_*
npm install
npm run db:init           # crea la BD con docs/05-script-mysql y aplica database/migrations
npm run db:admin          # crea el primer Administrador (ADMIN_CORREO / ADMIN_PASSWORD)
npm run db:demo           # opcional: datos ficticios del prototipo (solo desarrollo)
npm run dev               # http://localhost:4000/api
```

`npm run db:reset` elimina tablas, vistas y procedimientos de `DB_NAME` y vuelve a crear el esquema.

### Base administrada (Clever Cloud)

Use en `DB_*` los valores `MYSQL_ADDON_*` del add-on (`DB_NAME` = `MYSQL_ADDON_DB`). La base ya existe,
así que `db:init` crea el esquema dentro de ella sin ejecutar `CREATE DATABASE`. El plan gratuito
permite 5 conexiones simultáneas: deje `DB_CONNECTION_LIMIT=3` para que la API no las agote y los
scripts `db:*` (una conexión cada uno) puedan ejecutarse.

## Base de datos

- El esquema base es el script aprobado en `docs/05-script-mysql/` y no se modifica.
- Los cambios posteriores van en `database/migrations/` y se registran en la tabla `migraciones`.
  - `001_usuarios_persona.sql`: vincula la cuenta de rol ESTUDIANTE con su persona certificada (HU-06).

## Estructura

```
src/
  config/        variables de entorno y pool MySQL (zona horaria America/Bogota)
  middlewares/   autenticación JWT, autorización por rol, validación (zod), errores
  modules/       auth, public, catalogos, personas, cursos, certificados, usuarios, estudiante, configuracion
  utils/         códigos de verificación, estados, paginación
scripts/         db-init, create-admin, seed-demo
database/        migraciones
```

## Endpoints

| Método | Ruta | Acceso |
| --- | --- | --- |
| GET | `/api/health` | Público |
| POST | `/api/public/consulta` | Público: exige `tipoDocumento` + `numeroDocumento` + `codigo` del mismo certificado; si no coinciden responde un 404 genérico (documento enmascarado; 15 por minuto) |
| GET | `/api/public/tipos-documento` | Público: tipos de documento para el formulario de consulta |
| POST | `/api/auth/login` · GET `/api/auth/me` · PUT `/api/auth/password` | Público · Autenticado · Autenticado (cambio de contraseña propia) |
| GET | `/api/catalogos` | Autenticado |
| GET/POST/PUT | `/api/personas` | Administrador, Personal autorizado |
| GET/POST/PUT | `/api/cursos` | Administrador, Personal autorizado |
| GET | `/api/certificados`, `/api/certificados/resumen`, `/api/certificados/:id` | Administrador, Personal autorizado |
| POST | `/api/certificados` (emitir), `/:id/suspender`, `/:id/reactivar` | Administrador, Personal autorizado |
| POST | `/api/certificados/:id/anular` | **Solo Administrador** (motivo + confirmación del número) |
| PUT | `/api/certificados/:id` (edita número, curso, horas y fechas; el código de verificación no cambia) | **Solo Administrador** |
| GET/PUT | `/api/configuracion` | Lectura interna · edición Administrador |
| GET/POST/PUT | `/api/usuarios` | Solo Administrador |
| GET | `/api/estudiante/certificados`, `/api/estudiante/certificados/:id` | Estudiante (solo los propios) |

## Reglas implementadas

- Estado efectivo: ANULADO > SUSPENDIDO > VENCIDO (por fecha, calculado en cada consulta) > VIGENTE.
- Intensidades mínimas de la Res. 4272 de 2021: Jefe de área 8 h, Trabajador autorizado 32 h, Coordinador 80 h, Entrenador 130 h; reentrenamiento 8 h (tipo de actividad, no nivel).
- La consulta pública usa la vista `vw_consulta_publica_certificado`: documento enmascarado, sin correo, teléfono ni motivos internos.
- Toda emisión y cambio de estado queda en `historial_estados`; la anulación se registra en `anulaciones`.
