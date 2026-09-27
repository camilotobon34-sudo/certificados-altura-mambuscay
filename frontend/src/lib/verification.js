// Acepta el código, el número de certificado o la URL completa contenida en el QR.
export const extractVerificationCode = (raw = '') => {
  const value = raw.trim()
  if (!value) return ''
  const fromUrl = value.match(/\/verificar\/([A-Za-z0-9-]+)\/?(?:[?#].*)?$/)
  return (fromUrl ? fromUrl[1] : value).toUpperCase()
}

export const isValidCode = (code) => /^[A-Z0-9-]{4,64}$/.test(code)
