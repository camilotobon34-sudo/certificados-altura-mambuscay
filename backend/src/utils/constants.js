export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  PERSONAL: 'PERSONAL_AUTORIZADO',
  ESTUDIANTE: 'ESTUDIANTE',
});

export const ESTADOS = Object.freeze({
  VIGENTE: 'VIGENTE',
  VENCIDO: 'VENCIDO',
  SUSPENDIDO: 'SUSPENDIDO',
  ANULADO: 'ANULADO',
});

export const TIPOS_ACTIVIDAD = Object.freeze({
  FORMACION_INICIAL: 'FORMACION_INICIAL',
  REENTRENAMIENTO: 'REENTRENAMIENTO',
});

// Res. 4272 de 2021, Art. 27: el reentrenamiento dura mínimo 8 horas.
export const REENTRENAMIENTO_MIN_HORAS = 8;

// Prioridad: ANULADO > SUSPENDIDO > VENCIDO (por fecha) > VIGENTE.
export const estadoEfectivoSql = (alias = 'c') => `
  CASE
    WHEN ${alias}.estado = 'ANULADO' THEN 'ANULADO'
    WHEN ${alias}.estado = 'SUSPENDIDO' THEN 'SUSPENDIDO'
    WHEN ${alias}.fecha_vencimiento < CURDATE() THEN 'VENCIDO'
    ELSE 'VIGENTE'
  END`;
