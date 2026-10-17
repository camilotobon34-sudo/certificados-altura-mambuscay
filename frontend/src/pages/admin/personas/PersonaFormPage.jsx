import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Lock, Save, Wand2 } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Checkbox, Input, Select } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { useCatalogos } from '../../../hooks/useCatalogos.js'
import { api } from '../../../lib/api.js'
import { revisarNombre } from '../../../lib/revision-nombres.js'

const EMPTY = { tipoDocumentoId: '', numeroDocumento: '', nombres: '', apellidos: '', fechaNacimiento: '', correo: '', telefono: '', activo: true }

const PrivateBadge = () => (
  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-muted">
    <Lock className="size-3" aria-hidden="true" />
    Dato privado
  </span>
)

const CAMPOS_NOMBRE = [
  ['nombres', 'Nombres'],
  ['apellidos', 'Apellidos'],
]

function RevisionNombres({ form, onCorregir }) {
  const revisiones = CAMPOS_NOMBRE.map(([campo, etiqueta]) => ({ campo, etiqueta, ...revisarNombre(form[campo], campo) })).filter(
    (r) => r.avisos.length,
  )
  if (!revisiones.length) return null
  return (
    <Alert tone="warning" title="Revise cómo quedó escrito el nombre" className="md:col-span-2">
      <p>Es solo un aviso: si está bien escrito puede guardar así.</p>
      <ul className="mt-2 space-y-2">
        {revisiones.map(({ campo, etiqueta, avisos, propuesto }) => (
          <li key={campo}>
            <span className="font-semibold">{etiqueta}:</span> {avisos.join(' ')}
            {propuesto && (
              <div className="mt-1">
                <Button type="button" size="sm" variant="secondary" icon={Wand2} onClick={() => onCorregir(campo, propuesto)}>
                  Usar «{propuesto}»
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </Alert>
  )
}

function PersonasParecidas({ items, retornoEmitir }) {
  if (!items.length) return null
  return (
    <Alert tone="warning" title="Puede que esta persona ya esté registrada" className="md:col-span-2">
      <p>Revise que no sea la misma persona con el nombre o el documento mal escrito.</p>
      <ul className="mt-2 space-y-1">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              to={retornoEmitir ? `/admin/certificados/nuevo?personaId=${p.id}` : `/admin/personas/${p.id}`}
              className="font-semibold text-primary underline"
            >
              {p.nombres} {p.apellidos} · {p.tipoDocumento} {p.numeroDocumento}
            </Link>{' '}
            <span className="text-muted">({p.motivos.join(', ').toLowerCase()})</span>
            {retornoEmitir && <span className="text-muted"> — toque para emitir a esta persona</span>}
          </li>
        ))}
      </ul>
    </Alert>
  )
}

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
  const [parecidas, setParecidas] = useState([])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(() => {
      api
        .get(
          '/personas/parecidas',
          { nombres: form.nombres, apellidos: form.apellidos, numeroDocumento: form.numeroDocumento, excluir: id ?? '' },
          { signal: controller.signal },
        )
        .then(({ items }) => setParecidas(items))
        .catch(() => {})
    }, 600)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [form.nombres, form.apellidos, form.numeroDocumento, id])

  const existing = useApi(async (signal) => {
    if (!id) return null
    const { persona } = await api.get(`/personas/${id}`, undefined, { signal })
    setForm({
      tipoDocumentoId: String(persona.tipoDocumentoId),
      numeroDocumento: persona.numeroDocumento,
      nombres: persona.nombres,
      apellidos: persona.apellidos,
      fechaNacimiento: persona.fechaNacimiento ? String(persona.fechaNacimiento).slice(0, 10) : '',
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
          <Input
            label="Fecha de nacimiento"
            type="date"
            required
            value={form.fechaNacimiento}
            onChange={set('fechaNacimiento')}
            error={fieldErrors.fechaNacimiento}
            badge={<PrivateBadge />}
            hint="Sale en el Excel de certificados. No se muestra en la consulta pública."
          />
          <RevisionNombres form={form} onCorregir={(campo, valor) => setForm({ ...form, [campo]: valor })} />
          <PersonasParecidas items={parecidas} retornoEmitir={retornoEmitir} />
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
