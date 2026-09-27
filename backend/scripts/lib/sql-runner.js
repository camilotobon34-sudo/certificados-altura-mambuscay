import { readFile } from 'node:fs/promises';
import mysql from 'mysql2/promise';

// Divide un script SQL respetando bloques con DELIMITER (procedimientos almacenados).
export const splitSqlStatements = (sql) => {
  const statements = [];
  let delimiter = ';';
  let buffer = [];

  for (const line of sql.split(/\r?\n/)) {
    const trimmed = line.trim();

    const delimiterMatch = trimmed.match(/^DELIMITER\s+(\S+)$/i);
    if (delimiterMatch) {
      delimiter = delimiterMatch[1];
      continue;
    }
    if (buffer.length === 0 && (trimmed === '' || trimmed.startsWith('--'))) continue;

    buffer.push(line);
    if (trimmed.endsWith(delimiter)) {
      const statement = buffer.join('\n').trim().slice(0, -delimiter.length).trim();
      if (statement) statements.push(statement);
      buffer = [];
    }
  }

  const rest = buffer.join('\n').trim();
  if (rest) statements.push(rest);
  return statements;
};

export const runSqlFile = async (connection, filePath, { skip } = {}) => {
  const sql = await readFile(filePath, 'utf8');
  for (const statement of splitSqlStatements(sql)) {
    if (skip?.(statement)) continue;
    await connection.query(statement);
  }
};

export const connect = (database) =>
  mysql.createConnection({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database,
    charset: 'utf8mb4',
  });
