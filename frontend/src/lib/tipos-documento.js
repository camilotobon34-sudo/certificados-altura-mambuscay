import { useEffect, useState } from 'react'
import { api } from './api.js'

// Respaldo si no hay conexión al cargar; los códigos coinciden con tipos_documento.
export const TIPOS_DOCUMENTO_RESPALDO = [
  { codigo: 'CC', nombre: 'Cédula de ciudadanía' },
  { codigo: 'CE', nombre: 'Cédula de extranjería' },
  { codigo: 'PA', nombre: 'Pasaporte' },
  { codigo: 'PPT', nombre: 'Permiso por protección temporal' },
  { codigo: 'TI', nombre: 'Tarjeta de identidad' },
]
const ORDEN_TIPOS = TIPOS_DOCUMENTO_RESPALDO.map((t) => t.codigo)
export const TIPOS_ALFANUMERICOS = new Set(['PA', 'PPT'])

const ordenarTipos = (tipos) =>
  [...tipos].sort((a, b) => {
    const ia = ORDEN_TIPOS.indexOf(a.codigo)
    const ib = ORDEN_TIPOS.indexOf(b.codigo)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

// Tipos de documento públicos (no requieren sesión), ordenados con la cédula primero.
export function useTiposDocumentoPublicos() {
  const [tipos, setTipos] = useState(TIPOS_DOCUMENTO_RESPALDO)
  useEffect(() => {
    const controller = new AbortController()
    api
      .get('/public/tipos-documento', undefined, { signal: controller.signal })
      .then(({ tipos: remotos }) => remotos?.length && setTipos(ordenarTipos(remotos)))
      .catch(() => {})
    return () => controller.abort()
  }, [])
  return tipos
}
