import { randomInt } from 'node:crypto';

// Código de verificación: aleatorio, no adivinable e independiente del número de certificado
// (p. ej. 7K4P-X9QM-2RTD). Se guarda en certificados.codigo_verificacion (UNIQUE); los códigos
// ya emitidos en otros formatos (MAM-2026-001) siguen siendo válidos.
// Sin 0/O ni 1/I/L para evitar confusiones al transcribirlo.
const ALFABETO_CODIGO = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export const generarCodigoVerificacion = () =>
  Array.from({ length: 3 }, () =>
    Array.from({ length: 4 }, () => ALFABETO_CODIGO[randomInt(ALFABETO_CODIGO.length)]).join(''),
  ).join('-');

const PREFIJOS_NIVEL = {
  JEFE_AREA: 'JA',
  TRABAJADOR_AUTORIZADO: 'TA',
  COORDINADOR: 'CO',
  ENTRENADOR: 'EN',
};

const PREFIJOS_ACTIVIDAD = {
  REENTRENAMIENTO: 'RE',
  OTRAS_TAREAS_ALTO_RIESGO: 'AR',
};

export const formatearNumeroCertificado = ({ id, codigoNivel, codigoActividad, anio }) => {
  const prefijo = PREFIJOS_ACTIVIDAD[codigoActividad] ?? PREFIJOS_NIVEL[codigoNivel] ?? 'GN';
  return `MAM-${prefijo}-${anio}-${String(id).padStart(6, '0')}`;
};

export const enmascararDocumento = (numero = '') => {
  const visibles = 4;
  if (numero.length <= visibles) return numero;
  return '*'.repeat(numero.length - visibles) + numero.slice(-visibles);
};
