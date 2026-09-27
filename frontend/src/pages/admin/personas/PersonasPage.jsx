import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Search, UserPlus } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { Pagination, Table } from '../../../components/ui/Table.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'

const columns = [
  { key: 'documento', header: 'Documento', render: (p) => `${p.tipoDocumento} ${p.numeroDocumento}`, className: 'font-mono whitespace-nowrap' },
  { key: 'nombre', header: 'Nombre', render: (p) => `${p.apellidos}, ${p.nombres}` },
  { key: 'correo', header: 'Correo', render: (p) => p.correo ?? '—' },
  { key: 'activo', header: 'Estado', render: (p) => (p.activo ? 'Activa' : <span className="text-muted">Inactiva</span>) },
]

// I-02: Personas certificadas — lista (HU-05).
export default function PersonasPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const page = Number(searchParams.get('page') ?? 1)

  const { data, error, loading, reload } = useApi(
    (signal) => api.get('/personas', { q: searchParams.get('q'), page }, { signal }),
    [searchParams.toString()],
  )

  return (
    <>
      <PageHeader
        title="Personas certificadas"
        description="Registre y actualice los datos de las personas capacitadas."
        actions={<Button to="/admin/personas/nueva" icon={UserPlus}>Registrar persona</Button>}
      />
      <Card bodyClassName="p-0">
        <form
          className="flex flex-col gap-2 border-b border-line p-4 sm:flex-row sm:items-end"
          onSubmit={(e) => {
            e.preventDefault()
            setSearchParams(q.trim() ? { q: q.trim() } : {})
          }}
        >
          <div className="flex-1">
            <Input label="Buscar por documento o nombre" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button type="submit" icon={Search}>Buscar</Button>
        </form>
        {loading && <Spinner />}
        {error && <div className="p-5"><ErrorState error={error} onRetry={reload} /></div>}
        {data && (
          <>
            <Table
              columns={columns}
              rows={data.items}
              onRowClick={(p) => navigate(`/admin/personas/${p.id}`)}
              empty={<EmptyState title="No se encontraron personas" />}
            />
            <Pagination
              meta={data.meta}
              onPage={(p) => {
                const next = new URLSearchParams(searchParams)
                next.set('page', String(p))
                setSearchParams(next)
              }}
            />
          </>
        )}
      </Card>
    </>
  )
}
