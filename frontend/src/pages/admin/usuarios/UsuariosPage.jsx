import { useNavigate } from 'react-router'
import { UserPlus } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'

const columns = [
  { key: 'nombre', header: 'Nombre', render: (u) => `${u.nombres} ${u.apellidos}` },
  { key: 'correo', header: 'Correo' },
  { key: 'rolNombre', header: 'Rol', render: (u) => (
      <>
        {u.rolNombre}
        {u.persona && <span className="block text-xs text-muted">{u.persona}</span>}
      </>
    ) },
  { key: 'activo', header: 'Estado', render: (u) => (u.activo ? 'Activo' : <span className="text-muted">Inactivo</span>) },
]

// I-14: Usuarios internos — lista (HU-02).
export default function UsuariosPage() {
  const navigate = useNavigate()
  const { data, error, loading, reload } = useApi((signal) => api.get('/usuarios', undefined, { signal }))
  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Cuentas del personal del centro y de las personas certificadas."
        actions={<Button to="/admin/usuarios/nuevo" icon={UserPlus}>Nuevo usuario</Button>}
      />
      <Card bodyClassName="p-0">
        {loading && <Spinner />}
        {error && <div className="p-5"><ErrorState error={error} onRetry={reload} /></div>}
        {data && (
          <Table
            columns={columns}
            rows={data.items}
            onRowClick={(u) => navigate(`/admin/usuarios/${u.id}/editar`)}
            empty={<EmptyState title="No hay usuarios" />}
          />
        )}
      </Card>
    </>
  )
}
