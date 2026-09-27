import mysql from 'mysql2/promise';
import { env } from './env.js';

// Fechas de negocio en hora de Colombia (America/Bogota, UTC-5 sin horario de verano).
const BOGOTA_OFFSET = '-05:00';

export const pool = mysql.createPool({
  ...env.db,
  waitForConnections: true,
  connectionLimit: env.dbConnectionLimit,
  maxIdle: env.dbConnectionLimit,
  idleTimeout: 60_000,
  enableKeepAlive: true,
  dateStrings: true,
  timezone: BOGOTA_OFFSET,
  charset: 'utf8mb4',
});

pool.on('connection', (connection) => {
  connection.query(`SET time_zone = '${BOGOTA_OFFSET}'`);
});

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
