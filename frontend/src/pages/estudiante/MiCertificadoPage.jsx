import { useParams } from 'react-router'
import { GuardarCertificadoButton } from '../../components/certificados/GuardarCertificadoButton.jsx'
import { QRBlock } from '../../components/certificados/QRBlock.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../components/ui/Feedback.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../components/ui/StatusBadge.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { constanciaDesdeInterno } from '../../lib/constancia.js'
import { formatDate, fullName } from '../../lib/format.js'

// E-02: Detalle de mi certificado con QR y descarga (HU-06).
export default function MiCertificadoPage() {
  const { id } = useParams()
  const { data, error, loading, reload } = useApi((signal) => api.get(`/estudiante/certificados/${id}`, undefined, { signal }), [id])

  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const c = data.certificado
  const rows = [
    ['Persona', fullName(c)],
    ['Documento', `${c.tipoDocumento} ${c.numeroDocumento}`],
    ['Curso', c.curso],
    ['Nivel de formación', c.nivel ?? c.tipoActividad],
    ['Intensidad horaria', `${c.intensidadHoraria} horas`],
    ['Fecha de expedición', formatDate(c.fechaExpedicion)],
    ['Fecha de vencimiento', formatDate(c.fechaVencimiento)],
    ['Centro de formación', c.centroFormacion],
  ]

  return (
    <>
      <PageHeader title={c.numeroCertificado} backTo="/mis-certificados" backLabel="Mis certificados" />
      <div className="flex flex-col gap-4">
        <Card title="Código QR de verificación" actions={<StatusBadge estado={c.estado} />}>
          <QRBlock url={c.urlVerificacion} codigo={c.codigoVerificacion} numero={c.numeroCertificado} />
          <p className="mt-4 text-center text-sm text-muted">
            Presente este código a su empleador o inspector para verificar el certificado.
          </p>
          <GuardarCertificadoButton constancia={constanciaDesdeInterno(c)} className="mx-auto mt-4 max-w-sm" />
        </Card>
        <Card title="Datos del certificado">
          <dl className="divide-y divide-line">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </>
  )
}
