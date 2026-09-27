import mysql from 'mysql2/promise';
import { attachDatabasePool } from '@vercel/functions';
import { env } from './env.js';

// Fechas de negocio en hora de Colombia (America/Bogota, UTC-5 sin horario de verano).
const BOGOTA_OFFSET = '-05:00';

// Clever Cloud admite 5 conexiones por usuario y en Vercel cada instancia tiene su propio pool:
// allí las conexiones inactivas se cierran a los 5 s en lugar de retenerse 60 s.
const isVercel = Boolean(process.env.VERCEL);

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: env.dbConnectionLimit,
  maxIdle: env.dbConnectionLimit,
  idleTimeout: isVercel ? 5_000 : 60_000,
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

export const query = async (sql, params = []) => {
  const [rows] = await pool.query(sql, params);
  return rows;
};

export const withTransaction = async (callback) => {
  const connection = await pool.getConnection();
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
