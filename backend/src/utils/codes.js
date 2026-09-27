// Código de consulta: MAM-{año}-{consecutivo del año, mínimo 3 dígitos}. Se guarda en
// certificados.codigo_verificacion (UNIQUE); los códigos anteriores siguen siendo válidos.
export const PREFIJO_CODIGO = 'MAM';

export const formatearCodigoConsulta = (anio, consecutivo) =>
  `${PREFIJO_CODIGO}-${anio}-${String(consecutivo).padStart(3, '0')}`;

const PREFIJOS_NIVEL = {
  JEFE_AREA: 'JA',
  TRABAJADOR_AUTORIZADO: 'TA',
  COORDINADOR: 'CO',
  ENTRENADOR: 'EN',
};

export const formatearNumeroCertificado = ({ id, codigoNivel, codigoActividad, anio }) => {
  const prefijo =
    codigoActividad === 'REENTRENAMIENTO' ? 'RE' : (PREFIJOS_NIVEL[codigoNivel] ?? 'GN');
  return `MAM-${prefijo}-${anio}-${String(id).padStart(6, '0')}`;
};

export const enmascararDocumento = (numero = '') => {
  const visibles = 4;
  if (numero.length <= visibles) return numero;
  return '*'.repeat(numero.length - visibles) + numero.slice(-visibles);
};
