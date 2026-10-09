import { fullName, maskDocument } from './format.js'
import { verificationUrl } from './verification.js'

// Normaliza los datos para el PDF. La constancia genérica usa el documento enmascarado; el
// certificado oficial (plantilla del curso) imprime el número completo, como en el Word.

// Respuesta de /public/consulta (snake_case). Quien consulta ya escribió el número completo.
export const constanciaDesdePublico = (c, persona, consultadoEn) => {
  const p = persona ?? c
  return {
    numeroCertificado: c.numero_certificado,
    codigoVerificacion: c.codigo_verificacion,
    urlVerificacion: verificationUrl(c.codigo_verificacion),
    nombreCompleto: p.nombre_completo,
    tipoDocumento: p.tipo_documento,
    numeroDocumento: p.numero_documento ?? c.numero_documento,
    documentoEnmascarado: p.numero_documento_enmascarado,
    curso: c.curso,
    prefijoCodigo: c.prefijo_codigo,
    nivel: c.nivel_formacion,
    tipoActividad: c.tipo_actividad,
    intensidadHoraria: c.intensidad_horaria,
    fechaExpedicion: c.fecha_expedicion,
    fechaVencimiento: c.fecha_vencimiento,
    estado: c.estado,
    centroFormacion: c.centro_formacion,
    empresa: c.empresa,
    nitEmpresa: c.nit_empresa,
    representanteLegal: c.representante_legal,
    documentoRepresentante: c.documento_representante,
    arl: c.arl,
    fechaInicioFormacion: c.fecha_inicio_formacion,
    fechaFinFormacion: c.fecha_fin_formacion,
    entrenador: c.entrenador,
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
  numeroDocumento: c.numeroDocumento,
  documentoEnmascarado: maskDocument(c.numeroDocumento),
  curso: c.curso,
  prefijoCodigo: c.prefijoCodigo,
  nivel: c.nivel,
  tipoActividad: c.tipoActividad,
  intensidadHoraria: c.intensidadHoraria,
  fechaExpedicion: c.fechaExpedicion,
  fechaVencimiento: c.fechaVencimiento,
  estado: c.estado,
  centroFormacion: c.centroFormacion,
  empresa: c.empresa,
  nitEmpresa: c.nitEmpresa,
  representanteLegal: c.representanteLegal,
  documentoRepresentante: c.documentoRepresentante,
  arl: c.arl,
  fechaInicioFormacion: c.fechaInicioFormacion,
  fechaFinFormacion: c.fechaFinFormacion,
  entrenador: c.entrenador,
  generadoEn: new Date().toISOString(),
})
