import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Save } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input, Select, Textarea } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { StatusBadge } from '../../../components/ui/StatusBadge.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { addMonthsIso, fullName, tituloFormacion } from '../../../lib/format.js'

function Formulario({ certificado: c, cursos }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    numeroCertificado: c.numeroCertificado,
    cursoId: String(c.cursoId),
    intensidadHoraria: String(c.intensidadHoraria),
    fechaExpedicion: c.fechaExpedicion,
    fechaVencimiento: c.fechaVencimiento,
    observacion: '',
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // El curso actual se conserva aunque esté inactivo; los demás solo si están activos.
  const opciones = cursos
    .filter((cu) => cu.activo || cu.id === c.cursoId)
    .map((cu) => ({ value: String(cu.id), label: `${tituloFormacion(cu)} — ${cu.nombre}` }))

  const set = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value })
    setErrors({ ...errors, [campo]: undefined })
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      await api.put(`/certificados/${c.id}`, {
        ...form,
        cursoId: Number(form.cursoId),
        intensidadHoraria: Number(form.intensidadHoraria),
      })
      navigate(`/admin/certificados/${c.id}`, { state: { aviso: 'Datos del certificado actualizados.' } })
    } catch (err) {
      if (Object.keys(err.fieldErrors ?? {}).length) setErrors(err.fieldErrors)
      else setError(err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-6">
      <Card title="Titular" actions={<StatusBadge estado={c.estado} />}>
        <p className="font-semibold text-ink">{fullName(c)}</p>
        <p className="font-mono text-sm text-muted">
          {c.tipoDocumento} {c.numeroDocumento}
        </p>
        <p className="mt-3 text-sm text-muted">
          Código de consulta: <span className="font-mono font-semibold text-ink">{c.codigoVerificacion}</span> (no cambia al editar)
        </p>
      </Card>

      <Card title="Datos del certificado">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Número de certificado"
            required
            value={form.numeroCertificado}
            onChange={set('numeroCertificado')}
            error={errors.numeroCertificado}
            className="font-mono uppercase"
          />
          <Select label="Curso o programa" required options={opciones} value={form.cursoId} onChange={set('cursoId')} error={errors.cursoId} />
          <Input
            label="Intensidad horaria"
            type="number"
            min={1}
            required
            value={form.intensidadHoraria}
            onChange={set('intensidadHoraria')}
            error={errors.intensidadHoraria}
            hint="Se valida el mínimo del nivel (Res. 4272 de 2021)."
          />
          <Input label="Fecha de expedición" type="date" required value={form.fechaExpedicion} onChange={set('fechaExpedicion')} error={errors.fechaExpedicion} />
          <div className="flex flex-col gap-2">
            <Input
              label="Fecha de vencimiento"
              type="date"
              required
              min={form.fechaExpedicion}
              value={form.fechaVencimiento}
              onChange={set('fechaVencimiento')}
              error={errors.fechaVencimiento}
            />
            <div className="flex flex-wrap gap-1">
              {[12, 18, 24].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setForm({ ...form, fechaVencimiento: addMonthsIso(form.fechaExpedicion, m) })}
                  className="min-h-9 rounded-full border border-line px-3 text-xs font-medium text-primary hover:bg-primary/5"
                >
                  +{m} meses
                </button>
              ))}
            </div>
          </div>
          <div className="md:col-span-2">
            <Textarea
              label="Observación de la edición (opcional, interna)"
              value={form.observacion}
              onChange={set('observacion')}
              error={errors.observacion}
              hint="Queda registrada en el historial del certificado; no se muestra en la consulta pública."
            />
          </div>
        </div>
        {error && <Alert tone="error" title={error} className="mt-4" />}
        <div className="mt-6 flex flex-wrap justify-end gap-2 border-t border-line pt-4">
          <Button to={`/admin/certificados/${c.id}`} variant="ghost">
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={saving}>
            Guardar cambios
          </Button>
        </div>
      </Card>
    </form>
  )
}

export default function EditarCertificadoPage() {
  const { id } = useParams()
  const detalle = useApi((signal) => api.get(`/certificados/${id}`, undefined, { signal }), [id])
  const cursos = useApi((signal) => api.get('/cursos', undefined, { signal }))

  if (detalle.loading || cursos.loading) return <Spinner />
  if (detalle.error) return <ErrorState error={detalle.error} onRetry={detalle.reload} />
  if (cursos.error) return <ErrorState error={cursos.error} onRetry={cursos.reload} />

  const c = detalle.data.certificado
  return (
    <>
      <PageHeader title={`Editar ${c.numeroCertificado}`} backTo={`/admin/certificados/${c.id}`} backLabel="Detalle del certificado" />
      {c.estado === 'ANULADO' ? (
        <Alert tone="error" title="Un certificado anulado no puede editarse" />
      ) : (
        <Formulario certificado={c} cursos={cursos.data.items} />
      )}
    </>
  )
}
