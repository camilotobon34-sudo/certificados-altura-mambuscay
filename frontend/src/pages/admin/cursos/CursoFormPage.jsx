import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Save } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Checkbox, Input, Select, Textarea } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { useCatalogos } from '../../../hooks/useCatalogos.js'
import { api } from '../../../lib/api.js'

const EMPTY = { nombre: '', nivelFormacionId: '', tipoActividadId: '', intensidadHoraria: '', descripcion: '', activo: true }
const REENTRENAMIENTO_MIN = 8

// I-06: Curso — formulario con validación de intensidad mínima (HU-08).
export default function CursoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const catalogos = useCatalogos()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const existing = useApi(async (signal) => {
    if (!id) return null
    const { curso } = await api.get(`/cursos/${id}`, undefined, { signal })
    setForm({
      nombre: curso.nombre,
      nivelFormacionId: curso.nivelFormacionId ? String(curso.nivelFormacionId) : '',
      tipoActividadId: String(curso.tipoActividadId),
      intensidadHoraria: String(curso.intensidadHoraria),
      descripcion: curso.descripcion ?? '',
      activo: Boolean(curso.activo),
    })
    return curso
  }, [id])

  if (catalogos.loading || existing.loading) return <Spinner />
  if (catalogos.error || existing.error) return <ErrorState error={catalogos.error ?? existing.error} />

  const { niveles, tiposActividad } = catalogos.data
  const tipo = tiposActividad.find((t) => String(t.id) === form.tipoActividadId)
  const nivel = niveles.find((n) => String(n.id) === form.nivelFormacionId)
  const esReentrenamiento = tipo?.codigo === 'REENTRENAMIENTO'
  const minimo = esReentrenamiento ? REENTRENAMIENTO_MIN : nivel?.intensidad_minima_horas

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })
  const fieldErrors = error?.fieldErrors ?? {}

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const body = {
        ...form,
        nivelFormacionId: form.nivelFormacionId ? Number(form.nivelFormacionId) : null,
        tipoActividadId: Number(form.tipoActividadId),
        intensidadHoraria: Number(form.intensidadHoraria),
      }
      if (id) await api.put(`/cursos/${id}`, body)
      else await api.post('/cursos', body)
      navigate('/admin/cursos', { replace: true })
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title={id ? 'Editar curso' : 'Nuevo curso'} backTo="/admin/cursos" backLabel="Cursos" />
      <Card>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
          {error && !Object.keys(fieldErrors).length && <Alert tone="error" title={error.message} className="md:col-span-2" />}
          <div className="md:col-span-2">
            <Input label="Nombre del curso" required value={form.nombre} onChange={set('nombre')} error={fieldErrors.nombre} />
          </div>
          <Select
            label="Tipo de actividad"
            required
            placeholder="Seleccione"
            value={form.tipoActividadId}
            onChange={set('tipoActividadId')}
            error={fieldErrors.tipoActividadId}
            options={tiposActividad.map((t) => ({ value: String(t.id), label: t.nombre }))}
          />
          <Select
            label="Nivel de formación (Res. 4272 de 2021)"
            required={!esReentrenamiento}
            placeholder={esReentrenamiento ? 'Opcional' : 'Seleccione'}
            value={form.nivelFormacionId}
            onChange={set('nivelFormacionId')}
            error={fieldErrors.nivelFormacionId}
            options={niveles.filter((n) => n.activo).map((n) => ({ value: String(n.id), label: `${n.nombre} (mín. ${n.intensidad_minima_horas} h)` }))}
          />
          <Input
            label="Intensidad horaria"
            type="number"
            required
            min={minimo ?? 1}
            value={form.intensidadHoraria}
            onChange={set('intensidadHoraria')}
            error={fieldErrors.intensidadHoraria}
            hint={minimo ? `Mínimo ${minimo} horas según la Resolución 4272 de 2021.` : undefined}
          />
          {esReentrenamiento && (
            <Alert tone="info" title="El reentrenamiento no es un nivel de formación">
              Res. 4272 de 2021, Art. 27: mínimo 8 horas (20 % teórico y 80 % práctico).
            </Alert>
          )}
          <div className="md:col-span-2">
            <Textarea label="Descripción" value={form.descripcion} onChange={set('descripcion')} />
          </div>
          <Checkbox label="Curso activo (disponible para nuevas emisiones)" checked={form.activo} onChange={set('activo')} />
          <div className="flex justify-end gap-2 border-t border-line pt-4 md:col-span-2">
            <Button type="submit" icon={Save} loading={saving}>Guardar</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
