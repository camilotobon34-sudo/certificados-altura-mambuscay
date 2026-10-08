// Números de documento se guardan sin puntos ni espacios y en mayúsculas (PA/PPT son alfanuméricos).
export const normalizarNumeroDocumento = (valor = '') => String(valor).replace(/[\s.]/g, '').toUpperCase();
