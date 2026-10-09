// Plantillas oficiales de certificado (carpetas de cada entrenador), una por curso. Se asocian al
// curso por su prefijo de código; en cada certificado solo cambian los datos de la persona y la empresa.
// Los textos fijos se copiaron de los Word originales.

export const REPRESENTANTE_CENTRO = 'Alexander Mambuscay T'

export const ENTRENADORES = {
  'Alexander Mambuscay T': { licencia: '2023060211376', firma: '/plantillas/firma-alexander.png' },
  'Yesit Gómez Pamplona': { licencia: '2018060225641', firma: '/plantillas/firma-yesit.png' },
  'Camilo Giraldo Campillo': { licencia: '6492', firma: '/plantillas/firma-camilo.png' },
}

export const PLANTILLAS = [
  {
    prefijoCodigo: 'AUTORAM',
    nombre: 'Trabajador autorizado',
    fondo: '/plantillas/trabajador-autorizado.jpg',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
    estilo: 'ONAC',
    encabezado: 'CERTIFICADO DE CAPACITACIÓN Y ENTRENAMIENTO PARA TRABAJO EN ALTURAS.',
    tituloCurso: 'TRABAJO  EN ALTURAS- TRABAJADOR AUTORIZADO',
    disposicion: { encabezado: 28, cuerpo: 76.5, empresa: 167, firmas: 214, logo: { x: 74, y: 182, w: 69 }, qr: { x: 178, y: 186 } },
  },
  {
    prefijoCodigo: 'C00RDAM-',
    nombre: 'Coordinador',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
    estilo: 'ONAC',
    encabezado: 'CERTIFICADO DE CAPACITACIÓN Y ENTRENAMIENTO PARA TRABAJO EN ALTURAS',
    tituloCurso: 'TRABAJO EN ALTURAS- COORDINADOR  4272',
    disposicion: { encabezado: 20, cuerpo: 94, empresa: 186.5, firmas: 224, qr: { x: 178, y: 203 } },
  },
  {
    prefijoCodigo: 'REEAM',
    nombre: 'Reentrenamiento sectorial',
    fondo: '/plantillas/reentrenamiento.jpg',
    entrenadores: ['Camilo Giraldo Campillo'],
    estilo: 'ONAC',
    encabezado: 'CERTIFICADO DE CAPACITACION Y ENTRENAMIENTO PARA TRABAJO EN ALTURA.',
    tituloCurso: 'Reentrenamiento Sectorial 4272',
    disposicion: {
      encabezado: 39, separacionEncabezado: 16, cuerpo: 99, empresa: 186.7, firmas: 224,
      logo: { x: 62, y: 182.5, w: 90 }, qr: { x: 158, y: 196 },
    },
  },
  {
    prefijoCodigo: 'AMTENC',
    nombre: 'Trabajo en caliente',
    fondo: '/plantillas/trabajo-en-caliente.jpg',
    entrenadores: ['Alexander Mambuscay T'],
    estilo: 'CINTA',
    titulo: ['Certificado de', 'Capacitación y Entrenamiento Tareas', 'de alto riesgo y trabajo en caliente'],
    tituloCurso: 'TAREAS DE ALTO RIESGO Y TRABAJO EN CALIENTE',
    disposicion: { encabezado: 32, cuerpo: 91.4, qr: { x: 176, y: 182 } },
  },
  {
    prefijoCodigo: 'ANDA',
    nombre: 'Armado de andamios',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T'],
    estilo: 'MEDALLA',
    titulo: ['CERTIFICADO DE CAPACITACIÓN', 'ARMADO DE ANDAMIOS PARA', 'TRABAJO EN ALTURAS'],
    cursoAprobado: 'Curso y aprobó la acción de formación de Armado de andamios',
    empresaAlineada: 'izquierda',
    firmaRepresentante: false,
    disposicion: { encabezado: 32, cuerpo: 117, qr: { x: 176, y: 182 } },
  },
  {
    prefijoCodigo: 'RESCT',
    nombre: 'Rescate en alturas',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T'],
    estilo: 'MEDALLA',
    titulo: ['CERTIFICADO DE CAPACITACIÓN Y', 'ENTRENAMIENTO DE RESCATE EN', 'ALTURAS'],
    cursoAprobado: 'Curso y aprobó la acción de formación de RESCATE EN ALTURAS',
    empresaAlineada: 'centro',
    firmaRepresentante: true,
    disposicion: { encabezado: 32, cuerpo: 117, qr: { x: 24, y: 214 } },
  },
  {
    prefijoCodigo: 'AMBRIGEPAUX',
    nombre: 'Brigada de primeros auxilios',
    fondo: '/plantillas/trabajo-en-caliente.jpg',
    entrenadores: ['Alexander Mambuscay T'],
    estilo: 'CINTA',
    titulo: ['Certificado de', 'Capacitación y Entrenamiento', 'Brigadas de Emergencia', 'Empresariales'],
    tituloCurso: 'BRIGADA DE PRIMEROS AUXILIOS',
    horasDosDigitos: true,
    disposicion: { encabezado: 32, cuerpo: 103.5, qr: { x: 176, y: 194 } },
  },
]

export const plantillaDeCurso = ({ prefijoCodigo } = {}) =>
  PLANTILLAS.find((p) => p.prefijoCodigo === prefijoCodigo?.toUpperCase()) ?? null
