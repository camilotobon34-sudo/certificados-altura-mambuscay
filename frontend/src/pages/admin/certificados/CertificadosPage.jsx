import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { FilePlus2, Search } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input, Select } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { Pagination, Table } from '../../../components/ui/Table.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { ESTADO_KEYS, ESTADOS } from '../../../lib/constants.js'
import { formatDate, tituloFormacion } from '../../../lib/format.js'

const FILTER_KEYS = ['q', 'estado', 'cursoId', 'desde', 'hasta']

const columns = [
  { key: 'numeroCertificado', header: 'Número', className: 'font-mono whitespace-nowrap' },
  { key: 'codigoVerificacion', header: 'Código', className: 'font-mono whitespace-nowrap text-sm' },
  { key: 'persona', header: 'Persona' },
  { key: 'documento', header: 'Documento', render: (r) => `${r.tipoDocumento} ${r.numeroDocumento}`, className: 'whitespace-nowrap' },
  { key: 'curso', header: 'Curso', render: (r) => (
      <>
        <span className="block">{tituloFormacion(r)}</span>
        <span className="text-xs text-muted">{r.curso}</span>
      </>
    ) },
  { key: 'fechaExpedicion', header: 'Expedición', render: (r) => formatDate(r.fechaExpedicion), className: 'whitespace-nowrap' },
  { key: 'fechaVencimiento', header: 'Vencimiento', render: (r) => formatDate(r.fechaVencimiento), className: 'whitespace-nowrap' },
  { key: 'estado', header: 'Estado', render: (r) => <StatusBadge estado={r.estado} /> },
]

// I-08: Certificados — lista (HU-10).
export default function CertificadosPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [draft, setDraft] = useState(() => Object.fromEntries(FILTER_KEYS.map((k) => [k, searchParams.get(k) ?? ''])))
  const page = Number(searchParams.get('page') ?? 1)
  const queryKey = searchParams.toString()

  const { data, error, loading, reload } = useApi(
    (signal) => api.get('/certificados', Object.fromEntries(searchParams), { signal }),
    [queryKey],
  )
  const cursos = useApi((signal) => api.get('/cursos', undefined, { signal }))

  const applyFilters = (event) => {
    event.preventDefault()
    setSearchParams(Object.fromEntries(Object.entries(draft).filter(([, v]) => v)))
  }

  const clearFilters = () => {
    setDraft(Object.fromEntries(FILTER_KEYS.map((k) => [k, ''])))
    setSearchParams({})
  }

  const goToPage = (p) => {
    const next = new URLSearchParams(searchParams)
    next.set('page', String(p))
    setSearchParams(next)
  }

  const set = (key) => (e) => setDraft({ ...draft, [key]: e.target.value })

  return (
    <>
      <PageHeader
        title="Certificados"
        description="Consulte, filtre y gestione los certificados emitidos."
        actions={
          <Button to="/admin/certificados/nuevo" icon={FilePlus2}>
            Emitir certificado
          </Button>
        }
      />

      <Card className="mb-6">
        <form onSubmit={applyFilters} className="grid gap-4 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1.5fr_1fr_1fr_auto]">
          <Input label="Buscar" placeholder="Documento, nombre, número o código" value={draft.q} onChange={set('q')} />
          <Select
            label="Estado"
            placeholder="Todos"
            value={draft.estado}
            onChange={set('estado')}
            options={ESTADO_KEYS.map((k) => ({ value: k, label: ESTADOS[k].label }))}
          />
          <Select
            label="Curso"
            placeholder="Todos"
            value={draft.cursoId}
            onChange={set('cursoId')}
            options={(cursos.data?.items ?? []).map((c) => ({ value: String(c.id), label: c.nombre }))}
          />
          <Input label="Expedido desde" type="date" value={draft.desde} onChange={set('desde')} />
          <Input label="Expedido hasta" type="date" value={draft.hasta} onChange={set('hasta')} />
          <div className="flex items-end gap-2">
            <Button type="submit" icon={Search}>
              Filtrar
            </Button>
            <Button variant="ghost" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </form>
      </Card>

      <Card bodyClassName="p-0">
        {loading && <Spinner />}
        {error && <div className="p-5"><ErrorState error={error} onRetry={reload} /></div>}
        {data && (
          <>
            <Table
              columns={columns}
              rows={data.items}
              onRowClick={(row) => navigate(`/admin/certificados/${row.id}`)}
              empty={<EmptyState title="No se encontraron certificados" description="Ajuste los filtros o emita un nuevo certificado." />}
            />
            <Pagination meta={{ ...data.meta, page }} onPage={goToPage} />
          </>
        )}
      </Card>
    </>
  )
}
