import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Save, Search } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Checkbox, Input, Select } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { useCatalogos } from '../../../hooks/useCatalogos.js'
import { api } from '../../../lib/api.js'
import { fullName } from '../../../lib/format.js'

const EMPTY = {
  nombres: '',
  apellidos: '',
  tipoDocumentoId: '',
  numeroDocumento: '',
  correo: '',
  rolId: '',
  personaId: null,
  password: '',
  activo: true,
}

function PersonaPicker({ persona, onSelect, error }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const search = async () => {
    if (!q.trim()) return
    const { items } = await api.get('/personas', { q: q.trim(), size: 6 })
    setResults(items)
  }
  return (
    <div className="flex flex-col gap-2 md:col-span-2">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            label="Persona certificada vinculada"
            required
            placeholder="Buscar por documento o nombre"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                search()
              }
            }}
            error={error}
            hint={persona ? `Seleccionada: ${fullName(persona)} (${persona.numeroDocumento ?? ''})` : 'El cliente solo verá los certificados de esta persona e ingresará con su documento.'}
          />
        </div>
        <Button variant="secondary" icon={Search} onClick={search}>Buscar</Button>
      </div>
      {results && (
        <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
          {results.length === 0 && <li className="px-4 py-3 text-sm text-muted">Sin resultados</li>}
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className="min-h-11 w-full px-4 py-2 text-left hover:bg-primary/5"
                onClick={() => {
                  onSelect(p)
                  setResults(null)
                }}
              >
                {fullName(p)} <span className="font-mono text-sm text-muted">{p.tipoDocumento} {p.numeroDocumento}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// I-15: Usuario — formulario (HU-02).
export default function UsuarioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const catalogos = useCatalogos()
  const [form, setForm] = useState(EMPTY)
  const [persona, setPersona] = useState(null)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const existing = useApi(async (signal) => {
    if (!id) return null
    const { usuario } = await api.get(`/usuarios/${id}`, undefined, { signal })
    setForm({
      ...EMPTY,
      nombres: usuario.nombres,
      apellidos: usuario.apellidos,
      tipoDocumentoId: usuario.tipoDocumentoId ? String(usuario.tipoDocumentoId) : '',
      numeroDocumento: usuario.numeroDocumento ?? '',
      correo: usuario.correo ?? '',
      rolId: String(usuario.rolId),
      personaId: usuario.personaId,
      activo: Boolean(usuario.activo),
    })
    if (usuario.personaId) {
      setPersona({ id: usuario.personaId, nombres: usuario.persona, numeroDocumento: usuario.numeroDocumento })
    }
    return usuario
  }, [id])

  if (catalogos.loading || existing.loading) return <Spinner />
  if (catalogos.error || existing.error) return <ErrorState error={catalogos.error ?? existing.error} />

  const rol = catalogos.data.roles.find((r) => String(r.id) === form.rolId)
  const esEstudiante = rol?.codigo === 'ESTUDIANTE'
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const fieldErrors = error?.fieldErrors ?? {}

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        ...form,
        rolId: Number(form.rolId),
        personaId: esEstudiante ? (persona?.id ?? null) : null,
        tipoDocumentoId: esEstudiante || !form.tipoDocumentoId ? null : Number(form.tipoDocumentoId),
        numeroDocumento: esEstudiante ? null : form.numeroDocumento,
      }
      if (id) await api.put(`/usuarios/${id}`, body)
      else await api.post('/usuarios', body)
      navigate('/admin/usuarios', { replace: true })
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title={id ? 'Editar usuario' : 'Nuevo usuario'} backTo="/admin/usuarios" backLabel="Usuarios" />
      <Card>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
          {error && !Object.keys(fieldErrors).length && <Alert tone="error" title={error.message} className="md:col-span-2" />}
          <Input label="Nombres" required value={form.nombres} onChange={set('nombres')} error={fieldErrors.nombres} />
          <Input label="Apellidos" required value={form.apellidos} onChange={set('apellidos')} error={fieldErrors.apellidos} />
          <Select
            label="Rol"
            required
            placeholder="Seleccione"
            value={form.rolId}
            onChange={set('rolId')}
            error={fieldErrors.rolId}
            options={catalogos.data.roles
              .filter((r) => r.codigo !== 'ESTUDIANTE' || String(r.id) === form.rolId)
              .map((r) => ({ value: String(r.id), label: r.nombre }))}
          />
          <Input label="Correo electrónico" type="email" autoComplete="off" value={form.correo} onChange={set('correo')} error={fieldErrors.correo} hint="Opcional." />
          {esEstudiante ? (
            <PersonaPicker persona={persona} onSelect={setPersona} error={fieldErrors.personaId} />
          ) : (
            <>
              <Select
                label="Tipo de identificación"
                required
                placeholder="Seleccione"
                value={form.tipoDocumentoId}
                onChange={set('tipoDocumentoId')}
                error={fieldErrors.tipoDocumentoId}
                options={catalogos.data.tiposDocumento.map((t) => ({ value: String(t.id), label: `${t.nombre} (${t.codigo})` }))}
              />
              <Input
                label="Número de identificación"
                required
                autoComplete="off"
                value={form.numeroDocumento}
                onChange={set('numeroDocumento')}
                error={fieldErrors.numeroDocumento}
                hint="Con este documento inicia sesión."
              />
            </>
          )}
          <Input
            label={id ? 'Nueva contraseña' : 'Contraseña'}
            type="password"
            required={!id}
            autoComplete="new-password"
            value={form.password}
            onChange={set('password')}
            error={fieldErrors.password}
            hint={id ? 'Déjela vacía para conservar la actual. Mínimo 10 caracteres.' : 'Mínimo 10 caracteres.'}
          />
          <Checkbox label="Usuario activo" checked={form.activo} onChange={set('activo')} />
          <div className="flex justify-end gap-2 border-t border-line pt-4 md:col-span-2">
            <Button type="submit" icon={Save} loading={saving}>Guardar</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
