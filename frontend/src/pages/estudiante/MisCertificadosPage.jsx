import { Link } from 'react-router'
import { ChevronRight, GraduationCap } from 'lucide-react'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { formatDate, tituloFormacion } from '../../lib/format.js'

// E-01: Mis certificados (HU-06).
export default function MisCertificadosPage() {
  const { data, error, loading, reload } = useApi((signal) => api.get('/estudiante/certificados', undefined, { signal }))

  return (
    <>
      <h1 className="mb-5 text-3xl text-primary">Mis certificados</h1>
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {data?.items.length === 0 && <EmptyState icon={GraduationCap} title="Aún no tiene certificados registrados" />}
      <ul className="flex flex-col gap-3">
        {data?.items.map((c) => (
          <li key={c.id}>
            <Link
              to={`/mis-certificados/${c.id}`}
              className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 shadow-[var(--shadow-elevation-1)] transition-shadow hover:shadow-[var(--shadow-elevation-2)]"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <StatusBadge estado={c.estado} />
                  <span className="font-mono text-xs text-muted">{c.numeroCertificado}</span>
                </div>
                <p className="font-semibold text-ink">{tituloFormacion(c)}</p>
                <p className="truncate text-sm text-muted">{c.curso}</p>
                <p className="mt-1 text-sm">
                  Vence: <span className="font-semibold">{formatDate(c.fechaVencimiento)}</span>
                </p>
              </div>
              <ChevronRight className="size-5 shrink-0 text-muted" aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
