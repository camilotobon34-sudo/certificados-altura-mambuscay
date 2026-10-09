import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { ARL_POR_DEFECTO, fechasFormacionSugeridas } from './datos-plantilla.js'
import { ENTRENADORES, REPRESENTANTE_CENTRO, plantillaDeCurso } from './plantillas.js'

// Certificado oficial: reproduce la plantilla Word de cada curso (hoja carta, medidas en mm).

const CAFE = '#843C0C'
const NEGRO = '#000000'
const W = 215.9
const CX = W / 2

const LINEAS_ONAC = [
  'NIT: 901269652-6',
  'CON LICENCIA DE SALUD OCUPACIONAL (DSSA) 97325',
  'PERSONA JURIDICA CERTIFICADA EN LA NTC 6072 ORGANISMO CERTIFICADOR BUREAU VERITAS',
  'CERTIFICATION No. CO23.00687 22 DE AGOSTO DE 2023 ACREDITADO POR LA ONAC CODIGO 09-CPR-008 Y',
  'CUMPLIENDO LA RESOLUCIÓN 4272 DE 2021 PARA FORMAR EN TRABAJOS DE ALTURA.',
  'Aprobado Ministerio de Trabajo 08SE2020220000000026234 DE 24 agosto de 2020',
]
const LINEAS_CENTRO = ['ALTURA MAMBUSCAY S.A.S', 'NIT: 901269652-6', 'CON LICENCIA DE SALUD OCUPACIONAL (DSSA) 97325']
const AUTENTICIDAD = 'LA AUTENTICIDAD DE ESTE DOCUMENTO PUEDE SER VALIDADA EN LOS CORREOS ELECTRONICOS:'
const CONTACTO_ONAC = 'alturamambuscay@gmail.com O alexmt926@gmail.com TELEFONOS: 3148237245'
const CONTACTO = 'alturamambuscay@gmail.com TELEFONOS: 3148237245'

const TIPOS_DOCUMENTO = {
  CC: 'Cédula de Ciudadanía',
  CE: 'Cédula de Extranjería',
  TI: 'Tarjeta de Identidad',
  PA: 'Pasaporte',
  PPT: 'Permiso por Protección Temporal',
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const UNIDADES = [
  'cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez',
  'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve', 'veinte',
  'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete',
  'veintiocho', 'veintinueve',
]
const DECENAS = { 3: 'treinta', 4: 'cuarenta', 5: 'cincuenta', 6: 'sesenta', 7: 'setenta', 8: 'ochenta', 9: 'noventa' }

const enLetras = (n) => {
  if (n < 30) return UNIDADES[n]
  const d = Math.floor(n / 10)
  const u = n % 10
  return u ? `${DECENAS[d]} y ${UNIDADES[u]}` : DECENAS[d]
}
// "veintiún días", "treinta y un días"
const diasEnLetras = (n) => enLetras(n).replace(/uno$/, 'un').replace(/veintiun$/, 'veintiún')
const anioEnLetras = (anio) => `dos mil${anio % 100 ? ` ${enLetras(anio % 100)}` : ''}`

const partesFecha = (iso) => {
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number)
  return { y, m, d, dd: String(d).padStart(2, '0') }
}

const frasesFirma = (iso, lugar) => {
  const { y, m, d, dd } = partesFecha(iso)
  const dias = d === 1 ? 'al primer (01) día' : `a los ${diasEnLetras(d)} (${dd}) días`
  return `En testimonio de lo anterior se firma en ${lugar} ${dias} del Mes de ${MESES[m - 1]} de ${anioEnLetras(y)} (${y})`
}

const fraseFormacion = (inicio, fin) => {
  if (!inicio && !fin) return null
  const a = partesFecha(inicio ?? fin)
  const b = partesFecha(fin ?? inicio)
  const mesA = MESES[a.m - 1].toUpperCase()
  const mesB = MESES[b.m - 1].toUpperCase()
  if (a.y === b.y && a.m === b.m && a.d === b.d) return `FORMACION REALIZADA EN LA CEJA ANTIOQUIA EL ${a.dd} DEL MES DE ${mesA}`
  if (a.y === b.y && a.m === b.m) return `FORMACION REALIZADA EN LA CEJA ANTIOQUIA ENTRE EL ${a.dd} AL ${b.dd} DEL MES DE ${mesA}`
  return `FORMACION REALIZADA EN LA CEJA ANTIOQUIA ENTRE EL ${a.dd} DE ${mesA} AL ${b.dd} DE ${mesB}`
}

const conPuntos = (numero = '') => (/^\d+$/.test(numero) ? numero.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : numero)

const PALABRAS_MENORES = new Set(['de', 'del', 'la', 'las', 'los', 'y'])
const nombrePropio = (texto = '') =>
  texto
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i) => (i > 0 && PALABRAS_MENORES.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ')

// Las fuentes estándar de PDF solo cubren Latin-1.
const latin1 = (texto) => String(texto ?? '').replace(/[—–]/g, '-')

// ---------------------------------------------------------------------------------------------
// Recursos (se cachean mientras la página esté abierta)

const cache = new Map()
const unaVez = (clave, fn) => {
  if (!cache.has(clave)) {
    cache.set(
      clave,
      fn().catch((error) => {
        cache.delete(clave)
        throw error
      }),
    )
  }
  return cache.get(clave)
}

const cargarImagen = (url) =>
  unaVez(url, async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`No se pudo cargar ${url}`)
    const blob = await res.blob()
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
    const ratio = await new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve(img.naturalWidth / img.naturalHeight)
      img.onerror = () => resolve(1)
      img.src = data
    })
    return { data, ratio, formato: blob.type.includes('png') ? 'PNG' : 'JPEG' }
  })

const cargarFuente = (url) =>
  unaVez(url, async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`No se pudo cargar ${url}`)
    const bytes = new Uint8Array(await res.arrayBuffer())
    let binario = ''
    for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    return btoa(binario)
  })

const FUENTES = {
  manuscrita: { archivo: 'PinyonScript-Regular.ttf', url: '/fuentes/PinyonScript-Regular.ttf' },
  romana: { archivo: 'Cinzel.ttf', url: '/fuentes/Cinzel-var.ttf' },
}

const registrarFuentes = async (doc) => {
  await Promise.all(
    Object.entries(FUENTES).map(async ([nombre, { archivo, url }]) => {
      doc.addFileToVFS(archivo, await cargarFuente(url))
      doc.addFont(archivo, nombre, 'normal')
    }),
  )
}

// ---------------------------------------------------------------------------------------------
// Ayudas de dibujo

const fuente = (doc, { familia = 'helvetica', estilo = 'normal', tam, color }) => {
  doc.setFont(familia, estilo)
  if (tam) doc.setFontSize(tam)
  if (color) doc.setTextColor(color)
}

// Escribe texto (centrado por defecto) y devuelve la línea base de la última línea.
const escribir = (doc, texto, y, { x = CX, ancho, alinear = 'center', interlineado = 1.15, ...estilo } = {}) => {
  fuente(doc, estilo)
  const plano = estilo.familia && estilo.familia !== 'helvetica' ? String(texto ?? '') : latin1(texto)
  const lineas = ancho ? doc.splitTextToSize(plano, ancho) : [plano]
  doc.text(lineas, x, y, { align: alinear, lineHeightFactor: interlineado })
  const paso = (doc.getFontSize() * interlineado * 25.4) / 72
  return y + (lineas.length - 1) * paso
}

// Reduce el tamaño hasta que el texto quepa en el ancho dado.
const tamanoQueCabe = (doc, texto, familia, tam, ancho) => {
  doc.setFont(familia, 'normal')
  let t = tam
  while (t > 8) {
    doc.setFontSize(t)
    if (doc.getTextWidth(texto) <= ancho) break
    t -= 0.5
  }
  return t
}

const nombreManuscrito = (doc, texto, x, y, tam, ancho, color = CAFE) => {
  const t = tamanoQueCabe(doc, texto, 'manuscrita', tam, ancho)
  escribir(doc, texto, y, { x, familia: 'manuscrita', tam: t, color })
}

const lineaPunteada = (doc, x1, x2, y, color = NEGRO) => {
  doc.setDrawColor(color)
  doc.setLineWidth(0.2)
  doc.setLineDashPattern([0.8, 0.6], 0)
  doc.line(x1, y, x2, y)
  doc.setLineDashPattern([], 0)
}

const firma = (doc, img, cx, y, ancho = 30) => {
  if (!img) return
  const alto = ancho / img.ratio
  doc.setFillColor('#FFFFFF')
  doc.rect(cx - ancho / 2 - 1.5, y - 1, ancho + 3, alto + 2, 'F')
  doc.addImage(img.data, img.formato, cx - ancho / 2, y, ancho, alto)
}

// Línea "Con Cédula de Ciudadanía No. X" con el número en otro peso.
const lineaDocumento = (doc, c, y, { color, numeroNegrita = true, tam = 8 }) => {
  const etiqueta = `Con ${TIPOS_DOCUMENTO[c.tipoDocumento] ?? c.tipoDocumento ?? 'documento'} No. `
  const numero = conPuntos(c.numeroDocumento ?? c.documentoEnmascarado ?? '')
  fuente(doc, { estilo: 'bold', tam, color })
  const a = doc.getTextWidth(latin1(etiqueta))
  fuente(doc, { estilo: numeroNegrita ? 'bold' : 'normal', tam })
  const b = doc.getTextWidth(latin1(numero))
  const x0 = CX - (a + b) / 2
  fuente(doc, { estilo: 'bold', tam })
  doc.text(latin1(etiqueta), x0, y)
  fuente(doc, { estilo: numeroNegrita ? 'bold' : 'normal', tam })
  doc.text(latin1(numero), x0 + a, y)
}

const horas = (c, p) => {
  const h = Number(c.intensidadHoraria)
  return p.horasDosDigitos ? String(h).padStart(2, '0') : String(h)
}

// ---------------------------------------------------------------------------------------------
// Estilos de plantilla

function plantillaOnac(doc, c, p, r) {
  const d = p.disposicion
  if (d.logo && r.logo) doc.addImage(r.logo.data, 'PNG', d.logo.x, d.logo.y, d.logo.w, d.logo.w / r.logo.ratio)
  let y = d.encabezado
  escribir(doc, p.encabezado, y, { estilo: 'bold', tam: 9, color: CAFE })
  escribir(doc, 'ALTURA MAMBUSCAY S.A.S', y + 10, { estilo: 'bold', tam: 23 })
  y += 10 + (d.separacionEncabezado ?? 0) + 8.5
  for (const linea of LINEAS_ONAC) {
    escribir(doc, linea, y, { tam: 7, color: CAFE })
    y += 3.6
  }

  const H = d.cuerpo
  escribir(doc, 'HACE CONSTAR QUE', H, { estilo: 'bold', tam: 8, color: CAFE })
  nombreManuscrito(doc, nombrePropio(c.nombreCompleto), CX, H + 14, 28, 120)
  doc.setDrawColor(CAFE)
  doc.setLineWidth(0.4)
  doc.line(CX - 45, H + 18, CX + 45, H + 18)
  lineaDocumento(doc, c, H + 26.5, { color: CAFE })
  escribir(doc, 'Cursó y aprobó la acción de formación', H + 38.5, { estilo: 'italic', tam: 8.5, color: CAFE })
  escribir(doc, p.tituloCurso, H + 47, { estilo: 'bold', tam: 11.5, color: CAFE })
  escribir(doc, `Con una duración de ${horas(c, p)} horas`, H + 55.5, { estilo: 'italic', tam: 9, color: CAFE })
  y = escribir(doc, frasesFirma(c.fechaExpedicion, 'La Ceja (Antioquia) Km 3 vía La Ceja- San Nicolas'), H + 59.8, {
    tam: 9, color: CAFE, ancho: 150,
  })
  const formacion = fraseFormacion(c.fechaInicioFormacion, c.fechaFinFormacion)
  if (formacion) y = escribir(doc, formacion, y + 4, { tam: 7, color: CAFE })
  y = escribir(doc, `Código de certificación: ${c.numeroCertificado}`, y + 3.8, { tam: 7, color: CAFE })
  escribir(doc, AUTENTICIDAD, y + 4.5, { tam: 8.5, color: NEGRO })
  escribir(doc, CONTACTO_ONAC, y + 8.6, { tam: 8.5, color: NEGRO })

  const E = d.empresa
  const XI = 31
  const XD = 121
  if (c.empresa) {
    escribir(doc, 'EMPLEADOR', E, { x: XI, alinear: 'left', estilo: 'bold', tam: 7.5, color: NEGRO })
    const finEmpresa = escribir(doc, c.empresa.toUpperCase(), E + 6.3, {
      x: XI, alinear: 'left', familia: 'romana', tam: 8, color: CAFE, ancho: 82, interlineado: 1.3,
    })
    if (c.nitEmpresa) {
      escribir(doc, `NIT: ${c.nitEmpresa}`, Math.max(E + 11.8, finEmpresa + 4.6), {
        x: XI + 2, alinear: 'left', estilo: 'bold', tam: 7.5, color: CAFE,
      })
    }
  }
  if (c.representanteLegal || c.documentoRepresentante) {
    escribir(doc, 'REPRESENTANTE LEGAL EMPLEADOR', E, { x: XD, alinear: 'left', estilo: 'bold', tam: 7.5, color: NEGRO })
    if (c.representanteLegal) nombreManuscrito(doc, nombrePropio(c.representanteLegal), XD + 27, E + 6.5, 14, 64)
    if (c.documentoRepresentante) {
      escribir(doc, `CC: ${conPuntos(c.documentoRepresentante)}`, E + 11.8, {
        x: XD + 10, alinear: 'left', estilo: 'bold', tam: 7.5, color: CAFE,
      })
    }
  }
  escribir(doc, 'A.R.L. AFILIADO TRABAJADOR', E + 20.5, { x: XI, alinear: 'left', estilo: 'bold', tam: 7.5, color: NEGRO })
  escribir(doc, (c.arl ?? '').toUpperCase(), E + 25, { x: XI, alinear: 'left', familia: 'romana', tam: 8, color: CAFE })

  const F = d.firmas
  const XL = 48
  const XR = 168
  firma(doc, r.firmaCentro, XL, F, 30)
  nombreManuscrito(doc, REPRESENTANTE_CENTRO, XL, F + 22.5, 17, 62, NEGRO)
  lineaPunteada(doc, XL - 31, XL + 31, F + 23.8)
  escribir(doc, 'Representante Legal', F + 30.5, { x: XL, estilo: 'bold', tam: 8.5, color: NEGRO })
  firma(doc, r.firmaEntrenador, XR, F + 1, 30)
  nombreManuscrito(doc, r.entrenador, XR, F + 22.5, 17, 62, NEGRO)
  lineaPunteada(doc, XR - 31, XR + 31, F + 23.8)
  escribir(doc, 'Entrenador', F + 30, { x: XR, estilo: 'bold', tam: 8.5, color: NEGRO })
  if (r.licencia) escribir(doc, `ENTRENADOR TSA LICENCIA S.O ${r.licencia}`, F + 34.5, { x: XR, tam: 7, color: NEGRO })
}

function plantillaCinta(doc, c, p, r) {
  const d = p.disposicion
  let y = d.encabezado
  for (const linea of p.titulo) {
    escribir(doc, linea, y, { estilo: 'bold', tam: 21, color: NEGRO })
    y += 11.8
  }
  y -= 1.2
  for (const linea of LINEAS_CENTRO) {
    escribir(doc, linea, y, { estilo: 'bold', tam: 6.5, color: NEGRO })
    y += 3.9
  }

  const H = d.cuerpo
  escribir(doc, 'HACE CONSTAR QUE', H, { estilo: 'bold', tam: 8, color: NEGRO })
  nombreManuscrito(doc, nombrePropio(c.nombreCompleto), CX, H + 19.6, 27, 125, NEGRO)
  doc.setDrawColor(NEGRO)
  doc.setLineWidth(0.25)
  doc.line(CX - 46, H + 23, CX + 46, H + 23)
  lineaDocumento(doc, c, H + 31.3, { color: NEGRO, numeroNegrita: false })
  escribir(doc, 'Curso y aprobó la acción de formación', H + 48, { estilo: 'italic', tam: 8.5, color: NEGRO })
  escribir(doc, p.tituloCurso, H + 56.5, { estilo: 'bold', tam: 10.5, color: NEGRO })
  escribir(doc, `con una duración de ${horas(c, p)} horas`, H + 65.5, { estilo: 'italic', tam: 8.5, color: NEGRO })
  y = escribir(doc, frasesFirma(c.fechaExpedicion, 'La Ceja (Antioquia)'), H + 79.3, { tam: 9, color: NEGRO, ancho: 150 })
  y = escribir(doc, `Código de certificación: ${c.numeroCertificado}`, y + 8.4, { tam: 7, color: NEGRO })
  for (const [etiqueta, valor] of [['EMPRESA', c.empresa], ['NIT', c.nitEmpresa], ['ARL', c.arl]]) {
    if (!valor) continue
    y = escribir(doc, `${etiqueta}: ${(valor ?? '').toUpperCase()}`, y + 4.1, { tam: 7, color: NEGRO, ancho: 120 })
  }

  const XR = 163
  nombreManuscrito(doc, REPRESENTANTE_CENTRO, XR, H + 125.4, 17, 62, NEGRO)
  lineaPunteada(doc, XR - 26, XR + 30, H + 127.4)
  escribir(doc, 'Representante Legal', H + 133, { x: XR, estilo: 'bold', tam: 8.5, color: NEGRO })
  nombreManuscrito(doc, r.entrenador, XR, H + 152.1, 17, 62, NEGRO)
  lineaPunteada(doc, XR - 26, XR + 30, H + 154.1)
  escribir(doc, 'Entrenador', H + 160, { x: XR, estilo: 'bold', tam: 8.5, color: NEGRO })
  if (r.licencia) escribir(doc, `ENTRENADOR TSA LICENCIA S.O ${r.licencia}`, H + 165.6, { x: XR, tam: 7, color: NEGRO })
}

function plantillaMedalla(doc, c, p, r) {
  const d = p.disposicion
  let y = d.encabezado
  for (const linea of p.titulo) {
    escribir(doc, linea, y, { estilo: 'bold', tam: 22, color: CAFE })
    y += 11.4
  }
  escribir(doc, 'ALTURA MAMBUSCAY S.A.S', y - 1.4, { estilo: 'bold', tam: 11, color: CAFE })
  escribir(doc, 'NIT: 901269652-6', y + 7.4, { tam: 7, color: CAFE })
  escribir(doc, 'CON LICENCIA DE SALUD OCUPACIONAL (DSSA) 97325', y + 11.3, { tam: 7, color: CAFE })

  const H = d.cuerpo
  escribir(doc, 'HACE CONSTAR QUE', H, { estilo: 'bold', tam: 8, color: CAFE })
  const nombre = (c.nombreCompleto ?? '').toUpperCase()
  escribir(doc, nombre, H + 10.5, { familia: 'romana', tam: tamanoQueCabe(doc, nombre, 'romana', 19, 125), color: CAFE })
  doc.setDrawColor(CAFE)
  doc.setLineWidth(0.5)
  doc.line(CX - 45.5, H + 18.6, CX + 45.5, H + 18.6)
  lineaDocumento(doc, c, H + 23.4, { color: CAFE })
  escribir(doc, p.cursoAprobado, H + 30.8, { estilo: 'italic', tam: 8.5, color: CAFE })
  y = escribir(doc, `Con una duración de ${horas(c, p)} horas`, H + 39, { estilo: 'italic', tam: 8.5, color: CAFE })

  const datosEmpresa = [
    ['Empresa', c.empresa],
    ['NIT', c.nitEmpresa],
    ['ARL', c.arl],
  ].filter(([, valor]) => valor)
  if (p.empresaAlineada === 'centro') {
    for (const [etiqueta, valor] of datosEmpresa) {
      y = escribir(doc, `${etiqueta}: ${valor ?? ''}`, y + 4.7, { estilo: 'italic', tam: 8.5, color: CAFE, ancho: 140 })
    }
  }
  y = escribir(doc, frasesFirma(c.fechaExpedicion, 'La Ceja (Antioquia)'), y + 12.8, { tam: 9, color: CAFE, ancho: 150 })
  y = escribir(doc, `Código de certificación: ${c.numeroCertificado}`, y + 4.4, { tam: 7, color: CAFE })
  if (p.empresaAlineada === 'izquierda') {
    y += 3.8
    for (const [etiqueta, valor] of datosEmpresa) {
      y = escribir(doc, `${etiqueta.toUpperCase()}: ${(valor ?? '').toUpperCase()}`, y + 3.9, {
        x: 31, alinear: 'left', estilo: 'bold', tam: 7, color: CAFE, ancho: 120,
      })
    }
  }
  const yAut = Math.max(y + 15, 208.6)
  escribir(doc, AUTENTICIDAD, yAut, { tam: 8.5, color: NEGRO })
  escribir(doc, CONTACTO, yAut + 4.3, { tam: 8.5, color: NEGRO })

  const XL = 52
  const XR = 168
  if (p.firmaRepresentante) firma(doc, r.firmaCentro, XL, 236, 32)
  nombreManuscrito(doc, REPRESENTANTE_CENTRO, XL, 254, 17, 62, NEGRO)
  lineaPunteada(doc, XL - 31, XL + 31, 256)
  escribir(doc, 'Representante Legal o Delegado del', 262.5, { x: XL, estilo: 'bold', tam: 8.5, color: NEGRO })
  escribir(doc, 'Centro de Capacitación', 267.3, { x: XL, estilo: 'bold', tam: 8.5, color: NEGRO })
  firma(doc, r.firmaEntrenador, XR, 238, 32)
  nombreManuscrito(doc, r.entrenador, XR, 263, 17, 62, NEGRO)
  lineaPunteada(doc, XR - 31, XR + 31, 265)
  if (r.licencia) escribir(doc, `ENTRENADOR TSA LICENCIA S.O ${r.licencia}`, 270.5, { x: XR, tam: 7, color: NEGRO })
}

const ESTILOS = { ONAC: plantillaOnac, CINTA: plantillaCinta, MEDALLA: plantillaMedalla }

// ---------------------------------------------------------------------------------------------

export const tienePlantillaOficial = (c) => Boolean(plantillaDeCurso(c))

export async function generarCertificadoPdf(datos) {
  const p = plantillaDeCurso(datos)
  if (!p) throw new Error('El curso no tiene plantilla oficial')
  // Certificados emitidos antes de guardar estos datos salen con los valores de siempre.
  const c = {
    ...datos,
    arl: datos.arl || ARL_POR_DEFECTO,
    ...(datos.fechaInicioFormacion || datos.fechaFinFormacion
      ? {}
      : fechasFormacionSugeridas(datos.fechaExpedicion, datos.intensidadHoraria)),
  }

  const entrenador = ENTRENADORES[c.entrenador] ? c.entrenador : (c.entrenador || p.entrenadores[0])
  const datosEntrenador = ENTRENADORES[entrenador]

  const doc = new jsPDF({ unit: 'mm', format: 'letter', compress: true })
  const H = doc.internal.pageSize.getHeight()

  const [fondo, logo, firmaCentro, firmaEntrenador, qr] = await Promise.all([
    cargarImagen(p.fondo),
    p.disposicion.logo ? cargarImagen('/plantillas/logo-am.png') : null,
    cargarImagen(ENTRENADORES[REPRESENTANTE_CENTRO].firma),
    datosEntrenador ? cargarImagen(datosEntrenador.firma) : null,
    c.urlVerificacion ? QRCode.toDataURL(c.urlVerificacion, { errorCorrectionLevel: 'M', margin: 1, width: 300 }) : null,
    registrarFuentes(doc),
  ])

  doc.setProperties({
    title: `Certificado ${c.numeroCertificado}`,
    subject: p.nombre,
    author: 'ALTURA MAMBUSCAY S.A.S',
    creator: 'ALTURA MAMBUSCAY S.A.S',
  })

  doc.addImage(fondo.data, fondo.formato, 0, 0, W, H, undefined, 'FAST')
  ESTILOS[p.estilo](doc, c, p, {
    logo,
    firmaCentro,
    firmaEntrenador,
    entrenador,
    licencia: datosEntrenador?.licencia,
  })

  if (qr && p.disposicion.qr) {
    const { x, y } = p.disposicion.qr
    const lado = 17
    doc.setFillColor('#FFFFFF')
    doc.rect(x - 1, y - 1, lado + 2, lado + 5, 'F')
    doc.addImage(qr, 'PNG', x, y, lado, lado)
    escribir(doc, 'Escanee para verificar', y + lado + 2.6, { x: x + lado / 2, tam: 5, color: NEGRO })
  }

  if (c.estado && c.estado !== 'VIGENTE') {
    doc.saveGraphicsState()
    doc.setGState(new doc.GState({ opacity: 0.15 }))
    escribir(doc, 'NO VIGENTE', H / 2 + 10, { estilo: 'bold', tam: 64, color: '#B91C1C' })
    doc.restoreGraphicsState()
  }

  return doc
}

export async function descargarCertificadoPdf(c) {
  const doc = await generarCertificadoPdf(c)
  doc.save(`Certificado-${latin1(c.numeroCertificado)}.pdf`)
}
