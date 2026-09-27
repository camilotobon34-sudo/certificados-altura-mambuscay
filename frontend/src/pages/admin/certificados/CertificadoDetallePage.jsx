import { useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Ban, CirclePause, CirclePlay, ExternalLink, Pencil } from 'lucide-react'
import { GuardarCertificadoButton } from '../../../components/certificados/GuardarCertificadoButton.jsx'
import { QRBlock } from '../../../components/certificados/QRBlock.jsx'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input, Textarea } from '../../../components/ui/Field.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { useAuth } from '../../../context/AuthContext.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { constanciaDesdeInterno } from '../../../lib/constancia.js'
import { ROLES } from '../../../lib/constants.js'
import { formatDate, formatDateTime, fullName } from '../../../lib/format.js'

function Info({ label, children, mono }) {
  return (
    <div>
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`font-semibold text-ink ${mono ? 'font-mono' : ''}`}>{children ?? '—'}</dd>
    </div>
  )
}

function StateActionModal({ action, certificado, onClose, onDone }) {
  const [observacion, setObservacion] = useState('')
  const [motivo, setMotivo] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const body =
        action === 'anular' ? { motivo, confirmacionNumero: confirmacion } : { observacion }
      const result = await api.post(`/certificados/${certificado.id}/${action}`, body)
      onDone(result)
    } catch (err) {
      setError(err)
    } finally {
      setSubmitting(false)
    }
  }

  const fieldErrors = error?.fieldErrors ?? {}

  if (action === 'suspender') {
    return (
      <Modal
        open
        title="Suspender certificado"
        onClose={onClose}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button icon={CirclePause} onClick={submit} loading={submitting} disabled={observacion.trim().length < 5}>
              Suspender
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-muted">
          La consulta pública mostrará el certificado como <strong>suspendido</strong>. La observación es interna y no se publica.
        </p>
        <Textarea label="Observación" required value={observacion} onChange={(e) => setObservacion(e.target.value)} error={fieldErrors.observacion} />
        {error && !fieldErrors.observacion && <Alert tone="error" title={error.message} className="mt-3" />}
      </Modal>
    )
  }

  if (action === 'reactivar') {
    return (
      <Modal
        open
        title="Reactivar certificado"
        onClose={onClose}
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button icon={CirclePlay} onClick={submit} loading={submitting}>Reactivar</Button>
          </>
        }
      >
        <Alert tone="info" title="El estado resultante depende de la fecha de vencimiento">
          Quedará <strong>vigente</strong> si aún no ha vencido ({formatDate(certificado.fechaVencimiento)}); de lo contrario quedará <strong>vencido</strong>.
        </Alert>
        <div className="mt-4">
          <Textarea label="Observación (opcional)" value={observacion} onChange={(e) => setObservacion(e.target.value)} />
        </div>
        {error && <Alert tone="error" title={error.message} className="mt-3" />}
      </Modal>
    )
  }

  // I-13: solo Administrador; motivo obligatorio y confirmación escribiendo el número.
  return (
    <Modal
      open
      tone="danger"
      title="Anular certificado"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button
            variant="danger"
            icon={Ban}
            onClick={submit}
            loading={submitting}
            disabled={motivo.trim().length < 10 || confirmacion.trim().toUpperCase() !== certificado.numeroCertificado}
          >
            Anular certificado
          </Button>
        </>
      }
    >
      <Alert tone="error" title="Esta acción es irreversible">
        El certificado quedará como <strong>anulado — no válido</strong> en la consulta pública. El registro se conserva para auditoría.
      </Alert>
      <div className="mt-4 flex flex-col gap-4">
        <Textarea
          label="Motivo de la anulación"
          required
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          hint="Mínimo 10 caracteres. No se muestra en la consulta pública."
          error={fieldErrors.motivo}
        />
        <Input
          label={`Escriba ${certificado.numeroCertificado} para confirmar`}
          required
          value={confirmacion}
          onChange={(e) => setConfirmacion(e.target.value)}
          className="font-mono"
          autoComplete="off"
          error={fieldErrors.confirmacionNumero}
        />
        {error && !fieldErrors.motivo && !fieldErrors.confirmacionNumero && <Alert tone="error" title={error.message} />}
      </div>
    </Modal>
  )
}

// I-10: Certificado — detalle (HU-11, HU-12, HU-13, HU-14).
export default function CertificadoDetallePage() {
  const { id } = useParams()
  const { hasRole } = useAuth()
  const location = useLocation()
  const [action, setAction] = useState(null)
  const [notice, setNotice] = useState(location.state?.aviso ?? '')
  const { data, error, loading, reload, setData } = useApi((signal) => api.get(`/certificados/${id}`, undefined, { signal }), [id])

  if (loading && !data) return <Spinner />
  if (error) return <ErrorState error={error} onRetry={reload} />

  const { certificado: c, historial, anulacion } = data
  const anulado = c.estado === 'ANULADO'
  const suspendido = c.estado === 'SUSPENDIDO'
  const isAdmin = hasRole(ROLES.ADMIN)

  const onDone = (result) => {
    setData(result)
    setNotice({ suspender: 'Certificado suspendido.', reactivar: 'Certificado reactivado.', anular: 'Certificado anulado.' }[action])
    setAction(null)
  }

  return (
    <>
      <PageHeader
        title={c.numeroCertificado}
        description={`${fullName(c)} · ${c.curso}`}
        backTo="/admin/certificados"
        backLabel="Certificados"
        actions={
          !anulado && (
            <div className="flex flex-wrap gap-2 print:hidden">
              {isAdmin && (
                <Button to={`/admin/certificados/${c.id}/editar`} variant="secondary" icon={Pencil}>Editar</Button>
              )}
              {suspendido ? (
                <Button variant="secondary" icon={CirclePlay} onClick={() => setAction('reactivar')}>Reactivar</Button>
              ) : (
                <Button variant="secondary" icon={CirclePause} onClick={() => setAction('suspender')}>Suspender</Button>
              )}
              {isAdmin && (
                <Button variant="danger" icon={Ban} onClick={() => setAction('anular')}>Anular</Button>
              )}
            </div>
          )
        }
      />

      {notice && <Alert tone="success" title={notice} className="mb-4" />}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          <Card title="Datos del certificado" actions={<StatusBadge estado={c.estado} size="lg" />}>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Info label="Persona certificada">
                <Link to={`/admin/personas/${c.personaId}`} className="text-primary hover:underline">{fullName(c)}</Link>
              </Info>
              <Info label="Documento" mono>{c.tipoDocumento} {c.numeroDocumento}</Info>
              <Info label="Curso">{c.curso}</Info>
              <Info label="Nivel de formación">{c.nivel}</Info>
              <Info label="Tipo de actividad">{c.tipoActividad}</Info>
              <Info label="Intensidad horaria">{c.intensidadHoraria} horas</Info>
              <Info label="Fecha de expedición">{formatDate(c.fechaExpedicion)}</Info>
              <Info label="Fecha de vencimiento">{formatDate(c.fechaVencimiento)}</Info>
              <Info label="Número de certificado" mono>{c.numeroCertificado}</Info>
              <Info label="Código de consulta" mono>{c.codigoVerificacion}</Info>
              <Info label="Emitido por">{c.emitidoPor}</Info>
            </dl>
            {suspendido && c.observacionSuspension && (
              <Alert tone="info" title="Observación de la suspensión (interna)" className="mt-5">
                {c.observacionSuspension}
              </Alert>
            )}
          </Card>

          {anulacion && (
            <Card title="Anulación" className="border-danger/40">
              <dl className="grid gap-5 sm:grid-cols-2">
                <Info label="Anulado por">{anulacion.anuladoPor}</Info>
                <Info label="Fecha">{formatDateTime(anulacion.anuladoEn)}</Info>
                <div className="sm:col-span-2">
                  <Info label="Motivo (visible solo internamente)">{anulacion.motivo}</Info>
                </div>
              </dl>
            </Card>
          )}

          <Card title="Historial de estados" bodyClassName="p-0">
            <ol className="divide-y divide-line">
              {historial.map((h) => (
                <li key={h.id} className="flex flex-wrap items-start justify-between gap-3 px-5 py-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      {h.estadoAnterior && <StatusBadge estado={h.estadoAnterior} />}
                      {h.estadoAnterior && <span className="text-muted" aria-hidden="true">→</span>}
                      <StatusBadge estado={h.estadoNuevo} />
                    </div>
                    {h.observacion && <p className="mt-1 text-sm text-muted">{h.observacion}</p>}
                  </div>
                  <p className="text-right text-sm text-muted">
                    {formatDateTime(h.cambiadoEn)}
                    <br />
                    {h.usuario}
                  </p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <Card title="Verificación pública">
          <QRBlock url={c.urlVerificacion} codigo={c.codigoVerificacion} numero={c.numeroCertificado} />
          <GuardarCertificadoButton constancia={constanciaDesdeInterno(c)} variant="primary" className="mt-4" />
          <a
            href={`/verificar/${c.codigoVerificacion}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 text-sm font-medium text-primary hover:underline print:hidden"
          >
            Ver como visitante
            <ExternalLink className="size-4" aria-hidden="true" />
          </a>
        </Card>
      </div>

      {action && <StateActionModal action={action} certificado={c} onClose={() => setAction(null)} onDone={onDone} />}
    </>
  )
}
