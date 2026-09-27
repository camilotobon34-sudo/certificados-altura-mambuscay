import { fullName, maskDocument } from './format.js'
import { verificationUrl } from './verification.js'

// Normaliza los datos para la constancia PDF. El documento siempre se enmascara.

// Respuesta de /public/consulta (snake_case, ya enmascarada).
export const constanciaDesdePublico = (c, persona, consultadoEn) => {
  const p = persona ?? c
  return {
    numeroCertificado: c.numero_certificado,
    codigoVerificacion: c.codigo_verificacion,
    urlVerificacion: verificationUrl(c.codigo_verificacion),
    nombreCompleto: p.nombre_completo,
    tipoDocumento: p.tipo_documento,
    documentoEnmascarado: p.numero_documento_enmascarado,
    curso: c.curso,
    nivel: c.nivel_formacion,
    tipoActividad: c.tipo_actividad,
    intensidadHoraria: c.intensidad_horaria,
    fechaExpedicion: c.fecha_expedicion,
    fechaVencimiento: c.fecha_vencimiento,
    estado: c.estado,
    centroFormacion: c.centro_formacion,
    generadoEn: consultadoEn ?? new Date().toISOString(),
  }
}

// Detalle interno (/certificados/:id) y del estudiante (/estudiante/certificados/:id).
export const constanciaDesdeInterno = (c) => ({
  numeroCertificado: c.numeroCertificado,
  codigoVerificacion: c.codigoVerificacion,
  urlVerificacion: verificationUrl(c.codigoVerificacion),
  nombreCompleto: fullName(c),
  tipoDocumento: c.tipoDocumento,
  documentoEnmascarado: maskDocument(c.numeroDocumento),
  curso: c.curso,
  nivel: c.nivel,
  tipoActividad: c.tipoActividad,
  intensidadHoraria: c.intensidadHoraria,
  fechaExpedicion: c.fechaExpedicion,
  fechaVencimiento: c.fechaVencimiento,
  estado: c.estado,
  centroFormacion: c.centroFormacion,
  generadoEn: new Date().toISOString(),
})
