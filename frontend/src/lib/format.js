const TIME_ZONE = 'America/Bogota'

// Fechas de negocio llegan como 'YYYY-MM-DD'; se muestran DD/MM/AAAA sin conversión de zona.
export const formatDate = (value) => {
  if (!value) return '—'
  const [y, m, d] = String(value).slice(0, 10).split('-')
  return d && m && y ? `${d}/${m}/${y}` : String(value)
}

// 'YYYY-MM-DD' → '30 de septiembre de 2026'
export const formatLongDate = (value) => {
  if (!value) return '—'
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

export const addMonthsIso = (iso, months) => {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1 + months, d))
  return date.toISOString().slice(0, 10)
}

export const maskDocument = (numero = '') =>
  numero.length <= 4 ? numero : '*'.repeat(numero.length - 4) + numero.slice(-4)

export const fullName = (p) => [p?.nombres, p?.apellidos].filter(Boolean).join(' ')

// El reentrenamiento no es un nivel (Res. 4272 de 2021, Art. 27): se rotula explícitamente.
export const tituloFormacion = ({ nivel, tipoActividad, tipoActividadCodigo }) =>
  tipoActividadCodigo === 'REENTRENAMIENTO'
    ? `Reentrenamiento${nivel ? ` — ${nivel}` : ''}`
    : (nivel ?? tipoActividad)
