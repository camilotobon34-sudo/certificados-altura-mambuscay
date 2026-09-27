import { useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Lock, Save } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Checkbox, Input, Select } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { useCatalogos } from '../../../hooks/useCatalogos.js'
import { api } from '../../../lib/api.js'

const EMPTY = { tipoDocumentoId: '', numeroDocumento: '', nombres: '', apellidos: '', correo: '', telefono: '', activo: true }

const PrivateBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
    <Lock className="size-3" aria-hidden="true" />
    Dato privado
  </span>
)

// I-03: Persona — formulario (HU-04, HU-05).
export default function PersonaFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const retornoEmitir = searchParams.get('retorno') === 'emitir'
  const catalogos = useCatalogos()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const existing = useApi(async (signal) => {
    if (!id) return null
    const { persona } = await api.get(`/personas/${id}`, undefined, { signal })
    setForm({
      tipoDocumentoId: String(persona.tipoDocumentoId),
      numeroDocumento: persona.numeroDocumento,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      correo: persona.correo ?? '',
      telefono: persona.telefono ?? '',
      activo: Boolean(persona.activo),
    })
    return persona
  }, [id])

  if (catalogos.loading || existing.loading) return <Spinner />
  if (catalogos.error || existing.error) return <ErrorState error={catalogos.error ?? existing.error} />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const fieldErrors = error?.fieldErrors ?? {}

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = { ...form, tipoDocumentoId: Number(form.tipoDocumentoId) }
      const { persona } = id ? await api.put(`/personas/${id}`, body) : await api.post('/personas', body)
      navigate(retornoEmitir ? `/admin/certificados/nuevo?personaId=${persona.id}` : `/admin/personas/${persona.id}`, { replace: true })
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={id ? 'Editar persona certificada' : 'Registrar persona certificada'}
        backTo={retornoEmitir ? '/admin/certificados/nuevo' : id ? `/admin/personas/${id}` : '/admin/personas'}
      />
      <Card>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
          {error && !Object.keys(fieldErrors).length && <Alert tone="error" title={error.message} className="md:col-span-2" />}
          <Select
            label="Tipo de documento"
            required
            placeholder="Seleccione"
            value={form.tipoDocumentoId}
            onChange={set('tipoDocumentoId')}
            error={fieldErrors.tipoDocumentoId}
            options={catalogos.data.tiposDocumento.map((t) => ({ value: String(t.id), label: `${t.codigo} — ${t.nombre}` }))}
          />
          <Input label="Número de documento" required value={form.numeroDocumento} onChange={set('numeroDocumento')} error={fieldErrors.numeroDocumento} className="font-mono" />
          <Input label="Nombres" required value={form.nombres} onChange={set('nombres')} error={fieldErrors.nombres} />
          <Input label="Apellidos" required value={form.apellidos} onChange={set('apellidos')} error={fieldErrors.apellidos} />
          <Input label="Correo electrónico" type="email" badge={<PrivateBadge />} value={form.correo} onChange={set('correo')} error={fieldErrors.correo} hint="No se muestra en la consulta pública." />
          <Input label="Teléfono" type="tel" badge={<PrivateBadge />} value={form.telefono} onChange={set('telefono')} error={fieldErrors.telefono} hint="No se muestra en la consulta pública." />
          {id && <Checkbox label="Persona activa" checked={form.activo} onChange={set('activo')} />}
          <div className="flex justify-end gap-2 border-t border-line pt-4 md:col-span-2">
            <Button type="submit" icon={Save} loading={saving}>
              {retornoEmitir && !id ? 'Guardar y continuar emisión' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
