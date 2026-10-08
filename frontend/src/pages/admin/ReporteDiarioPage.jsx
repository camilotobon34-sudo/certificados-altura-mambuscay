import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Ban, CirclePause, CirclePlay, FilePen, FilePlus2, FileSpreadsheet, RefreshCw, UserPlus } from 'lucide-react'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../components/ui/Feedback.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { ESTADOS } from '../../lib/constants.js'
import { formatDate, todayIso } from '../../lib/format.js'

const TARJETAS = [
  { accion: 'Emisión', label: 'Emitidos', icon: FilePlus2, tono: 'bg-success-soft text-success' },
  { accion: 'Edición', label: 'Editados', icon: FilePen, tono: 'bg-info-soft text-info' },
  { accion: 'Suspensión', label: 'Suspendidos', icon: CirclePause, tono: 'bg-warning-soft text-warning' },
  { accion: 'Reactivación', label: 'Reactivados', icon: CirclePlay, tono: 'bg-success-soft text-success' },
  { accion: 'Anulación', label: 'Anulados', icon: Ban, tono: 'bg-danger-soft text-danger' },
]

const estadoLabel = (estado) => ESTADOS[estado]?.label ?? '—'

const columnas = [
  { key: 'hora', header: 'Hora', className: 'font-mono whitespace-nowrap' },
  { key: 'accion', header: 'Acción', className: 'font-semibold whitespace-nowrap' },
  { key: 'numeroCertificado', header: 'Certificado', className: 'font-mono whitespace-nowrap' },
  { key: 'persona', header: 'Persona', render: (r) => (
      <>
        <span className="block">{r.persona}</span>
        <span className="text-xs text-muted">{r.tipoDocumento} {r.numeroDocumento}</span>
      </>
    ) },
  { key: 'estado', header: 'Estado', render: (r) => (
      <span className="whitespace-nowrap">
        {r.estadoAnterior ? `${estadoLabel(r.estadoAnterior)} → ` : ''}{estadoLabel(r.estadoNuevo)}
      </span>
    ) },
  { key: 'usuario', header: 'Realizado por' },
  { key: 'observacion', header: 'Observación', className: 'text-sm text-muted' },
]

// Reporte diario: actividad del día y descarga en Excel (solo Administrador).
export default function ReporteDiarioPage() {
  const navigate = useNavigate()
  const hoy = todayIso()
  const [fecha, setFecha] = useState(hoy)
  const [descargando, setDescargando] = useState(false)
  const [errorDescarga, setErrorDescarga] = useState('')

  const { data, error, loading, reload } = useApi(
    (signal) => api.get('/reportes/diario', { fecha }, { signal }),
    [fecha],
  )

  const descargar = async () => {
    setErrorDescarga('')
    setDescargando(true)
    try {
      await api.download('/reportes/diario/excel', { fecha }, `Reporte-diario-${fecha}.xlsx`)
    } catch (err) {
      setErrorDescarga(err.message)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Reporte diario"
        description="Todo lo que se hizo en el día: certificados emitidos, editados, suspendidos, reactivados y anulados, y personas registradas."
        actions={
          <Button icon={FileSpreadsheet} onClick={descargar} loading={descargando} disabled={!data}>
            Descargar Excel
          </Button>
        }
      />

      <Card className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <Input
            label="Fecha del reporte"
            type="date"
            max={hoy}
            value={fecha}
            onChange={(e) => e.target.value && setFecha(e.target.value)}
          />
          {fecha !== hoy && (
            <Button variant="ghost" onClick={() => setFecha(hoy)}>
              Volver a hoy
            </Button>
          )}
          <Button variant="ghost" icon={RefreshCw} onClick={reload}>
            Actualizar
          </Button>
        </div>
      </Card>

      {errorDescarga && <Alert tone="error" title={errorDescarga} className="mb-6" />}
      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && !loading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {TARJETAS.map(({ accion, label, icon: Icon, tono }) => (
              <div
                key={accion}
                className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 shadow-[var(--shadow-elevation-1)]"
              >
                <span className={`inline-flex size-11 shrink-0 items-center justify-center rounded-full ${tono}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span>
                  <span className="block font-display text-3xl font-semibold text-ink">{data.resumen[accion]}</span>
                  <span className="text-sm text-muted">{label}</span>
                </span>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 shadow-[var(--shadow-elevation-1)]">
              <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserPlus className="size-5" aria-hidden="true" />
              </span>
              <span>
                <span className="block font-display text-3xl font-semibold text-ink">{data.personasRegistradas}</span>
                <span className="text-sm text-muted">Personas registradas</span>
              </span>
            </div>
          </div>

          <Card title={`Actividad del ${formatDate(data.fecha)}`} bodyClassName="p-0">
            <Table
              columns={columnas}
              rows={data.actividad}
              onRowClick={(row) => navigate(`/admin/certificados/${row.certificadoId}`)}
              minWidth="min-w-[900px]"
              empty={<EmptyState title="Sin actividad" description="No hubo acciones sobre certificados en esta fecha." />}
            />
          </Card>
        </div>
      )}
    </>
  )
}
