import { useNavigate, useParams } from 'react-router'
import { FilePlus2, Pencil } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { Table } from '../../../components/ui/Table.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { formatDate, fullName } from '../../../lib/format.js'

const columns = [
  { key: 'numeroCertificado', header: 'Número', className: 'font-mono whitespace-nowrap' },
  { key: 'curso', header: 'Curso', render: (c) => c.nivel ?? c.curso },
  { key: 'fechaExpedicion', header: 'Expedición', render: (c) => formatDate(c.fechaExpedicion) },
  { key: 'fechaVencimiento', header: 'Vencimiento', render: (c) => formatDate(c.fechaVencimiento) },
  { key: 'estado', header: 'Estado', render: (c) => <StatusBadge estado={c.estado} /> },
]

// I-04: Persona — detalle con sus certificados.
export default function PersonaDetallePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, error, loading, reload } = useApi((signal) => api.get(`/personas/${id}`, undefined, { signal }), [id])

  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { persona: p, certificados } = data
  return (
    <>
      <PageHeader
        title={fullName(p)}
        description={`${p.tipoDocumento} ${p.numeroDocumento}${p.activo ? '' : ' · Inactiva'}`}
        backTo="/admin/personas"
        backLabel="Personas certificadas"
        actions={
          <>
            <Button to={`/admin/personas/${p.id}/editar`} variant="secondary" icon={Pencil}>Editar</Button>
            {Boolean(p.activo) && (
              <Button to={`/admin/certificados/nuevo?personaId=${p.id}`} icon={FilePlus2}>Emitir certificado</Button>
            )}
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card title="Datos de contacto">
          <dl className="flex flex-col gap-4">
            <div>
              <dt className="text-sm text-muted">Correo</dt>
              <dd className="font-semibold">{p.correo ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Teléfono</dt>
              <dd className="font-semibold">{p.telefono ?? '—'}</dd>
            </div>
            <p className="text-xs text-muted">Estos datos son privados y no aparecen en la consulta pública.</p>
          </dl>
        </Card>
        <Card title="Certificados" bodyClassName="p-0">
          <Table
            columns={columns}
            rows={certificados}
            onRowClick={(c) => navigate(`/admin/certificados/${c.id}`)}
            empty={<EmptyState title="Esta persona aún no tiene certificados" />}
          />
        </Card>
      </div>
    </>
  )
}
