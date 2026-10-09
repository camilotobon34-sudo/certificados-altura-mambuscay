import { ARL_POR_DEFECTO, empresaDeCurso, plantillaDeCurso } from './plantillas.js'

// Datos que imprime la plantilla oficial del curso: empleador, ARL, fechas de la formación y entrenador.
export const DATOS_PLANTILLA_VACIOS = {
  empresa: '',
  nitEmpresa: '',
  representanteLegal: '',
  documentoRepresentante: '',
  arl: '',
  fechaInicioFormacion: '',
  fechaFinFormacion: '',
  entrenador: '',
}

export const datosPlantillaDe = (c) =>
  Object.fromEntries(Object.keys(DATOS_PLANTILLA_VACIOS).map((campo) => [campo, c?.[campo] ?? '']))

export const datosPlantillaParaApi = (v) =>
  Object.fromEntries(Object.entries(v).map(([campo, valor]) => [campo, valor.trim() || null]))

export const entrenadorPorDefecto = (curso) => plantillaDeCurso(curso)?.entrenadores[0] ?? ''

// Todas las plantillas del centro traen SURA.
export { ARL_POR_DEFECTO }

// La formación termina el día de expedición y dura una jornada de 8 horas por día (32 h → 4 días).
export const fechasFormacionSugeridas = (fechaExpedicion, horas) => {
  if (!fechaExpedicion) return { fechaInicioFormacion: '', fechaFinFormacion: '' }
  const dias = Math.min(Math.max(Math.ceil(Number(horas || 8) / 8), 1), 10)
  const [y, m, d] = fechaExpedicion.split('-').map(Number)
  const inicio = new Date(Date.UTC(y, m - 1, d - (dias - 1))).toISOString().slice(0, 10)
  return { fechaInicioFormacion: inicio, fechaFinFormacion: fechaExpedicion }
}

export const camposEmpresa = (e) => ({
  empresa: e?.empresa ?? '',
  nitEmpresa: e?.nitEmpresa ?? '',
  representanteLegal: e?.representanteLegal ?? '',
  documentoRepresentante: e?.documentoRepresentante ?? '',
  arl: e?.arl || ARL_POR_DEFECTO,
})

// Empresa, NIT, representante y ARL que trae la plantilla Word del curso.
export const empresaPorDefecto = (curso, entrenador) => camposEmpresa(empresaDeCurso(curso, entrenador))

// Altura Mambuscay es el centro de capacitación, nunca el empleador: si quedó así fue por error.
export const empresaInvalida = (empresa) => !empresa || /mambuscay/i.test(empresa)

// Ningún dato es obligatorio: lo que quede vacío no se imprime.
export const validarDatosPlantilla = (v) => {
  const errores = {}
  if (v.fechaInicioFormacion && v.fechaFinFormacion && v.fechaFinFormacion < v.fechaInicioFormacion) {
    errores.fechaFinFormacion = 'Debe ser igual o posterior al inicio'
  }
  return errores
}
