const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
};

const isProduction = process.env.NODE_ENV === 'production';

if (isProduction && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET es obligatorio en producción');
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProduction,
  port: Number(process.env.PORT ?? 4000),
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  db: {
    host: required('DB_HOST', 'localhost'),
    port: Number(process.env.DB_PORT ?? 3306),
    user: required('DB_USER', 'root'),
    password: process.env.DB_PASSWORD ?? '',
    database: required('DB_NAME', 'certificados_altura_mambuscay'),
  },
  // Vacía o inválida usa el valor por defecto: en mysql2 un límite 0 significa "sin límite".
  dbConnectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || (process.env.VERCEL ? 1 : 10),
  jwt: {
    secret: required('JWT_SECRET', 'dev-secret-no-usar-en-produccion'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  },
  publicVerifyBaseUrl: (
    process.env.PUBLIC_VERIFY_BASE_URL ?? 'http://localhost:5173/verificar'
  ).replace(/\/+$/, ''),
};
