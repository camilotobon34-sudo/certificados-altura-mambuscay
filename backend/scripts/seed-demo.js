import bcrypt from 'bcryptjs';
import { connect } from './lib/sql-runner.js';

// Datos ficticios del prototipo (docs/06-prototipo-figma, sección 6.7). Solo para desarrollo.
const DEMO_PASSWORD_PERSONAL = 'Personal12345';
const DEMO_PASSWORD_ESTUDIANTE = 'Estudiante123';

const personas = [
  { doc: 'CC', numero: '1087654321', nombres: 'Laura Marcela', apellidos: 'Gómez Rincón' },
  { doc: 'CC', numero: '1094887766', nombres: 'Andrés Felipe', apellidos: 'Ramírez Ospina' },
  { doc: 'CE', numero: '5123987', nombres: 'Daniela', apellidos: 'Pérez Montoya' },
];

// dias relativos a hoy: expedicion / vencimiento
const certificados = [
  { persona: 0, nivel: 'TRABAJADOR_AUTORIZADO', actividad: 'FORMACION_INICIAL', codigo: '7K4P-X9QM-2RTD', exp: -30, venc: 510, estado: 'VIGENTE' },
  { persona: 1, nivel: 'COORDINADOR', actividad: 'FORMACION_INICIAL', codigo: 'VNC4-8HTR-3MQA', exp: -600, venc: -60, estado: 'VIGENTE' },
  { persona: 2, nivel: 'JEFE_AREA', actividad: 'FORMACION_INICIAL', codigo: 'SPD7-2KWX-9FJN', exp: -90, venc: 400, estado: 'SUSPENDIDO' },
  { persona: 1, nivel: 'TRABAJADOR_AUTORIZADO', actividad: 'REENTRENAMIENTO', codigo: 'ANL3-6YPB-4CZE', exp: -10, venc: 530, estado: 'ANULADO' },
  { persona: 0, nivel: 'TRABAJADOR_AUTORIZADO', actividad: 'REENTRENAMIENTO', codigo: 'PRX9-5TGD-7HWK', exp: -520, venc: 20, estado: 'VIGENTE' },
];

const main = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('El seed de demostración no se ejecuta en producción');
  }

  const db = await connect(process.env.DB_NAME ?? 'certificados_altura_mambuscay');
  try {
    const [[admin]] = await db.query(
      `SELECT u.id FROM usuarios u JOIN roles r ON r.id = u.rol_id
        WHERE r.codigo = 'ADMIN' ORDER BY u.id LIMIT 1`,
    );
    if (!admin) throw new Error('Primero cree el administrador con npm run db:admin');

    const [[yaExiste]] = await db.query(
      "SELECT COUNT(*) AS total FROM certificados WHERE codigo_verificacion = '7K4P-X9QM-2RTD'",
    );
    if (yaExiste.total > 0) {
      console.log('Los datos de demostración ya existen.');
      return;
    }

    const [[config]] = await db.query('SELECT url_base_publica FROM configuracion_centro LIMIT 1');
    const roleId = async (codigo) =>
      (await db.query('SELECT id FROM roles WHERE codigo = ?', [codigo]))[0][0].id;

    await db.beginTransaction();

    const personaIds = [];
    for (const p of personas) {
      const [[tipo]] = await db.query('SELECT id FROM tipos_documento WHERE codigo = ?', [p.doc]);
      const [result] = await db.query(
        `INSERT INTO personas_certificadas (tipo_documento_id, numero_documento, nombres, apellidos)
         VALUES (?, ?, ?, ?)`,
        [tipo.id, p.numero, p.nombres, p.apellidos],
      );
      personaIds.push(result.insertId);
    }

    for (const c of certificados) {
      const [[curso]] = await db.query(
        `SELECT cu.id, cu.intensidad_horaria FROM cursos cu
           JOIN niveles_formacion nf ON nf.id = cu.nivel_formacion_id
           JOIN tipos_actividad ta ON ta.id = cu.tipo_actividad_id
          WHERE nf.codigo = ? AND ta.codigo = ? LIMIT 1`,
        [c.nivel, c.actividad],
      );
      const [result] = await db.query(
        `INSERT INTO certificados
           (persona_id, curso_id, emitido_por_usuario_id, numero_certificado, codigo_verificacion,
            url_verificacion, fecha_expedicion, fecha_vencimiento, intensidad_horaria, estado,
            observacion_suspension)
         VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY),
                 DATE_ADD(CURDATE(), INTERVAL ? DAY), ?, ?, ?)`,
        [
          personaIds[c.persona], curso.id, admin.id, c.codigo, c.codigo,
          `${config.url_base_publica}/${c.codigo}`, c.exp, c.venc, curso.intensidad_horaria,
          c.estado, c.estado === 'SUSPENDIDO' ? 'Verificación documental pendiente (demo)' : null,
        ],
      );
      const prefijo = c.actividad === 'REENTRENAMIENTO' ? 'RE'
        : { TRABAJADOR_AUTORIZADO: 'TA', COORDINADOR: 'CO', JEFE_AREA: 'JA' }[c.nivel];
      await db.query(
        `UPDATE certificados
            SET numero_certificado = CONCAT('MAM-', ?, '-', YEAR(fecha_expedicion), '-', LPAD(id, 6, '0'))
          WHERE id = ?`,
        [prefijo, result.insertId],
      );
      await db.query(
        `INSERT INTO historial_estados (certificado_id, usuario_id, estado_anterior, estado_nuevo, observacion)
         VALUES (?, ?, NULL, 'VIGENTE', 'Emisión (demo)')`,
        [result.insertId, admin.id],
      );
      if (c.estado === 'ANULADO') {
        await db.query(
          'INSERT INTO anulaciones (certificado_id, anulado_por_usuario_id, motivo) VALUES (?, ?, ?)',
          [result.insertId, admin.id, 'Emitido por error en la intensidad horaria (demo)'],
        );
      }
      if (c.estado !== 'VIGENTE') {
        await db.query(
          `INSERT INTO historial_estados (certificado_id, usuario_id, estado_anterior, estado_nuevo, observacion)
           VALUES (?, ?, 'VIGENTE', ?, 'Cambio de estado (demo)')`,
          [result.insertId, admin.id, c.estado],
        );
      }
    }

    const personalHash = await bcrypt.hash(DEMO_PASSWORD_PERSONAL, 12);
    const estudianteHash = await bcrypt.hash(DEMO_PASSWORD_ESTUDIANTE, 12);
    await db.query(
      `INSERT INTO usuarios (rol_id, nombres, apellidos, correo, password_hash, activo)
       VALUES (?, 'Carlos', 'Mejía Duque', 'personal@mambuscay.local', ?, 1)`,
      [await roleId('PERSONAL_AUTORIZADO'), personalHash],
    );
    await db.query(
      `INSERT INTO usuarios (rol_id, persona_id, nombres, apellidos, correo, password_hash, activo)
       VALUES (?, ?, 'Laura Marcela', 'Gómez Rincón', 'laura@mambuscay.local', ?, 1)`,
      [await roleId('ESTUDIANTE'), personaIds[0], estudianteHash],
    );

    await db.commit();
    console.log('Datos de demostración creados:');
    console.log(`  Personal autorizado: personal@mambuscay.local / ${DEMO_PASSWORD_PERSONAL}`);
    console.log(`  Estudiante:          laura@mambuscay.local / ${DEMO_PASSWORD_ESTUDIANTE}`);
    console.log('  Códigos: 7K4P-X9QM-2RTD (vigente), VNC4-8HTR-3MQA (vencido),');
    console.log('           SPD7-2KWX-9FJN (suspendido), ANL3-6YPB-4CZE (anulado)');
  } catch (error) {
    await db.rollback().catch(() => {});
    throw error;
  } finally {
    await db.end();
  }
};

main().catch((error) => {
  console.error('No se pudo cargar la demostración:', error.message);
  process.exit(1);
});
