import { LoaderCircle, SearchX } from 'lucide-react'
import { Alert } from './Alert.jsx'

export function Spinner({ label = 'Cargando...', className = '' }) {
  return (
    <div role="status" className={`flex items-center justify-center gap-2 py-10 text-muted ${className}`}>
      <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({ icon: Icon = SearchX, title, description, action }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
      <Icon className="size-10 text-muted" aria-hidden="true" />
      <p className="font-semibold text-ink">{title}</p>
      {description && <p className="max-w-md text-sm text-muted">{description}</p>}
      {action}
    </div>
  )
}

export function ErrorState({ error, onRetry }) {
  return (
    <Alert tone="error" title="No se pudo cargar la información">
      <p>{error?.message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-1 font-semibold underline">
          Reintentar
        </button>
      )}
    </Alert>
  )
}
