// Plantillas oficiales de certificado (carpetas de cada entrenador), una por curso. Se asocian al
// curso por su prefijo de código; en cada certificado solo cambian los datos de la persona y la empresa.
// Los textos fijos se copiaron de los Word originales.

export const REPRESENTANTE_CENTRO = 'Alexander Mambuscay T'
export const ARL_POR_DEFECTO = 'SURA'

export const LINEAS_CENTRO = ['ALTURA MAMBUSCAY S.A.S', 'NIT: 901269652-6', 'CON LICENCIA DE SALUD OCUPACIONAL (DSSA) 97325']
export const LINEAS_ONAC = [
  'NIT: 901269652-6',
  'CON LICENCIA DE SALUD OCUPACIONAL (DSSA) 97325',
  'PERSONA JURIDICA CERTIFICADA EN LA NTC 6072 ORGANISMO CERTIFICADOR BUREAU VERITAS',
  'CERTIFICATION No. CO23.00687 22 DE AGOSTO DE 2023 ACREDITADO POR LA ONAC CODIGO 09-CPR-008 Y',
  'CUMPLIENDO LA RESOLUCIÓN 4272 DE 2021 PARA FORMAR EN TRABAJOS DE ALTURA.',
  'Aprobado Ministerio de Trabajo 08SE2020220000000026234 DE 24 agosto de 2020',
]
export const AUTENTICIDAD = 'LA AUTENTICIDAD DE ESTE DOCUMENTO PUEDE SER VALIDADA EN LOS CORREOS ELECTRONICOS:'
export const CONTACTO_ONAC = 'alturamambuscay@gmail.com O alexmt926@gmail.com TELEFONOS: 3148237245'
export const CONTACTO = 'alturamambuscay@gmail.com TELEFONOS: 3148237245'
export const LUGAR_ONAC = 'La Ceja (Antioquia) Km 3 vía La Ceja- San Nicolas'
export const LUGAR = 'La Ceja (Antioquia)'

export const ENTRENADORES = {
  'Alexander Mambuscay T': { licencia: '2023060211376', firma: '/plantillas/firma-alexander.png' },
  'Yesit Gómez Pamplona': { licencia: '2018060225641', firma: '/plantillas/firma-yesit.png' },
  'Camilo Giraldo Campillo': { licencia: '6492', firma: '/plantillas/firma-camilo.png' },
}

export const PLANTILLAS = [
  {
    prefijoCodigo: 'AUTORAM',
    empresas: { 'Alexander Mambuscay T': 'FABIAN ARLEY TABARES GIRALDO', 'Yesit Gómez Pamplona': 'ALJADIS COBO PACHECO' },
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
    empresas: { 'Alexander Mambuscay T': 'COOPERATIVA MULTIACTIVA DE TELECOMUNICACIONES Y TELEMÁTICOS', 'Yesit Gómez Pamplona': 'MONTAJES Y MANTENIMIENTO EL TATO SAS' },
    nombre: 'Coordinador',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
    estilo: 'ONAC',
    encabezado: 'CERTIFICADO DE CAPACITACIÓN Y ENTRENAMIENTO PARA TRABAJO EN ALTURAS',
    tamEncabezado: 10,
    tituloCurso: 'TRABAJO EN ALTURAS- COORDINADOR  4272',
    disposicion: { encabezado: 20, cuerpo: 94, empresa: 186.5, firmas: 224, qr: { x: 178, y: 203 } },
  },
  {
    prefijoCodigo: 'REEAM',
    empresas: { 'Camilo Giraldo Campillo': 'UNIFLOR COMERCIALIZADORA' },
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
    empresas: { 'Alexander Mambuscay T': 'CAMILO ANDRES MUÑOZ ROJAS' },
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
    empresas: { 'Alexander Mambuscay T': 'SERVICIOS INDUSTRIALES SAN LUIS SAS' },
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
    empresas: { 'Alexander Mambuscay T': 'ALDIMA INGENIERIA SAS' },
    nombre: 'Rescate en alturas',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T'],
    estilo: 'MEDALLA',
    titulo: ['CERTIFICADO DE CAPACITACIÓN Y', 'ENTRENAMIENTO DE RESCATE EN', 'ALTURAS'],
    cursoAprobado: 'Curso y aprobó la acción de formación de RESCATE EN ALTURAS',
    empresaAlineada: 'centro',
    firmaRepresentante: true,
    disposicion: { encabezado: 32, cuerpo: 117, qr: { x: 182, y: 188 } },
  },
  {
    prefijoCodigo: 'AMBRIGEPAUX',
    empresas: { 'Alexander Mambuscay T': 'INTA INGENIERIA Y TRABAJOS DE ALTURAS SAS' },
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

// Empresas (empleadores) que aparecen en las plantillas Word, con sus datos tal como se imprimieron.
export const EMPRESAS_PLANTILLAS = [
  { empresa: 'ALDIMA INGENIERIA SAS', nitEmpresa: '901534804-5', arl: 'SURA' },
  { empresa: 'ALJADIS COBO PACHECO', nitEmpresa: '43693363', representanteLegal: 'Aljadis Cobo Pacheco', documentoRepresentante: '43693363', arl: 'SURA' },
  { empresa: 'CAMILO ANDRES MUÑOZ ROJAS', arl: 'SURA' },
  {
    empresa: 'COOPERATIVA MULTIACTIVA DE TELECOMUNICACIONES Y TELEMÁTICOS',
    nitEmpresa: '811013014-1',
    representanteLegal: 'Willian Alberto Galindo Muñoz',
    documentoRepresentante: '15435557',
    arl: 'SURA',
  },
  {
    empresa: 'FABIAN ARLEY TABARES GIRALDO',
    nitEmpresa: '1035854186-4',
    representanteLegal: 'Fabian Arley Tabares Giraldo',
    documentoRepresentante: '1.035.854.186-4',
    arl: 'SURA',
  },
  { empresa: 'INTA INGENIERIA Y TRABAJOS DE ALTURAS SAS', arl: 'SURA' },
  {
    empresa: 'MONTAJES Y MANTENIMIENTO EL TATO SAS',
    nitEmpresa: '900932541-1',
    representanteLegal: 'Hector Jaime Tabares Alvarez',
    documentoRepresentante: '98601536',
    arl: 'SURA',
  },
  { empresa: 'SERVICIOS INDUSTRIALES SAN LUIS SAS', nitEmpresa: '900312930-9', arl: 'SURA' },
  {
    empresa: 'UNIFLOR COMERCIALIZADORA',
    nitEmpresa: '800027543-7',
    representanteLegal: 'Juan María Cock Londoño',
    documentoRepresentante: '8231023',
    arl: 'SURA',
  },
]

export const plantillaDeCurso = ({ prefijoCodigo } = {}) =>
  PLANTILLAS.find((p) => p.prefijoCodigo === prefijoCodigo?.toUpperCase()) ?? null

// Empresa que trae la plantilla Word del curso; en los cursos con dos entrenadores, la de su plantilla.
export const empresaDeCurso = (curso, entrenador) => {
  const empresas = plantillaDeCurso(curso ?? {})?.empresas
  if (!empresas) return null
  const nombre = empresas[entrenador] ?? Object.values(empresas)[0]
  return EMPRESAS_PLANTILLAS.find((e) => e.empresa === nombre) ?? null
}

// Lo que sale igual en todos los certificados del curso, tal como se imprime.
export const datosFijos = (p) => {
  const onac = p.estilo === 'ONAC'
  return {
    titulo: onac ? p.encabezado : p.titulo.join(' '),
    curso: p.tituloCurso ?? p.cursoAprobado,
    centro: onac ? ['ALTURA MAMBUSCAY S.A.S', ...LINEAS_ONAC] : LINEAS_CENTRO,
    lugar: onac ? LUGAR_ONAC : LUGAR,
    contacto: p.estilo === 'CINTA' ? null : `${AUTENTICIDAD} ${onac ? CONTACTO_ONAC : CONTACTO}`,
    representante: REPRESENTANTE_CENTRO,
    entrenadores: p.entrenadores.map((nombre) => ({ nombre, licencia: ENTRENADORES[nombre]?.licencia })),
    arl: ARL_POR_DEFECTO,
    empresas: Object.entries(p.empresas ?? {}).map(([entrenador, empresa]) => ({ entrenador, empresa })),
  }
}
