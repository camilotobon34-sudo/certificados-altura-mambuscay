import { useNavigate } from 'react-router'
import { BookPlus } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'

const columns = [
  { key: 'nombre', header: 'Curso' },
  { key: 'nivel', header: 'Nivel de formación', render: (c) => c.nivel ?? '—' },
  { key: 'tipoActividad', header: 'Tipo de actividad' },
  { key: 'intensidadHoraria', header: 'Intensidad', render: (c) => `${c.intensidadHoraria} h`, className: 'whitespace-nowrap' },
  { key: 'activo', header: 'Estado', render: (c) => (c.activo ? 'Activo' : <span className="text-muted">Inactivo</span>) },
]

// I-05: Cursos — lista (HU-08).
export default function CursosPage() {
  const navigate = useNavigate()
  const { data, error, loading, reload } = useApi((signal) => api.get('/cursos', undefined, { signal }))

  return (
    <>
      <PageHeader
        title="Cursos"
        description="Oferta de formación del centro, alineada a los niveles de la Resolución 4272 de 2021."
        actions={<Button to="/admin/cursos/nuevo" icon={BookPlus}>Nuevo curso</Button>}
      />
      <Card bodyClassName="p-0">
        {loading && <Spinner />}
        {error && <div className="p-5"><ErrorState error={error} onRetry={reload} /></div>}
        {data && (
          <Table
            columns={columns}
            rows={data.items}
            onRowClick={(c) => navigate(`/admin/cursos/${c.id}/editar`)}
            empty={<EmptyState title="No hay cursos registrados" />}
          />
        )}
      </Card>
    </>
  )
}
