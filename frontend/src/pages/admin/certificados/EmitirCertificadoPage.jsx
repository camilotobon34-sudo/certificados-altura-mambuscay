import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, CircleCheck, Eye, FilePlus2, Search, TriangleAlert, UserPlus } from 'lucide-react'
import { QRBlock } from '../../../components/certificados/QRBlock.jsx'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input } from '../../../components/ui/Field.jsx'
import { Modal } from '../../../components/ui/Modal.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { Stepper } from '../../../components/ui/Stepper.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { addMonthsIso, formatDate, formatLongDate, fullName, tituloFormacion, todayIso } from '../../../lib/format.js'
import { verificationUrl } from '../../../lib/verification.js'

const STEPS = ['Persona', 'Curso y nivel', 'Fechas e intensidad', 'Revisión']
const FECHAS_INICIALES = () => ({ fechaExpedicion: todayIso(), fechaVencimiento: '', intensidadHoraria: '', numeroCertificado: '' })
const REENTRENAMIENTO_MIN = 8

const minimoHoras = (curso) =>
  curso?.tipoActividadCodigo === 'REENTRENAMIENTO' ? REENTRENAMIENTO_MIN : (curso?.nivelIntensidadMinima ?? 1)

function CertificadosVigentes({ vigentes }) {
  if (!vigentes.length) return null
  return (
    <Alert
      tone="warning"
      title={
        vigentes.length === 1
          ? 'Esta persona ya tiene un certificado vigente'
          : `Esta persona ya tiene ${vigentes.length} certificados vigentes`
      }
    >
      <ul className="mt-1 flex flex-col gap-1 text-sm text-ink">
        {vigentes.map((c) => (
          <li key={c.id}>
            <Link to={`/admin/certificados/${c.id}`} target="_blank" className="font-semibold underline-offset-2 hover:underline">
              {c.curso}
            </Link>{' '}
            · <span className="font-mono">{c.numeroCertificado}</span> · expedido el {formatDate(c.fechaExpedicion)}, vence el{' '}
            {formatDate(c.fechaVencimiento)}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-sm">Verifique que no se trate de la misma capacitación antes de emitir otro.</p>
    </Alert>
  )
}

function AlertaDuplicado({ persona, certificado, onCancelar, onContinuar, onCerrar }) {
  return (
    <Modal
      open
      title="Esta persona ya tiene este certificado"
      onClose={onCerrar}
      footer={
        <>
          <Button variant="ghost" onClick={onCancelar}>
            Cancelar certificado
          </Button>
          <Button icon={FilePlus2} onClick={onContinuar}>
            Sacar de todos modos
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        <TriangleAlert className="mt-0.5 size-6 shrink-0 text-warning" aria-hidden="true" />
        <div className="flex flex-col gap-2 text-ink">
          <p>
            <strong>{fullName(persona)}</strong> sacó un certificado de <strong>{certificado.curso}</strong> el{' '}
            <strong>{formatLongDate(certificado.fechaExpedicion)}</strong>.
          </p>
          <p className="text-sm text-muted">
            Número{' '}
            <Link to={`/admin/certificados/${certificado.id}`} target="_blank" className="font-mono font-semibold text-ink hover:underline">
              {certificado.numeroCertificado}
            </Link>{' '}
            · vigente hasta el {formatLongDate(certificado.fechaVencimiento)}.
          </p>
          <p className="text-sm">¿Desea sacar un nuevo certificado de todos modos?</p>
        </div>
      </div>
    </Modal>
  )
}

function StepPersona({ persona, onSelect, vigentes }) {
  const [q, setQ] = useState('')
  const [term, setTerm] = useState('')
  const { data, loading, error } = useApi(
    (signal) => (term ? api.get('/personas', { q: term, size: 8 }, { signal }) : Promise.resolve(null)),
    [term],
  )

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-col gap-2 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault()
          setTerm(q.trim())
        }}
      >
        <div className="flex-1">
          <Input label="Buscar persona por documento o nombre" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej. 1087654321" />
        </div>
        <Button type="submit" icon={Search}>
          Buscar
        </Button>
        <Button to="/admin/personas/nueva?retorno=emitir" variant="secondary" icon={UserPlus}>
          Registrar nueva
        </Button>
      </form>

      {persona && (
        <Alert tone="success" title="Persona seleccionada">
          {fullName(persona)} · {persona.tipoDocumento} {persona.numeroDocumento}
        </Alert>
      )}
      <CertificadosVigentes vigentes={vigentes} />

      {loading && term && <Spinner />}
      {error && <ErrorState error={error} />}
      {data && data.items.length === 0 && (
        <EmptyState title="No se encontraron personas" description="Verifique el documento o registre una nueva persona." />
      )}
      {data?.items.length > 0 && (
        <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
          {data.items.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => onSelect(p)}
                disabled={!p.activo}
                className={`flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-left hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 ${persona?.id === p.id ? 'bg-primary/5' : ''}`}
              >
                <span>
                  <span className="block font-semibold">{fullName(p)}</span>
                  <span className="font-mono text-sm text-muted">
                    {p.tipoDocumento} {p.numeroDocumento}
                  </span>
                </span>
                {persona?.id === p.id ? (
                  <CircleCheck className="size-5 text-success" aria-label="Seleccionada" />
                ) : (
                  !p.activo && <span className="text-xs text-muted">Inactiva</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function StepCurso({ cursoId, onSelect, vigentes }) {
  const { data, loading, error } = useApi((signal) => api.get('/cursos', { activos: 1 }, { signal }))
  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} />
  return (
    <fieldset className="grid gap-3 md:grid-cols-2">
      <legend className="sr-only">Seleccione el curso</legend>
      {data.items.map((c) => {
        const vigente = vigentes.find((v) => Number(v.cursoId) === Number(c.id))
        return (
          <label
            key={c.id}
            className={`flex cursor-pointer gap-3 rounded-[var(--radius-card)] border p-4 transition-colors ${
              cursoId === c.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-line hover:border-primary/50'
            }`}
          >
            <input type="radio" name="curso" className="mt-1 accent-primary" checked={cursoId === c.id} onChange={() => onSelect(c)} />
            <span>
              <span className="block font-semibold text-ink">{c.nombre}</span>
              {c.nivel && <span className="block text-sm text-muted">{tituloFormacion(c)}</span>}
              <span className="mt-2 inline-flex flex-wrap gap-2 text-xs">
                <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-warning">{c.intensidadHoraria} horas</span>
                {c.prefijoCodigo && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono font-medium text-primary">{c.prefijoCodigo}</span>
                )}
                {vigente && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 font-semibold text-warning">
                    <TriangleAlert className="size-3" aria-hidden="true" />
                    Ya tiene uno vigente hasta {formatDate(vigente.fechaVencimiento)}
                  </span>
                )}
              </span>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

function StepFechas({ values, curso, onChange, errors }) {
  const setVenc = (months) => onChange({ ...values, fechaVencimiento: addMonthsIso(values.fechaExpedicion || todayIso(), months) })
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Input
        label="Fecha de expedición"
        type="date"
        required
        value={values.fechaExpedicion}
        onChange={(e) => onChange({ ...values, fechaExpedicion: e.target.value })}
        error={errors.fechaExpedicion}
      />
      <div className="flex flex-col gap-2">
        <Input
          label="Fecha de vencimiento"
          type="date"
          required
          min={values.fechaExpedicion}
          value={values.fechaVencimiento}
          onChange={(e) => onChange({ ...values, fechaVencimiento: e.target.value })}
          error={errors.fechaVencimiento}
          hint="Definida por la política del centro de formación."
        />
        <div className="flex flex-wrap gap-1">
          {[12, 18, 24].map((m) => (
            <button key={m} type="button" onClick={() => setVenc(m)} className="min-h-9 rounded-full border border-line px-3 text-xs font-medium text-primary hover:bg-primary/5">
              +{m} meses
            </button>
          ))}
        </div>
      </div>
      <Input
        label="Intensidad horaria"
        type="number"
        required
        min={minimoHoras(curso)}
        value={values.intensidadHoraria}
        onChange={(e) => onChange({ ...values, intensidadHoraria: e.target.value })}
        error={errors.intensidadHoraria}
        hint={`Mínimo ${minimoHoras(curso)} horas (Res. 4272 de 2021).`}
      />
      <div className="md:col-span-3">
        <Input
          label="Número de certificado (opcional)"
          value={values.numeroCertificado}
          onChange={(e) => onChange({ ...values, numeroCertificado: e.target.value })}
          error={errors.numeroCertificado}
          placeholder="Déjelo vacío para asignarlo automáticamente"
          hint={
            curso?.proximoCodigo
              ? `Si lo deja vacío se asigna el siguiente código del curso (${curso.proximoCodigo}).`
              : 'Si lo deja vacío se asigna automáticamente.'
          }
          className="font-mono uppercase"
        />
      </div>
    </div>
  )
}

function Resumen({ persona, curso, fechas }) {
  const rows = [
    ['Persona certificada', fullName(persona)],
    ['Documento', `${persona.tipoDocumento} ${persona.numeroDocumento}`],
    ['Curso', curso.nombre],
    ['Nivel de formación', curso.nivel ?? '—'],
    ['Tipo de actividad', curso.tipoActividad],
    ['Intensidad horaria', `${fechas.intensidadHoraria} horas`],
    ['Fecha de expedición', formatDate(fechas.fechaExpedicion)],
    ['Fecha de vencimiento', formatDate(fechas.fechaVencimiento)],
    [
      'Número de certificado',
      fechas.numeroCertificado.trim().toUpperCase() ||
        (curso.proximoCodigo ? `${curso.proximoCodigo} (automático)` : 'Automático'),
    ],
    ['Código de verificación', 'Automático y único (p. ej. 7K4P-X9QM-2RTD)'],
  ]
  return (
    <dl className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
      {rows.map(([label, value]) => (
        <div key={label} className="flex flex-col gap-0.5 px-4 py-3 sm:flex-row sm:justify-between">
          <dt className="text-sm text-muted">{label}</dt>
          <dd className="font-semibold">{value}</dd>
        </div>
      ))}
    </dl>
  )
}

// I-09: Emitir certificado (HU-09).
export default function EmitirCertificadoPage() {
  const [searchParams] = useSearchParams()
  const preselectedId = searchParams.get('personaId')
  const [step, setStep] = useState(0)
  const [persona, setPersona] = useState(null)
  const [curso, setCurso] = useState(null)
  const [fechas, setFechas] = useState(FECHAS_INICIALES)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [emitido, setEmitido] = useState(null)
  const [confirmaDuplicado, setConfirmaDuplicado] = useState(false)
  const [alertaDuplicado, setAlertaDuplicado] = useState(false)

  const reset = () => {
    setAlertaDuplicado(false)
    setStep(0)
    setPersona(null)
    setCurso(null)
    setFechas(FECHAS_INICIALES())
    setErrors({})
    setSubmitError('')
    setEmitido(null)
    setConfirmaDuplicado(false)
  }

  useApi(async (signal) => {
    if (!preselectedId) return null
    const { persona: p } = await api.get(`/personas/${preselectedId}`, undefined, { signal })
    setPersona(p)
    return p
  }, [preselectedId])

  const historial = useApi(
    (signal) => (persona ? api.get(`/personas/${persona.id}`, undefined, { signal }) : Promise.resolve(null)),
    [persona?.id],
  )
  const vigentes = (historial.data?.certificados ?? []).filter((c) => c.estado === 'VIGENTE')
  const vigenteDe = (c) => (c ? vigentes.find((v) => Number(v.cursoId) === Number(c.id)) : null)
  const duplicado = vigenteDe(curso)

  const selectPersona = (p) => {
    setPersona(p)
    setConfirmaDuplicado(false)
  }

  const selectCurso = (c) => {
    setCurso(c)
    setConfirmaDuplicado(false)
    setAlertaDuplicado(Boolean(vigenteDe(c)))
    setFechas((f) => ({ ...f, intensidadHoraria: String(c.intensidadHoraria) }))
  }

  const sacarDeTodosModos = () => {
    setConfirmaDuplicado(true)
    setAlertaDuplicado(false)
  }

  // Cerrar la alerta sin decidir deja el curso sin seleccionar.
  const cerrarAlerta = () => {
    setAlertaDuplicado(false)
    setCurso(null)
  }

  const validateFechas = () => {
    const next = {}
    if (!fechas.fechaExpedicion) next.fechaExpedicion = 'Seleccione la fecha de expedición'
    if (!fechas.fechaVencimiento) next.fechaVencimiento = 'Seleccione la fecha de vencimiento'
    else if (fechas.fechaVencimiento < fechas.fechaExpedicion) next.fechaVencimiento = 'Debe ser posterior a la expedición'
    if (Number(fechas.intensidadHoraria) < minimoHoras(curso)) next.intensidadHoraria = `Mínimo ${minimoHoras(curso)} horas`
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const canContinue = [Boolean(persona), Boolean(curso), true, true][step]

  const next = () => {
    if (step === 1 && duplicado && !confirmaDuplicado) {
      setAlertaDuplicado(true)
      return
    }
    if (step === 2 && !validateFechas()) return
    setStep((s) => Math.min(s + 1, STEPS.length - 1))
  }

  const emitir = async () => {
    setSubmitting(true)
    setSubmitError('')
    try {
      const result = await api.post('/certificados', {
        personaId: persona.id,
        cursoId: curso.id,
        fechaExpedicion: fechas.fechaExpedicion,
        fechaVencimiento: fechas.fechaVencimiento,
        intensidadHoraria: Number(fechas.intensidadHoraria),
        numeroCertificado: fechas.numeroCertificado.trim() || undefined,
        confirmarDuplicado: confirmaDuplicado,
      })
      setEmitido(result.certificado)
    } catch (err) {
      setSubmitError(err.fieldErrors?.numeroCertificado ?? err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (emitido) {
    return (
      <>
        <PageHeader title="Certificado emitido" backTo="/admin/certificados" backLabel="Certificados" />
        <Card>
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <Alert tone="success" title="El certificado se emitió correctamente" className="mb-4" />
              <p className="text-sm text-muted">Código de verificación (entregar al titular)</p>
              <p className="mb-3 inline-block rounded-[var(--radius-control)] bg-accent-soft px-3 py-1 font-mono text-2xl font-semibold text-ink">
                {emitido.codigoVerificacion}
              </p>
              <p className="text-sm text-muted">Número de certificado</p>
              <p className="mb-3 font-mono text-xl font-medium">{emitido.numeroCertificado}</p>
              <p className="text-sm text-muted">Persona</p>
              <p className="mb-3 font-semibold">{fullName(emitido)}</p>
              <p className="text-sm text-muted">URL pública de verificación</p>
              <p className="mb-6 break-all font-mono text-sm">{verificationUrl(emitido.codigoVerificacion)}</p>
              <div className="flex flex-wrap gap-2">
                <Button to={`/admin/certificados/${emitido.id}`} icon={Eye}>
                  Ver detalle
                </Button>
                <Button variant="secondary" icon={FilePlus2} onClick={reset}>
                  Emitir otro
                </Button>
              </div>
            </div>
            <QRBlock codigo={emitido.codigoVerificacion} numero={emitido.numeroCertificado} />
          </div>
        </Card>
      </>
    )
  }

  return (
    <>
      <PageHeader title="Emitir certificado" backTo="/admin/certificados" backLabel="Certificados" />
      <Stepper steps={STEPS} current={step} />
      {alertaDuplicado && duplicado && (
        <AlertaDuplicado
          persona={persona}
          certificado={duplicado}
          onCancelar={reset}
          onContinuar={sacarDeTodosModos}
          onCerrar={cerrarAlerta}
        />
      )}
      <Card title={STEPS[step]}>
        {step === 0 && <StepPersona persona={persona} onSelect={selectPersona} vigentes={vigentes} />}
        {step === 1 && <StepCurso cursoId={curso?.id} onSelect={selectCurso} vigentes={vigentes} />}
        {step === 2 && <StepFechas values={fechas} curso={curso} onChange={setFechas} errors={errors} />}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            {duplicado && (
              <Alert tone="warning" title="Se sacará de todos modos">
                {fullName(persona)} ya tiene el certificado{' '}
                <Link to={`/admin/certificados/${duplicado.id}`} target="_blank" className="font-mono font-semibold hover:underline">
                  {duplicado.numeroCertificado}
                </Link>{' '}
                de este curso, sacado el {formatLongDate(duplicado.fechaExpedicion)}.
              </Alert>
            )}
            <Resumen persona={persona} curso={curso} fechas={fechas} />
            <p className="text-sm text-muted">
              Al emitir, el sistema generará el código único de consulta y el código QR. El titular consultará su certificado
              con su tipo y número de documento más este código.
            </p>
            {submitError && <Alert tone="error" title={submitError} />}
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-line pt-4">
          {step > 0 ? (
            <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(step - 1)}>
              Anterior
            </Button>
          ) : (
            <Link to="/admin/certificados" className="inline-flex min-h-11 items-center text-sm font-medium text-muted hover:text-ink">
              Cancelar
            </Link>
          )}
          {step < STEPS.length - 1 ? (
            <Button iconRight={ArrowRight} onClick={next} disabled={!canContinue}>
              Continuar
            </Button>
          ) : (
            <Button icon={FilePlus2} onClick={emitir} loading={submitting} disabled={Boolean(duplicado) && !confirmaDuplicado}>
              Emitir certificado
            </Button>
          )}
        </div>
      </Card>
    </>
  )
}
