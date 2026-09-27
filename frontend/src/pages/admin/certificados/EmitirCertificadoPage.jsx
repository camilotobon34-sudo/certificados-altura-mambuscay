import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, ArrowRight, CircleCheck, Eye, FilePlus2, Search, UserPlus } from 'lucide-react'
import { QRBlock } from '../../../components/certificados/QRBlock.jsx'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { Stepper } from '../../../components/ui/Stepper.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { addMonthsIso, formatDate, fullName, tituloFormacion, todayIso } from '../../../lib/format.js'
import { verificationUrl } from '../../../lib/verification.js'

const STEPS = ['Persona', 'Curso y nivel', 'Fechas e intensidad', 'Revisión']
const FECHAS_INICIALES = () => ({ fechaExpedicion: todayIso(), fechaVencimiento: '', intensidadHoraria: '', numeroCertificado: '' })
const REENTRENAMIENTO_MIN = 8

const minimoHoras = (curso) =>
  curso?.tipoActividadCodigo === 'REENTRENAMIENTO' ? REENTRENAMIENTO_MIN : (curso?.nivelIntensidadMinima ?? 1)

function StepPersona({ persona, onSelect }) {
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

function StepCurso({ cursoId, onSelect }) {
  const { data, loading, error } = useApi((signal) => api.get('/cursos', { activos: 1 }, { signal }))
  if (loading) return <Spinner />
  if (error) return <ErrorState error={error} />
  return (
    <fieldset className="grid gap-3 md:grid-cols-2">
      <legend className="sr-only">Seleccione el curso</legend>
      {data.items.map((c) => (
        <label
          key={c.id}
          className={`flex cursor-pointer gap-3 rounded-[var(--radius-card)] border p-4 transition-colors ${
            cursoId === c.id ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-line hover:border-primary/50'
          }`}
        >
          <input type="radio" name="curso" className="mt-1 accent-primary" checked={cursoId === c.id} onChange={() => onSelect(c)} />
          <span>
            <span className="block font-semibold text-ink">{tituloFormacion(c)}</span>
            <span className="block text-sm text-muted">{c.nombre}</span>
            <span className="mt-2 inline-flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-surface px-2 py-0.5 font-medium">{c.tipoActividad}</span>
              <span className="rounded-full bg-accent-soft px-2 py-0.5 font-medium text-warning">{c.intensidadHoraria} horas</span>
            </span>
          </span>
        </label>
      ))}
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
          hint="Si el centro ya tiene un consecutivo propio, regístrelo aquí; de lo contrario se asigna MAM-{nivel}-{año}-{consecutivo}."
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
    ['Número de certificado', fechas.numeroCertificado.trim().toUpperCase() || 'Automático'],
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

  const reset = () => {
    setStep(0)
    setPersona(null)
    setCurso(null)
    setFechas(FECHAS_INICIALES())
    setErrors({})
    setSubmitError('')
    setEmitido(null)
  }

  useApi(async (signal) => {
    if (!preselectedId) return null
    const { persona: p } = await api.get(`/personas/${preselectedId}`, undefined, { signal })
    setPersona(p)
    return p
  }, [preselectedId])

  const selectCurso = (c) => {
    setCurso(c)
    setFechas((f) => ({ ...f, intensidadHoraria: String(c.intensidadHoraria) }))
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
      <Card title={STEPS[step]}>
        {step === 0 && <StepPersona persona={persona} onSelect={setPersona} />}
        {step === 1 && <StepCurso cursoId={curso?.id} onSelect={selectCurso} />}
        {step === 2 && <StepFechas values={fechas} curso={curso} onChange={setFechas} errors={errors} />}
        {step === 3 && (
          <div className="flex flex-col gap-4">
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
            <Button icon={FilePlus2} onClick={emitir} loading={submitting}>
              Emitir certificado
            </Button>
          )}
        </div>
      </Card>
    </>
  )
}
