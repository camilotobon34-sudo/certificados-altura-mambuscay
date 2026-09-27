import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './config/db.js';

const app = createApp();

const server = app.listen(env.port, (error) => {
  if (error) {
    console.error(
      error.code === 'EADDRINUSE'
        ? `El puerto ${env.port} ya está en uso. Detenga el otro proceso o cambie PORT en .env.`
        : `No se pudo iniciar el servidor: ${error.message}`,
    );
    process.exit(1);
  }
  console.log(`API Certificados Altura Mambuscay en http://localhost:${env.port}/api`);
});

const shutdown = async (signal) => {
  console.log(`${signal} recibido, cerrando servidor...`);
  server.close(async () => {
    await pool.end().catch(() => {});
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
