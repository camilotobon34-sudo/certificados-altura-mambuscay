// Plantillas oficiales de certificado (carpetas de cada entrenador). El fondo y los entrenadores
// son fijos por plantilla; en cada certificado solo cambian los datos de la persona y la empresa.
export const PLANTILLAS = {
  TRABAJADOR_AUTORIZADO: {
    nombre: 'Trabajador autorizado',
    fondo: '/plantillas/trabajador-autorizado.jpg',
    prefijoCodigo: 'AUTORAM',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
  },
  COORDINADOR: {
    nombre: 'Coordinador',
    fondo: '/plantillas/coordinador.jpg',
    prefijoCodigo: 'C00RDAM',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
  },
  REENTRENAMIENTO: {
    nombre: 'Reentrenamiento sectorial',
    fondo: '/plantillas/reentrenamiento.jpg',
    prefijoCodigo: 'REEAM',
    entrenadores: ['Camilo Giraldo Campillo'],
  },
  TRABAJO_EN_CALIENTE: {
    nombre: 'Trabajo en caliente',
    fondo: '/plantillas/trabajo-en-caliente.jpg',
    prefijoCodigo: 'AMTENC',
    entrenadores: ['Alexander Mambuscay T'],
  },
  ARMADO_ANDAMIOS: {
    nombre: 'Armado de andamios',
    fondo: '/plantillas/coordinador.jpg',
    prefijoCodigo: 'ANDA',
    entrenadores: ['Alexander Mambuscay T'],
  },
  RESCATE: {
    nombre: 'Rescate en alturas',
    fondo: '/plantillas/coordinador.jpg',
    prefijoCodigo: 'RESCT',
    entrenadores: ['Alexander Mambuscay T'],
  },
  BRIGADA: {
    nombre: 'Brigada de primeros auxilios',
    fondo: '/plantillas/trabajo-en-caliente.jpg',
    prefijoCodigo: 'AMBRIGEPAUX',
    entrenadores: ['Alexander Mambuscay T'],
  },
}

// Los cursos de "otros cursos" comparten tipo de actividad; la plantilla se distingue por el nombre.
const PLANTILLAS_POR_NOMBRE = [
  [/andamio/i, PLANTILLAS.ARMADO_ANDAMIOS],
  [/rescate/i, PLANTILLAS.RESCATE],
  [/brigada|primeros auxilios/i, PLANTILLAS.BRIGADA],
]

export const plantillaDeCurso = ({ tipoActividadCodigo, nivelCodigo, nombre = '' } = {}) => {
  if (tipoActividadCodigo === 'REENTRENAMIENTO') return PLANTILLAS.REENTRENAMIENTO
  if (tipoActividadCodigo === 'OTRAS_TAREAS_ALTO_RIESGO') {
    return PLANTILLAS_POR_NOMBRE.find(([patron]) => patron.test(nombre))?.[1] ?? PLANTILLAS.TRABAJO_EN_CALIENTE
  }
  return PLANTILLAS[nivelCodigo] ?? null
}

export const GRUPOS_CURSO = [
  {
    codigo: 'FORMACION_INICIAL',
    titulo: 'Formación en trabajo en alturas',
    descripcion: 'Niveles de la Resolución 4272 de 2021.',
  },
  {
    codigo: 'REENTRENAMIENTO',
    titulo: 'Reentrenamiento',
    descripcion: 'Actualización anual obligatoria (Res. 4272 de 2021, Art. 27).',
  },
  {
    codigo: 'OTRAS_TAREAS_ALTO_RIESGO',
    titulo: 'Otros cursos',
    descripcion: 'Trabajo en caliente, armado de andamios, rescate en alturas y brigadas de emergencia.',
  },
]
