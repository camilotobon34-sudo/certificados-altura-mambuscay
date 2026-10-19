const TIME_ZONE = 'America/Bogota'

// Valor guardado en BD cuando el centro define vigencia indefinida (la columna no admite NULL).
export const FECHA_VENCIMIENTO_INDEFINIDA = '9999-12-31'

export const esFechaIndefinida = (value) => String(value ?? '').slice(0, 10) === FECHA_VENCIMIENTO_INDEFINIDA

// El centro define vigencia indefinida solo para Coordinador (prefijo C00RDAM-).
export const esCursoCoordinador = (curso = {}) =>
  curso.nivelCodigo === 'COORDINADOR' ||
  /^C00RDAM/i.test(curso.prefijoCodigo || '') ||
  /coordinador/i.test(`${curso.nombre || ''} ${curso.curso || ''}`)

// Fechas de negocio llegan como 'YYYY-MM-DD'; se muestran DD/MM/AAAA sin conversión de zona.
export const formatDate = (value) => {
  if (!value) return '—'
  if (esFechaIndefinida(value)) return 'Indefinido'
  const [y, m, d] = String(value).slice(0, 10).split('-')
  return d && m && y ? `${d}/${m}/${y}` : String(value)
}

// 'YYYY-MM-DD' → '30 de septiembre de 2026'
export const formatLongDate = (value) => {
  if (!value) return '—'
  if (esFechaIndefinida(value)) return 'Indefinido'
  const [y, m, d] = String(value).slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return String(value)
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, d)),
  )
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  // 'YYYY-MM-DD HH:mm:ss' del servidor ya está en hora de Colombia.
  const local = String(value).match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (local && !String(value).endsWith('Z')) {
    const [, y, m, d, hh, mm] = local
    return `${d}/${m}/${y} ${hh}:${mm}`
  }
  return new Intl.DateTimeFormat('es-CO', {
    timeZone: TIME_ZONE,
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

export const todayIso = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date())

export const firstDayOfMonthIso = () => `${todayIso().slice(0, 8)}01`

export const addMonthsIso = (iso, months) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1 + months, d))
  return date.toISOString().slice(0, 10)
}

export const maskDocument = (numero = '') =>
  numero.length <= 4 ? numero : '*'.repeat(numero.length - 4) + numero.slice(-4)

export const fullName = (p) => [p?.nombres, p?.apellidos].filter(Boolean).join(' ')

// Un solo concepto: reentrenamiento o el nivel (autorizado, coordinador…). Nunca los dos.
export const esReentrenamiento = (c = {}) =>
  c.tipoActividadCodigo === 'REENTRENAMIENTO' ||
  /reentrenamiento/i.test(`${c.tipoActividad || ''} ${c.curso || ''} ${c.nombre || ''}`)

export const tituloFormacion = (c = {}) =>
  esReentrenamiento(c) ? (c.tipoActividad || 'Reentrenamiento') : (c.nivel ?? c.tipoActividad)

// Cédula con puntos de miles, como en los certificados impresos (1.001.452.434).
export const documentoConPuntos = (numero = '') => {
  const limpio = String(numero).replace(/[\s.-]/g, '')
  return /^\d+$/.test(limpio) ? limpio.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : limpio
}

// Nombre del PDF al descargar: "REENTRENAMIENTO 1.001.452.434-HARLING A QUICENO BURITICA.pdf"
export const nombreArchivoCertificado = ({ cursoEtiqueta, curso, tipoActividad, numeroDocumento, nombreCompleto } = {}) => {
  const origen =
    cursoEtiqueta ||
    (/reentrenamiento/i.test(`${tipoActividad || ''} ${curso || ''}`) ? 'REENTRENAMIENTO' : curso) ||
    'CERTIFICADO'
  const etiqueta = String(origen)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim()
  // En la captura el reentrenamiento sale solo como "REENTRENAMIENTO".
  const cursoArchivo = /REENTRENAMIENTO/.test(etiqueta) ? 'REENTRENAMIENTO' : etiqueta
  const cc = documentoConPuntos(numeroDocumento)
  const nombre = String(nombreCompleto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const base = [cursoArchivo, cc && nombre ? `${cc}-${nombre}` : cc || nombre || 'sin-datos'].filter(Boolean).join(' ')
  return `${base.slice(0, 180)}.pdf`
}
