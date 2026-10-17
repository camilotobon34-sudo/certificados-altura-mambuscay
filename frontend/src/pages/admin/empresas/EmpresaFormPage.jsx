import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Save } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert.jsx'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { Input } from '../../../components/ui/Field.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'

const EMPTY = {
  empresa: '',
  nitEmpresa: '',
  representanteLegal: '',
  documentoRepresentante: '',
  arl: '',
}

export default function EmpresaFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  const existing = useApi(async (signal) => {
    if (!id) return null
    const { empresa } = await api.get(`/empresas/${id}`, undefined, { signal })
    setForm({
      empresa: empresa.empresa ?? '',
      nitEmpresa: empresa.nitEmpresa ?? '',
      representanteLegal: empresa.representanteLegal ?? '',
      documentoRepresentante: empresa.documentoRepresentante ?? '',
      arl: empresa.arl ?? '',
    })
    return empresa
  }, [id])

  if (existing.loading) return <Spinner />
  if (existing.error) return <ErrorState error={existing.error} />

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })
  const fieldErrors = error?.fieldErrors ?? {}

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      if (id) await api.put(`/empresas/${id}`, form)
      else await api.post('/empresas', form)
      navigate('/admin/empresas', { replace: true })
    } catch (err) {
      setError(err)
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        title={id ? 'Editar empresa' : 'Registrar empresa'}
        backTo="/admin/empresas"
        backLabel="Empresas empleadoras"
      />
      <Card>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
          {error && !Object.keys(fieldErrors).length && <Alert tone="error" title={error.message} className="md:col-span-2" />}
          <Input
            label="Nombre de la empresa"
            required
            value={form.empresa}
            onChange={set('empresa')}
            error={fieldErrors.empresa}
            className="md:col-span-2"
            hint="Es la empresa donde trabaja la persona, no Altura Mambuscay."
          />
          <Input label="NIT" value={form.nitEmpresa} onChange={set('nitEmpresa')} error={fieldErrors.nitEmpresa} className="font-mono" />
          <Input label="ARL" value={form.arl} onChange={set('arl')} error={fieldErrors.arl} placeholder="Ej. SURA" />
          <Input
            label="Representante legal"
            value={form.representanteLegal}
            onChange={set('representanteLegal')}
            error={fieldErrors.representanteLegal}
          />
          <Input
            label="Cédula del representante legal"
            value={form.documentoRepresentante}
            onChange={set('documentoRepresentante')}
            error={fieldErrors.documentoRepresentante}
            className="font-mono"
          />
          <div className="flex justify-end gap-2 border-t border-line pt-4 md:col-span-2">
            <Button type="submit" icon={Save} loading={saving}>
              Guardar
            </Button>
          </div>
        </form>
      </Card>
    </>
  )
}
