// Plantillas oficiales de certificado (carpetas de cada entrenador), una por curso. Se asocian al
// curso por su prefijo de código; en cada certificado solo cambian los datos de la persona y la empresa.
export const PLANTILLAS = [
  {
    prefijoCodigo: 'AUTORAM',
    nombre: 'Trabajador autorizado',
    fondo: '/plantillas/trabajador-autorizado.jpg',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
  },
  {
    prefijoCodigo: 'C00RDAM-',
    nombre: 'Coordinador',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
  },
  {
    prefijoCodigo: 'REEAM',
    nombre: 'Reentrenamiento sectorial',
    fondo: '/plantillas/reentrenamiento.jpg',
    entrenadores: ['Camilo Giraldo Campillo'],
  },
  {
    prefijoCodigo: 'AMTENC',
    nombre: 'Trabajo en caliente',
    fondo: '/plantillas/trabajo-en-caliente.jpg',
    entrenadores: ['Alexander Mambuscay T'],
  },
  {
    prefijoCodigo: 'ANDA',
    nombre: 'Armado de andamios',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T'],
  },
  {
    prefijoCodigo: 'RESCT',
    nombre: 'Rescate en alturas',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T'],
  },
  {
    prefijoCodigo: 'AMBRIGEPAUX',
    nombre: 'Brigada de primeros auxilios',
    fondo: '/plantillas/trabajo-en-caliente.jpg',
    entrenadores: ['Alexander Mambuscay T'],
  },
]

export const plantillaDeCurso = ({ prefijoCodigo } = {}) =>
  PLANTILLAS.find((p) => p.prefijoCodigo === prefijoCodigo?.toUpperCase()) ?? null
