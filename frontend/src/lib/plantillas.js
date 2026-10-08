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
}

export const plantillaDeCurso = ({ tipoActividadCodigo, nivelCodigo } = {}) => {
  if (tipoActividadCodigo === 'REENTRENAMIENTO') return PLANTILLAS.REENTRENAMIENTO
  if (tipoActividadCodigo === 'OTRAS_TAREAS_ALTO_RIESGO') return PLANTILLAS.TRABAJO_EN_CALIENTE
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
    titulo: 'Otras tareas de alto riesgo',
    descripcion: 'Formación distinta al trabajo en alturas, como el trabajo en caliente.',
  },
]
