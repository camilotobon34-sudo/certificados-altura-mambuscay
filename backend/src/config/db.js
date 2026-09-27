import mysql from 'mysql2/promise';
import { attachDatabasePool } from '@vercel/functions';
import { env } from './env.js';

// Fechas de negocio en hora de Colombia (America/Bogota, UTC-5 sin horario de verano).
const BOGOTA_OFFSET = '-05:00';

// Clever Cloud admite 5 conexiones por usuario y en Vercel cada instancia tiene su propio pool.
// mysql2 solo cierra conexiones inactivas si maxIdle < connectionLimit: en Vercel no se retiene
// ninguna (se cierran ~1 s después de liberarse) y en local se conserva como máximo una.
const isVercel = Boolean(process.env.VERCEL);
const connectionLimit = env.dbConnectionLimit;

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit,
  maxIdle: isVercel ? 0 : Math.min(1, connectionLimit - 1),
  idleTimeout: isVercel ? 2_000 : 60_000,
  enableKeepAlive: true,
  dateStrings: true,
  timezone: BOGOTA_OFFSET,
  charset: 'utf8mb4',
});

pool.on('connection', (connection) => {
  connection.query(`SET time_zone = '${BOGOTA_OFFSET}'`);
});

// Mantiene viva la función de Vercel hasta cerrar las conexiones inactivas antes de congelarse.
if (isVercel) attachDatabasePool(pool.pool);

// Errores de MySQL por límite de conexiones: son transitorios y se reintentan.
const LIMITE_CONEXIONES = new Set(['ER_USER_LIMIT_REACHED', 'ER_TOO_MANY_USER_CONNECTIONS', 'ER_CON_COUNT_ERROR']);
const ESPERAS_MS = [150, 300, 600, 1_000, 1_500, 2_000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getConnection = async () => {
  for (let intento = 0; ; intento += 1) {
    try {
      return await pool.getConnection();
    } catch (error) {
      if (!LIMITE_CONEXIONES.has(error?.code) || intento >= ESPERAS_MS.length) throw error;
      await sleep(ESPERAS_MS[intento]);
    }
  }
};

export const query = async (sql, params = []) => {
  const connection = await getConnection();
  try {
    const [rows] = await connection.query(sql, params);
    return rows;
  } finally {
    connection.release();
  }
};

export const withTransaction = async (callback) => {
  const connection = await getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
