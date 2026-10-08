import { useEffect } from 'react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { Home, LoaderCircle, RefreshCw } from 'lucide-react'
import { LogoSymbol } from '../components/brand/Logo.jsx'
import { Button } from '../components/ui/Button.jsx'
import { isChunkLoadError, reloadOnce } from '../lib/chunk-reload.js'
import NotFoundPage from './NotFoundPage.jsx'

// Error de ruta: en lugar de la pantalla técnica de React Router se muestra un mensaje claro.
export default function RouteErrorPage() {
  const error = useRouteError()
  const versionNueva = isChunkLoadError(error)

  useEffect(() => {
    if (versionNueva) reloadOnce()
  }, [versionNueva])

  if (isRouteErrorResponse(error) && error.status === 404) return <NotFoundPage />

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <LogoSymbol className="h-24" />
      {versionNueva ? (
        <>
          <h1 className="text-3xl text-primary">Hay una versión nueva de la aplicación</h1>
          <p className="max-w-md text-muted">
            Estamos cargando la actualización. Si la página no se recarga sola, pulse el botón.
          </p>
          <LoaderCircle className="size-6 animate-spin text-primary" aria-hidden="true" />
        </>
      ) : (
        <>
          <h1 className="text-3xl text-primary">Algo salió mal</h1>
          <p className="max-w-md text-muted">
            Ocurrió un error inesperado al mostrar esta página. Recargue la página o vuelva al inicio.
          </p>
        </>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <Button icon={RefreshCw} onClick={() => window.location.reload()}>
          Recargar
        </Button>
        <Button variant="secondary" icon={Home} onClick={() => window.location.assign('/')}>
          Ir al inicio
        </Button>
      </div>
    </div>
  )
}
