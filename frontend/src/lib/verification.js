// Acepta el código de verificación o la URL completa contenida en el QR.
export const extractVerificationCode = (raw = '') => {
  const value = raw.trim()
  if (!value) return ''
  const fromUrl = value.match(/\/verificar\/([A-Za-z0-9-]+)\/?(?:[?#].*)?$/)
  return (fromUrl ? fromUrl[1] : value).toUpperCase()
}

export const isValidCode = (code) => /^[A-Z0-9-]{4,64}$/.test(code)

// Formato del número de certificado asignado por el sistema (MAM-JA-2026-000007); no es el código.
export const looksLikeCertificateNumber = (value) => /^MAM-[A-Z]{2}-\d{4}-\d{6}$/.test(value)

// URL pública del QR y del PDF: se arma con el dominio donde corre la app y el código, para no
// depender de la url_verificacion guardada al emitir (los QR antiguos apuntaban a localhost).
export const verificationUrl = (codigo) => `${window.location.origin}/verificar/${encodeURIComponent(codigo)}`
