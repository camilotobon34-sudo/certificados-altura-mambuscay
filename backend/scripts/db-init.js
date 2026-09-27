import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { connect, runSqlFile } from './lib/sql-runner.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsSchema = path.resolve(
  here,
  '../../docs/05-script-mysql/certificados_altura_mambuscay.sql',
);
const migrationsDir = path.resolve(here, '../database/migrations');

const dbName = process.env.DB_NAME ?? 'certificados_altura_mambuscay';
const reset = process.argv.includes('--reset');
const publicVerifyBaseUrl = (
  process.env.PUBLIC_VERIFY_BASE_URL ?? 'http://localhost:5173/verificar'
).replace(/\/+$/, '');

if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
  throw new Error(`Nombre de base de datos inválido: ${dbName}`);
}

// El script de /docs crea y selecciona su propia base; en servicios administrados
// (p. ej. Clever Cloud) la base ya existe y no se permite CREATE DATABASE.
const esSeleccionDeBase = (statement) => /^(CREATE\s+DATABASE|USE)\s/i.test(statement);

const vaciarBase = async (connection) => {
  const [routines] = await connection.query(
    `SELECT ROUTINE_NAME AS nombre, ROUTINE_TYPE AS tipo
       FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = ?`,
    [dbName],
  );
  for (const { nombre, tipo } of routines) {
    await connection.query(`DROP ${tipo} IF EXISTS \`${nombre}\``);
  }

  const [tables] = await connection.query(
    `SELECT TABLE_NAME AS nombre, TABLE_TYPE AS tipo
       FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
    [dbName],
  );
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const { nombre, tipo } of tables) {
    const objeto = tipo === 'VIEW' ? 'VIEW' : 'TABLE';
    await connection.query(`DROP ${objeto} IF EXISTS \`${nombre}\``);
  }
  await connection.query('SET FOREIGN_KEY_CHECKS = 1');
};

const main = async () => {
  const connection = await connect();

  try {
    const [existing] = await connection.query(
      'SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?',
      [dbName],
    );
    if (existing.length === 0) {
      await connection.query(
        `CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
      );
      console.log(`Base de datos ${dbName} creada.`);
    }
    await connection.query(`USE \`${dbName}\``);

    if (reset) {
      await vaciarBase(connection);
      console.log(`Objetos de ${dbName} eliminados (--reset).`);
    }

    const [schemaTables] = await connection.query(
      `SELECT 1 FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'certificados'`,
      [dbName],
    );
    if (schemaTables.length === 0) {
      console.log('Ejecutando script base de /docs...');
      await runSqlFile(connection, docsSchema, { skip: esSeleccionDeBase });
    } else {
      console.log(`El esquema ya existe en ${dbName}; se omite el script base.`);
    }

    await connection.query(`
      CREATE TABLE IF NOT EXISTS migraciones (
        nombre      VARCHAR(150) NOT NULL PRIMARY KEY,
        aplicada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB`);

    const [applied] = await connection.query('SELECT nombre FROM migraciones');
    const appliedNames = new Set(applied.map((row) => row.nombre));
    const files = (await readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

    for (const file of files) {
      if (appliedNames.has(file)) continue;
      console.log(`Aplicando migración ${file}...`);
      await runSqlFile(connection, path.join(migrationsDir, file));
      await connection.query('INSERT INTO migraciones (nombre) VALUES (?)', [file]);
    }

    await connection.query('UPDATE configuracion_centro SET url_base_publica = ?', [
      publicVerifyBaseUrl,
    ]);

    console.log('Base de datos lista.');
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error('Error inicializando la base de datos:', error.message);
  process.exit(1);
});
