import { plantillaDeCurso } from './plantillas.js'

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

// Al editar certificados anteriores a estos campos no se exigen, para no bloquear otros cambios.
export const validarDatosPlantilla = (v, { exigir = true } = {}) => {
  const errores = {}
  if (exigir && !v.empresa.trim()) errores.empresa = 'Escriba la empresa (empleador)'
  if (exigir && !v.arl.trim()) errores.arl = 'Escriba la ARL'
  if (v.fechaInicioFormacion && v.fechaFinFormacion && v.fechaFinFormacion < v.fechaInicioFormacion) {
    errores.fechaFinFormacion = 'Debe ser igual o posterior al inicio'
  }
  return errores
}
