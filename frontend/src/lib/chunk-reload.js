// Tras un nuevo despliegue, los archivos de la versión anterior ya no existen en el servidor:
// una pestaña abierta (o la PWA) falla al abrir una sección. Se recarga una sola vez para
// tomar la versión nueva; el intervalo evita recargas en bucle si el error persiste.
const KEY = 'mambuscay.chunk-reload'
const INTERVALO_MS = 10_000

export const isChunkLoadError = (error) =>
  /dynamically imported module|Importing a module script failed|error loading dynamically imported module|Unable to preload CSS/i.test(
    String(error?.message ?? error ?? ''),
  )

export const reloadOnce = () => {
  const ultima = Number(sessionStorage.getItem(KEY) ?? 0)
  if (Date.now() - ultima < INTERVALO_MS) return false
  sessionStorage.setItem(KEY, String(Date.now()))
  window.location.reload()
  return true
}

window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnce()) event.preventDefault()
})
