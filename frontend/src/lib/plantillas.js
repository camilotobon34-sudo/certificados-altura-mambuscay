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
  'Alexander Mambuscay T': {
    licencia: '2023060211376',
    firma: '/plantillas/firma-alexander.png',
    firmaAlterna: '/plantillas/firma-alexander-2.jpg',
  },
  'Yesit Gómez Pamplona': { licencia: '2018060225641', firma: '/plantillas/firma-yesit.png' },
  'Camilo Giraldo Campillo': { licencia: '6492', firma: '/plantillas/firma-camilo.png' },
}

// Medidas tomadas de los Word en mm desde la esquina superior izquierda de la hoja carta; las "y" de
// los textos son la línea base. En "firmas", "de" indica de quién es la firma o el nombre (el centro
// o el entrenador del certificado) y LICENCIA es la línea de la licencia del entrenador.
export const LICENCIA = '@licencia'

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
    textoCurso: 'Cursó y aprobó la acción de formación',
    textoDuracion: 'Con una duración de',
    medidas: {
      encabezado: 29, tamEncabezado: 12, altura: 39.5, onac: 49.1, hace: 77.8, nombre: 94.7,
      linea: { y: 98.5, x1: 66.9, x2: 158.5 }, cedula: 104.3, curso: 117, titulo: 126.2, duracion: 134.6,
      testimonio: 139.4, anchoTexto: 156, trasTestimonio: 4.1, trasFormacion: 3.9, trasCodigo: 4.2,
      autenticidadX: 31, contactoX: 30,
    },
    empleador: {
      y: 169.2, xEtiqueta: 30, x: 30, xRepresentante: 120.7, cxNombreRepresentante: 155.9, cxCc: 145.5,
      tamEmpresa: 8, arl: 189.6, etiquetaArl: 'A.R.L AFILIADO TRABAJADOR', tamArl: 8, trasArl: 4.1,
    },
    logo: { x: 60.5, y: 180.2, w: 94.7 },
    qr: { x: 178, y: 186 },
    firmas: {
      imagenes: [{ de: 'centro', x: 30, y: 215.8, w: 33.6, h: 16.5 }, { de: 'entrenador', x: 153.7, y: 217.5, w: 29.8, h: 14.7 }],
      nombres: [{ de: 'centro', y: 241.9, cx: 50.6, subrayado: true }, { de: 'entrenador', y: 240.8, cx: 164.8, subrayado: true }],
      textos: [
        { t: 'Representante Legal', y: 248.7, cx: 50.6 },
        { t: 'Entrenador', y: 247.6, cx: 164.8 },
        { t: LICENCIA, y: 252.1, cx: 165.2 },
      ],
    },
    empleadorPorEntrenador: {
      'Yesit Gómez Pamplona': {
        y: 169.2, xEtiqueta: 30, x: 30, xNit: 34, xRepresentante: 122.4, cxNombreRepresentante: 145.6, cxCc: 139.5,
        tamEmpresa: 8, arl: 193.9, etiquetaArl: 'A.R.L AFILIADO TRABAJADOR', tamArl: 10, trasArl: 4.3, arlEnNegrita: true,
      },
    },
    firmasPorEntrenador: {
      'Yesit Gómez Pamplona': {
        imagenes: [{ de: 'centro', x: 30, y: 225, w: 33.6, h: 16.5 }, { de: 'entrenador', x: 143.4, y: 227.7, w: 37.1, h: 13.7 }],
        nombres: [{ de: 'centro', y: 251, cx: 50.6 }, { de: 'entrenador', y: 255.1, cx: 153.2 }],
        lineas: [{ y: 253.6, x1: 22.2, x2: 80.8 }, { y: 258.7, x1: 127.6, x2: 186.2 }],
        textos: [
          { t: 'Representante Legal', y: 257.9, cx: 50.6 },
          { t: 'Entrenador', y: 262, cx: 162.1 },
          { t: LICENCIA, y: 266.5, cx: 164.8 },
        ],
      },
    },
  },
  {
    prefijoCodigo: 'C00RDAM-',
    empresas: { 'Alexander Mambuscay T': 'COOPERATIVA MULTIACTIVA DE TELECOMUNICACIONES Y TELEMÁTICOS', 'Yesit Gómez Pamplona': 'MONTAJES Y MANTENIMIENTO EL TATO SAS' },
    nombre: 'Coordinador',
    fondo: '/plantillas/coordinador.jpg',
    entrenadores: ['Alexander Mambuscay T', 'Yesit Gómez Pamplona'],
    estilo: 'ONAC',
    encabezado: 'CERTIFICADO DE CAPACITACIÓN Y ENTRENAMIENTO PARA TRABAJO EN ALTURAS',
    tituloCurso: 'TRABAJO EN ALTURAS- COORDINADOR  4272',
    textoCurso: 'Curso y aprobó la acción de formación',
    textoDuracion: 'con una duración de',
    contactoEnMayusculas: true,
    medidas: {
      centro: 103.8, encabezado: 20.6, tamEncabezado: 10, altura: 30.9, onac: 40.5, hace: 95.9, nombre: 109.3,
      linea: { y: 113.1, x1: 59.4, x2: 151 }, cedula: 119.9, cxCedula: 100.4, curso: 126.9, titulo: 136.1,
      duracion: 144.5, testimonio: 154, anchoTexto: 162.6, trasTestimonio: 4.8, tamFormacion: 11, trasFormacion: 4,
      trasCodigo: 8.6,
    },
    empleador: {
      y: 189, xEtiqueta: 27.5, x: 22.5, xNit: 25.6, xRepresentante: 129.9, cxNombreRepresentante: 148.4, cxCc: 152.7,
      tamEmpresa: 10, arl: 209.4, etiquetaArl: 'A.R.L. AFILIADO TRABAJADOR', tamArl: 10, trasArl: 4.8,
    },
    empleadorPorEntrenador: {
      'Yesit Gómez Pamplona': {
        y: 189, xEtiqueta: 27.5, x: 22.5, xRepresentante: 129.9, cxNombreRepresentante: 153.7, cxCc: 152.7,
        tamEmpresa: 10, arl: 209.4, etiquetaArl: 'A.R.L. AFILIADO TRABAJADOR', tamArl: 10, trasArl: 4.8,
      },
    },
    qr: { x: 178, y: 203 },
    firmas: {
      imagenes: [{ de: 'centro', x: 22.5, y: 224.4, w: 37, h: 18.2 }, { de: 'entrenador', x: 144.9, y: 231.5, w: 29.8, h: 11 }],
      nombres: [{ de: 'centro', y: 250.7, cx: 46.9 }, { de: 'entrenador', y: 252.2, cx: 158.1, subrayado: true }],
      lineas: [{ y: 245.6, x1: 13.1, x2: 71.8 }],
      textos: [
        { t: 'Representante Legal', y: 257.6, cx: 46.9 },
        { t: 'Entrenador', y: 259, cx: 158.1 },
        { t: LICENCIA, y: 263.5, cx: 158.5 },
      ],
    },
    firmasPorEntrenador: {
      'Yesit Gómez Pamplona': {
        imagenes: [{ de: 'centro', x: 38.4, y: 220.2, w: 37, h: 13.2 }, { de: 'entrenador', x: 136.8, y: 219.6, w: 37.1, h: 13.7 }],
        nombres: [{ de: 'centro', y: 242.2, cx: 52.1, subrayado: true }, { de: 'entrenador', y: 243.8, cx: 165.9, subrayado: true }],
        textos: [
          { t: 'Representante Legal', y: 249, cx: 52.1 },
          { t: 'Entrenador', y: 250.6, cx: 174.8 },
          { t: LICENCIA, y: 255.1, cx: 171 },
        ],
      },
    },
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
    textoCurso: 'Curso y aprobó la acción de formación',
    textoDuracion: 'Con una duración de',
    medidas: {
      encabezado: 40.4, tamEncabezado: 10, altura: 50.8, onac: 72, hace: 100.6, nombre: 114.1,
      linea: { y: 117.8, x1: 66.9, x2: 158.5 }, cedula: 123.7, curso: 132.1, titulo: 141.2, duracion: 149.7,
      testimonio: 159.2, anchoTexto: 156, trasTestimonio: 4.1, trasFormacion: 3.9, trasCodigo: 4.2,
    },
    empleador: {
      y: 189, trasEtiqueta: 5.7, xEtiqueta: 30, x: 30, xRepresentante: 131, cxNombreRepresentante: 156, cxCc: 156.6,
      tamEmpresa: 10, arl: 215.8, etiquetaArl: 'A.R.L. AFILIADO TRABAJADOR', tamArl: 10, trasArl: 4.7, sufijoArl: ' A.R.L',
    },
    logo: { x: 60.5, y: 180.2, w: 94.7 },
    qr: { x: 178, y: 203 },
    firmas: {
      imagenes: [{ de: 'centro', x: 30, y: 225.6, w: 33.3, h: 16.4 }, { de: 'entrenador', x: 144.3, y: 225.6, w: 40.8, h: 16.4 }],
      nombres: [{ de: 'centro', y: 250.5, cx: 54.2, subrayado: true }, { de: 'entrenador', y: 250.5, cx: 167.1, subrayado: true }],
      textos: [
        { t: 'Representante Legal', y: 257.3, x: 21.4, alinear: 'left' },
        { t: 'Entrenador', y: 257.3, cx: 167.2 },
        { t: LICENCIA, y: 262, cx: 167.5 },
      ],
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
    qr: { x: 176, y: 182 },
    firmas: {
      nombres: [{ de: 'centro', y: 220.5, cx: 160.5 }, { de: 'entrenador', y: 249.2, cx: 164.8 }],
      lineas: [{ y: 223.8, x1: 139.6, x2: 198.2 }, { y: 251.7, x1: 140.8, x2: 199.5 }],
      textos: [
        { t: 'Representante Legal', y: 227.3, cx: 160.4 },
        { t: 'Entrenador', y: 256, cx: 164.8 },
        { t: LICENCIA, y: 260.5, cx: 164.8 },
      ],
    },
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
    autenticidad: 221.3,
    qr: { x: 176, y: 182 },
    firmaAlterna: true,
    firmas: {
      imagenes: [{ de: 'entrenador', x: 150.7, y: 242, w: 42.3, h: 16.2 }],
      nombres: [{ de: 'centro', y: 255.9, cx: 49.7 }, { de: 'entrenador', y: 268.9, cx: 167.7 }],
      lineas: [{ y: 258.1, x1: 20.6, x2: 79.3 }],
      textos: [
        { t: 'Representante Legal o Delegado', y: 262.7, cx: 49.7 },
        { t: 'del Centro de Capacitación', y: 267.8, cx: 49.7 },
        { t: LICENCIA, y: 275.1, cx: 167.7 },
      ],
    },
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
    autenticidad: 211.4,
    qr: { x: 182, y: 188 },
    firmaAlterna: true,
    firmas: {
      imagenes: [{ de: 'centro', x: 30, y: 237.6, w: 42.3, h: 16.2 }, { de: 'entrenador', x: 152, y: 237.9, w: 42.3, h: 16.2 }],
      nombres: [{ de: 'centro', y: 261.5, cx: 46.9 }, { de: 'entrenador', y: 267.7, cx: 167.7, subrayado: true }],
      lineas: [{ y: 263, x1: 19, x2: 77.7 }],
      textos: [
        { t: 'Representante Legal o Delegado del', y: 268.4, cx: 46.9 },
        { t: 'Centro de Capacitación', y: 273.5, cx: 46.9 },
        { t: LICENCIA, y: 273.9, cx: 167.7 },
      ],
    },
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
    qr: { x: 176, y: 194 },
    firmas: {
      nombres: [{ de: 'centro', y: 232.6, cx: 160.5 }, { de: 'entrenador', y: 261.2, cx: 164.8 }],
      lineas: [{ y: 235.8, x1: 139.6, x2: 198.2 }, { y: 263.7, x1: 140.8, x2: 199.5 }],
      textos: [
        { t: 'Representante Legal', y: 239.4, cx: 160.4 },
        { t: 'Entrenador', y: 268.1, cx: 164.8 },
        { t: LICENCIA, y: 272.6, cx: 164.8 },
      ],
    },
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
