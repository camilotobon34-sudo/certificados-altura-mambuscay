import { jsPDF } from 'jspdf'
import QRCode from 'qrcode'
import { fechasFormacionSugeridas } from './datos-plantilla.js'
import {
  ARL_POR_DEFECTO,
  AUTENTICIDAD,
  CONTACTO,
  CONTACTO_ONAC,
  ENTRENADORES,
  LICENCIA,
  LINEAS_CENTRO,
  LINEAS_ONAC,
  LUGAR,
  LUGAR_ONAC,
  REPRESENTANTE_CENTRO,
  plantillaDeCurso,
} from './plantillas.js'

// Certificado oficial: reproduce la plantilla Word de cada curso (hoja carta, medidas en mm).

const CAFE = '#843C0C'
const NEGRO = '#000000'
const W = 215.9
const CX = W / 2

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

// Las fuentes incrustadas solo traen los caracteres Latin-1.
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

// Carlito tiene las mismas medidas que Calibri, la letra de las plantillas Word. Pinyon Script y
// Cinzel reemplazan a Edwardian Script y Algerian, que son de Office y no se pueden publicar.
const FUENTES = [
  ['manuscrita', 'normal', '/fuentes/PinyonScript-Regular.ttf'],
  ['romana', 'normal', '/fuentes/Cinzel-var.ttf'],
  ['romana', 'bold', '/fuentes/Cinzel-Bold.ttf'],
  ['calibri', 'normal', '/fuentes/Carlito-Regular.ttf'],
  ['calibri', 'bold', '/fuentes/Carlito-Bold.ttf'],
  ['calibri', 'italic', '/fuentes/Carlito-Italic.ttf'],
]
// Cinzel negrita es más ancha que Algerian; se comprime para que ocupe lo mismo que en el Word.
const ESCALA_ROMANA = 0.87

const registrarFuentes = async (doc) => {
  await Promise.all(
    FUENTES.map(async ([nombre, estilo, url]) => {
      const archivo = url.split('/').pop()
      doc.addFileToVFS(archivo, await cargarFuente(url))
      doc.addFont(archivo, nombre, estilo)
    }),
  )
}

// ---------------------------------------------------------------------------------------------
// Ayudas de dibujo

const fuente = (doc, { familia = 'calibri', estilo = 'normal', tam, color }) => {
  doc.setFont(familia, estilo)
  if (tam) doc.setFontSize(tam)
  if (color) doc.setTextColor(color)
}

// Escribe texto (centrado por defecto) y devuelve la línea base de la última línea. El interlineado
// por defecto es el sencillo de Word con Calibri.
const escribir = (doc, texto, y, { x = CX, ancho, alinear = 'center', interlineado = 1.22, escala = 1, ...estilo } = {}) => {
  fuente(doc, estilo)
  const plano = latin1(texto)
  const lineas = ancho ? doc.splitTextToSize(plano, ancho / escala) : [plano]
  if (escala === 1) {
    doc.text(lineas, x, y, { align: alinear, lineHeightFactor: interlineado })
  } else {
    // jsPDF no considera horizontalScale al alinear y deja la escala activa para los textos siguientes.
    const paso = (doc.getFontSize() * interlineado * 25.4) / 72
    const factor = { left: 0, center: 0.5, right: 1 }[alinear]
    doc.saveGraphicsState()
    lineas.forEach((l, i) => {
      doc.text(l, x - doc.getTextWidth(l) * escala * factor, y + i * paso, { horizontalScale: escala })
    })
    doc.restoreGraphicsState()
  }
  const paso = (doc.getFontSize() * interlineado * 25.4) / 72
  return y + (lineas.length - 1) * paso
}

// Reduce el tamaño hasta que el texto quepa en el ancho dado.
const tamanoQueCabe = (doc, texto, familia, tam, ancho, estilo = 'normal') => {
  doc.setFont(familia, estilo)
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

// Los Word estiran cada firma a un tamaño fijo, sin respetar su proporción.
const firma = (doc, img, { x, y, w, h }) => {
  if (!img) return
  doc.setFillColor('#FFFFFF')
  doc.rect(x, y, w, h, 'F')
  doc.addImage(img.data, img.formato, x, y, w, h)
}

const lineaRecta = (doc, x1, x2, y, color) => {
  doc.setDrawColor(color)
  doc.setLineWidth(0.21)
  doc.line(x1, y, x2, y)
}

// Línea "Con Cédula de Ciudadanía No. X": etiqueta en negrita 10 y el número con su propio estilo.
const lineaDocumento = (doc, c, y, { cx = CX, color, numero = { estilo: 'bold', tam: 10 } }) => {
  const etiqueta = `Con ${TIPOS_DOCUMENTO[c.tipoDocumento] ?? c.tipoDocumento ?? 'documento'} No. `
  const valor = conPuntos(c.numeroDocumento ?? c.documentoEnmascarado ?? '')
  fuente(doc, { estilo: 'bold', tam: 10, color })
  const a = doc.getTextWidth(latin1(etiqueta))
  fuente(doc, numero)
  const b = doc.getTextWidth(latin1(valor))
  const x0 = cx - (a + b) / 2
  fuente(doc, { estilo: 'bold', tam: 10 })
  doc.text(latin1(etiqueta), x0, y)
  fuente(doc, numero)
  doc.text(latin1(valor), x0 + a, y)
}

// Firmas, nombres manuscritos, líneas y rótulos del pie, en las posiciones de cada Word.
function bloqueFirmas(doc, f, r) {
  for (const i of f.imagenes ?? []) firma(doc, i.de === 'centro' ? r.firmaCentro : r.firmaEntrenador, i)
  for (const l of f.lineas ?? []) lineaPunteada(doc, l.x1, l.x2, l.y)
  for (const n of f.nombres ?? []) {
    const texto = n.de === 'centro' ? REPRESENTANTE_CENTRO : r.entrenador
    if (!texto) continue
    nombreManuscrito(doc, texto, n.cx, n.y, 21, 66, NEGRO)
    if (n.subrayado) {
      const ancho = doc.getTextWidth(latin1(texto))
      lineaPunteada(doc, n.cx - ancho / 2, n.cx + ancho / 2, n.y + 1.3)
    }
  }
  for (const t of f.textos ?? []) {
    const esLicencia = t.t === LICENCIA
    if (esLicencia && !r.licencia) continue
    escribir(doc, esLicencia ? `ENTRENADOR TSA LICENCIA S.O ${r.licencia}` : t.t, t.y, {
      x: t.x ?? t.cx,
      alinear: t.alinear ?? 'center',
      estilo: esLicencia ? 'normal' : 'bold',
      tam: esLicencia ? 10 : 12,
      color: NEGRO,
    })
  }
}

const horas = (c, p) => {
  const h = Number(c.intensidadHoraria)
  return p.horasDosDigitos ? String(h).padStart(2, '0') : String(h)
}

// ---------------------------------------------------------------------------------------------
// Estilos de plantilla

function empleadorOnac(doc, c, e) {
  const etiqueta = (texto, x, y) => escribir(doc, texto, y, { x, alinear: 'left', estilo: 'bold', tam: 10, color: NEGRO })
  const yEmpresa = e.y + (e.trasEtiqueta ?? 6.3)
  let yNit = yEmpresa + 5.5
  if (c.empresa) {
    etiqueta('EMPLEADOR', e.xEtiqueta, e.y)
    const fin = escribir(doc, c.empresa.toUpperCase(), yEmpresa, {
      x: e.x, alinear: 'left', familia: 'romana', estilo: 'bold', escala: ESCALA_ROMANA, tam: e.tamEmpresa, color: CAFE, ancho: 85, interlineado: 1.67,
    })
    yNit = Math.max(yNit, fin + 4.3)
    if (c.nitEmpresa) {
      escribir(doc, `NIT: ${c.nitEmpresa}`, yNit, { x: e.xNit ?? e.x, alinear: 'left', estilo: 'bold', tam: 10, color: CAFE })
    }
  }
  if (c.representanteLegal || c.documentoRepresentante) {
    etiqueta('REPRESENTANTE LEGAL EMPLEADOR', e.xRepresentante, e.y)
    if (c.representanteLegal) {
      nombreManuscrito(doc, nombrePropio(c.representanteLegal), e.cxNombreRepresentante, yEmpresa, 16, 60)
    }
    if (c.documentoRepresentante) {
      escribir(doc, `CC: ${conPuntos(c.documentoRepresentante)}`, yEmpresa + 5.6, {
        x: e.cxCc, estilo: 'bold', tam: 10, color: CAFE,
      })
    }
  }
  const yArl = Math.max(e.arl, yNit + 8.6)
  etiqueta(e.etiquetaArl, e.x, yArl)
  escribir(doc, `${(c.arl ?? '').toUpperCase()}${e.sufijoArl ?? ''}`, yArl + e.trasArl, {
    x: e.x, alinear: 'left', estilo: 'bold', tam: e.tamArl, color: CAFE, ...(e.arlEnNegrita ? { familia: 'calibri' } : { familia: 'romana', escala: ESCALA_ROMANA }),
  })
}

function plantillaOnac(doc, c, p, r) {
  const m = p.medidas
  const cx = m.centro ?? CX
  const cafe = { x: cx, color: CAFE }
  if (p.logo && r.logo) doc.addImage(r.logo.data, 'PNG', p.logo.x, p.logo.y, p.logo.w, p.logo.w / r.logo.ratio)
  escribir(doc, p.encabezado, m.encabezado, { ...cafe, estilo: 'bold', tam: m.tamEncabezado })
  escribir(doc, 'ALTURA MAMBUSCAY S.A.S', m.altura, { ...cafe, estilo: 'bold', tam: 28 })
  LINEAS_ONAC.forEach((linea, i) => escribir(doc, linea, m.onac + i * 3.88, { ...cafe, tam: 9 }))

  escribir(doc, 'HACE CONSTAR QUE', m.hace, { ...cafe, estilo: 'bold', tam: 11 })
  const { linea } = m
  nombreManuscrito(doc, nombrePropio(c.nombreCompleto), (linea.x1 + linea.x2) / 2, m.nombre, 34, 130)
  lineaRecta(doc, linea.x1, linea.x2, linea.y, CAFE)
  lineaDocumento(doc, c, m.cedula, { cx: m.cxCedula ?? cx, color: CAFE })
  escribir(doc, p.textoCurso, m.curso, { ...cafe, estilo: 'italic', tam: 11 })
  escribir(doc, p.tituloCurso, m.titulo, { ...cafe, estilo: 'bold', tam: 14 })
  escribir(doc, `${p.textoDuracion} ${horas(c, p)} horas`, m.duracion, { ...cafe, estilo: 'italic', tam: 11 })
  let y = escribir(doc, frasesFirma(c.fechaExpedicion, LUGAR_ONAC), m.testimonio, { ...cafe, tam: 11, ancho: m.anchoTexto })
  const formacion = fraseFormacion(c.fechaInicioFormacion, c.fechaFinFormacion)
  if (formacion) {
    y = escribir(doc, formacion, y + m.trasTestimonio, { ...cafe, tam: m.tamFormacion ?? 9, ancho: m.anchoTexto })
  }
  y = escribir(doc, `Código de certificación: ${c.numeroCertificado}`, y + (formacion ? m.trasFormacion : m.trasTestimonio), {
    ...cafe, tam: 9,
  })
  const posicion = (x) => (x ? { x, alinear: 'left' } : { x: cx })
  escribir(doc, AUTENTICIDAD, y + m.trasCodigo, { ...posicion(m.autenticidadX), tam: 10, color: NEGRO })
  escribir(doc, p.contactoEnMayusculas ? CONTACTO_ONAC.toUpperCase() : CONTACTO_ONAC, y + m.trasCodigo + 4.3, {
    ...posicion(m.contactoX), tam: 10, color: NEGRO,
  })

  empleadorOnac(doc, c, p.empleadorPorEntrenador?.[r.entrenador] ?? p.empleador)
  bloqueFirmas(doc, r.firmas, r)
}

// Títulos de 28 pt que empiezan en la misma altura en todas las plantillas CINTA y MEDALLA.
const titulos = (doc, lineas, color) => {
  let y = 34.4
  for (const linea of lineas) {
    escribir(doc, linea, y, { estilo: 'bold', tam: 28, color })
    y += 12.05
  }
  return y - 12.05
}

function plantillaCinta(doc, c, p, r) {
  let y = titulos(doc, p.titulo, NEGRO) + 9.6
  for (const linea of LINEAS_CENTRO) {
    escribir(doc, linea, y, { estilo: 'bold', tam: 9, color: NEGRO })
    y += 3.87
  }

  const H = y - 3.87 + 17.1
  const negro = { color: NEGRO }
  escribir(doc, 'HACE CONSTAR QUE', H, { ...negro, estilo: 'bold', tam: 11 })
  nombreManuscrito(doc, nombrePropio(c.nombreCompleto), 112.7, H + 21.6, 34, 130, NEGRO)
  lineaRecta(doc, 66.9, 158.5, H + 25.4, NEGRO)
  lineaDocumento(doc, c, H + 31.5, { color: NEGRO, numero: { estilo: 'normal', tam: 11 } })
  escribir(doc, 'Curso y aprobó la acción de formación', H + 48.6, { ...negro, estilo: 'italic', tam: 11 })
  escribir(doc, p.tituloCurso, H + 57.8, { ...negro, estilo: 'bold', tam: 14 })
  escribir(doc, `con una duración de ${horas(c, p)} horas`, H + 66.3, { ...negro, estilo: 'italic', tam: 11 })
  y = escribir(doc, frasesFirma(c.fechaExpedicion, LUGAR), H + 80.5, { ...negro, tam: 11, ancho: 156 })
  y = escribir(doc, `Código de certificación: ${c.numeroCertificado}`, y + 8, { ...negro, tam: 9 })
  for (const [etiqueta, valor] of [['EMPRESA', c.empresa], ['NIT', c.nitEmpresa], ['ARL', c.arl]]) {
    if (!valor) continue
    y = escribir(doc, `${etiqueta}: ${valor.toUpperCase()}`, y + 3.9, {
      ...negro, tam: 9, ancho: 150, estilo: etiqueta === 'EMPRESA' ? 'bold' : 'normal',
    })
  }

  bloqueFirmas(doc, r.firmas, r)
}

function plantillaMedalla(doc, c, p, r) {
  const cafe = { color: CAFE }
  const y0 = titulos(doc, p.titulo, CAFE)
  escribir(doc, 'ALTURA MAMBUSCAY S.A.S', y0 + 8.1, { ...cafe, estilo: 'bold', tam: 16 })
  escribir(doc, 'NIT: 901269652-6', y0 + 16.5, { ...cafe, tam: 9 })
  escribir(doc, 'CON LICENCIA DE SALUD OCUPACIONAL (DSSA) 97325', y0 + 20.3, { ...cafe, tam: 9 })

  const H = 119.1
  escribir(doc, 'HACE CONSTAR QUE', H, { ...cafe, estilo: 'bold', tam: 11 })
  const nombre = (c.nombreCompleto ?? '').toUpperCase()
  escribir(doc, nombre, H + 11.2, { ...cafe, x: 112.7, familia: 'romana', estilo: 'bold', escala: ESCALA_ROMANA, tam: tamanoQueCabe(doc, nombre, 'romana', 22, 130 / ESCALA_ROMANA, 'bold') })
  lineaRecta(doc, 66.9, 158.5, H + 17.3, CAFE)
  lineaDocumento(doc, c, H + 23.1, { color: CAFE })
  escribir(doc, p.cursoAprobado, H + 31, { ...cafe, estilo: 'italic', tam: 11 })
  let y = escribir(doc, `Con una duración de ${horas(c, p)} horas`, H + 39.2, { ...cafe, estilo: 'italic', tam: 11 })

  const datosEmpresa = [
    ['Empresa', c.empresa],
    ['NIT', c.nitEmpresa],
    ['ARL', c.arl],
  ].filter(([, valor]) => valor)
  if (p.empresaAlineada === 'centro') {
    for (const [etiqueta, valor] of datosEmpresa) {
      y = escribir(doc, `${etiqueta}: ${valor}`, y + 4.7, { ...cafe, estilo: 'italic', tam: 11, ancho: 150 })
    }
  }
  y = escribir(doc, frasesFirma(c.fechaExpedicion, LUGAR), y + (p.empresaAlineada === 'centro' ? 13 : 12.9), {
    ...cafe, tam: 11, ancho: 156,
  })
  y = escribir(doc, `Código de certificación: ${c.numeroCertificado}`, y + 4.1, { ...cafe, tam: 9 })
  if (p.empresaAlineada === 'izquierda') {
    y += 3.8
    for (const [etiqueta, valor] of datosEmpresa) {
      y = escribir(doc, `${etiqueta.toUpperCase()}: ${valor.toUpperCase()}`, y + 3.9, {
        ...cafe, x: 30, alinear: 'left', estilo: 'bold', tam: 9, ancho: 150,
      })
    }
  }
  const yAut = Math.max(p.autenticidad, y + 8)
  escribir(doc, AUTENTICIDAD, yAut, { tam: 10, color: NEGRO })
  escribir(doc, CONTACTO, yAut + 4.3, { tam: 10, color: NEGRO })

  bloqueFirmas(doc, r.firmas, r)
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

  const archivoFirma = (d) => (p.firmaAlterna && d.firmaAlterna) || d.firma
  const [fondo, logo, firmaCentro, firmaEntrenador, qr] = await Promise.all([
    cargarImagen(p.fondo),
    p.logo ? cargarImagen('/plantillas/logo-am.png') : null,
    cargarImagen(archivoFirma(ENTRENADORES[REPRESENTANTE_CENTRO])),
    datosEntrenador ? cargarImagen(archivoFirma(datosEntrenador)) : null,
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
    firmas: p.firmasPorEntrenador?.[entrenador] ?? p.firmas,
  })

  if (qr && p.qr) {
    const { x, y } = p.qr
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
