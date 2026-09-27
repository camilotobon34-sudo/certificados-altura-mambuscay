import { useState } from 'react'
import { useNavigate } from 'react-router'
import { FilePlus2, Search, UserPlus } from 'lucide-react'
import { LogoSymbol } from '../../components/brand/Logo.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { NOMBRE_SISTEMA } from '../../lib/brand.js'
import { ESTADO_KEYS, ESTADOS } from '../../lib/constants.js'
import { formatDate, tituloFormacion } from '../../lib/format.js'

const columns = [
  { key: 'numeroCertificado', header: 'Número', className: 'font-mono whitespace-nowrap' },
  { key: 'persona', header: 'Persona', render: (r) => (
      <>
        <span className="block">{r.persona}</span>
        <span className="text-xs text-muted">{tituloFormacion(r)}</span>
      </>
    ) },
  { key: 'fechaVencimiento', header: 'Vence', render: (r) => formatDate(r.fechaVencimiento), className: 'whitespace-nowrap' },
  { key: 'estado', header: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
]

const fechaLarga = new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeZone: 'America/Bogota' })

// I-01: Panel principal.
export default function DashboardPage() {
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [q, setQ] = useState('')
  const { data, error, loading, reload } = useApi((signal) => api.get('/certificados/resumen', undefined, { signal }))
  const openRow = (row) => navigate(`/admin/certificados/${row.id}`)
  const total = data ? ESTADO_KEYS.reduce((sum, key) => sum + data.totales[key], 0) : 0

  const buscar = (event) => {
    event.preventDefault()
    const term = q.trim()
    navigate(term ? `/admin/certificados?q=${encodeURIComponent(term)}` : '/admin/certificados')
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-[var(--radius-card)] bg-primary text-white shadow-[var(--shadow-elevation-2)]">
        <div className="absolute inset-y-0 right-0 w-1/3 bg-linear-to-l from-primary-dark to-transparent" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <LogoSymbol className="hidden h-20 sm:block" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{NOMBRE_SISTEMA}</p>
              <h1 className="mt-1 text-3xl text-white sm:text-4xl">Hola, {usuario.nombres}</h1>
              <p className="mt-1 text-sm text-white/75 first-letter:uppercase">{fechaLarga.format(new Date())}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button to="/admin/certificados/nuevo" variant="accent" size="lg" icon={FilePlus2}>
              Crear certificado
            </Button>
            <Button
              to="/admin/personas/nueva"
              variant="secondary"
              size="lg"
              icon={UserPlus}
              className="border-white/60 text-white hover:bg-white/10"
            >
              Registrar persona
            </Button>
          </div>
        </div>
        <form onSubmit={buscar} className="relative border-t border-white/10 bg-primary-dark/60 p-4 sm:px-7" role="search">
          <label htmlFor="buscar-dashboard" className="sr-only">
            Buscar certificado
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted" aria-hidden="true" />
              <input
                id="buscar-dashboard"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por documento, nombre, número o código de consulta"
                className="h-12 w-full rounded-[var(--radius-control)] border-0 bg-white pr-3 pl-10 text-ink placeholder:text-muted/80 focus:ring-2 focus:ring-accent focus:outline-none"
              />
            </div>
            <Button type="submit" variant="accent" size="lg">
              Buscar
            </Button>
          </div>
        </form>
      </section>

      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <button
              type="button"
              onClick={() => navigate('/admin/certificados')}
              className="col-span-2 flex flex-col justify-center rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 text-left shadow-[var(--shadow-elevation-1)] transition-shadow hover:shadow-[var(--shadow-elevation-2)] lg:col-span-1"
            >
              <span className="font-display text-4xl font-semibold text-primary">{total}</span>
              <span className="text-sm text-muted">Certificados registrados</span>
            </button>
            {ESTADO_KEYS.map((key) => {
              const { label, icon: Icon, text, soft } = ESTADOS[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => navigate(`/admin/certificados?estado=${key}`)}
                  className="flex items-center gap-4 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 text-left shadow-[var(--shadow-elevation-1)] transition-shadow hover:shadow-[var(--shadow-elevation-2)]"
                >
                  <span className={`inline-flex size-12 shrink-0 items-center justify-center rounded-full ${soft} ${text}`}>
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="block font-display text-3xl font-semibold text-ink">{data.totales[key]}</span>
                    <span className="text-sm text-muted">{label}s</span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="grid gap-6 2xl:grid-cols-2">
            <Card title="Próximos a vencer (30 días)" bodyClassName="p-0">
              <Table
                columns={columns}
                rows={data.proximosAVencer}
                onRowClick={openRow}
                minWidth="min-w-[520px]"
                empty={<EmptyState title="No hay certificados próximos a vencer" />}
              />
            </Card>
            <Card
              title="Últimas emisiones"
              bodyClassName="p-0"
              actions={
                <Button to="/admin/certificados" variant="ghost" size="sm">
                  Ver todos
                </Button>
              }
            >
              <Table
                columns={columns}
                rows={data.ultimasEmisiones}
                onRowClick={openRow}
                minWidth="min-w-[520px]"
                empty={<EmptyState title="Aún no se han emitido certificados" />}
              />
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
