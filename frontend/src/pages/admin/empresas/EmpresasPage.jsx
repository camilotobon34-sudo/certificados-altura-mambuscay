import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Building2, Search } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { Pagination, Table } from '../../../components/ui/Table.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'

const columns = [
  { key: 'empresa', header: 'Empresa' },
  { key: 'nitEmpresa', header: 'NIT', render: (e) => e.nitEmpresa || '—', className: 'font-mono whitespace-nowrap' },
  { key: 'representanteLegal', header: 'Representante legal', render: (e) => e.representanteLegal || '—' },
  { key: 'arl', header: 'ARL', render: (e) => e.arl || '—' },
]

export default function EmpresasPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') ?? '')
  const page = Number(searchParams.get('page') ?? 1)

  const { data, error, loading, reload } = useApi(
    (signal) => api.get('/empresas', { q: searchParams.get('q'), page }, { signal }),
    [searchParams.toString()],
  )

  return (
    <>
      <PageHeader
        title="Empresas empleadoras"
        description="Guarde las empresas fijas (nombre, NIT, representante y ARL) para que al emitir un certificado esos datos salgan solos, sin tener que crear un certificado de prueba."
        actions={<Button to="/admin/empresas/nueva" icon={Building2}>Registrar empresa</Button>}
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
            <Input label="Buscar por empresa o NIT" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <Button type="submit" icon={Search}>Buscar</Button>
        </form>
        {loading && <Spinner />}
        {error && (
          <div className="p-5">
            <ErrorState error={error} onRetry={reload} />
          </div>
        )}
        {data && (
          <>
            <Table
              columns={columns}
              rows={data.items}
              onRowClick={(e) => navigate(`/admin/empresas/${e.id}/editar`)}
              empty={<EmptyState title="Aún no hay empresas guardadas" />}
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
