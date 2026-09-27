import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router'

export function PageHeader({ title, description, backTo, backLabel = 'Volver', actions }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {backTo && (
          <Link to={backTo} className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            <ArrowLeft className="size-4" aria-hidden="true" />
            {backLabel}
          </Link>
        )}
        <h1 className="text-3xl text-ink">{title}</h1>
        {description && <p className="mt-1 text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  )
}
