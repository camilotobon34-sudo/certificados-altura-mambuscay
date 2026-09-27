import bcrypt from 'bcryptjs';
import { connect } from './lib/sql-runner.js';

const {
  ADMIN_NOMBRES = 'Administrador',
  ADMIN_APELLIDOS = 'Altura Mambuscay',
  ADMIN_CORREO,
  ADMIN_PASSWORD,
  DB_NAME = 'certificados_altura_mambuscay',
} = process.env;

const main = async () => {
  if (!ADMIN_CORREO || !ADMIN_PASSWORD) {
    throw new Error('Defina ADMIN_CORREO y ADMIN_PASSWORD en backend/.env');
  }
  if (ADMIN_PASSWORD.length < 10) {
    throw new Error('ADMIN_PASSWORD debe tener al menos 10 caracteres');
  }

  const connection = await connect(DB_NAME);
  try {
    const [[rol]] = await connection.query("SELECT id FROM roles WHERE codigo = 'ADMIN'");
    const [existing] = await connection.query('SELECT id FROM usuarios WHERE correo = ?', [
      ADMIN_CORREO,
    ]);
    if (existing.length > 0) {
      console.log(`Ya existe un usuario con el correo ${ADMIN_CORREO}; no se modifica.`);
      return;
    }

    const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await connection.query(
      `INSERT INTO usuarios (rol_id, nombres, apellidos, correo, password_hash, activo)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [rol.id, ADMIN_NOMBRES, ADMIN_APELLIDOS, ADMIN_CORREO, hash],
    );
    console.log(`Administrador creado: ${ADMIN_CORREO}`);
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error('No se pudo crear el administrador:', error.message);
  process.exit(1);
});
