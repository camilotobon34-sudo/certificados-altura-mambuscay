import { useState } from 'react'
import { Save } from 'lucide-react'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../components/ui/Feedback.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'

const FIELDS = ['razonSocial', 'nit', 'ciudad', 'direccion', 'telefono', 'correo', 'urlBasePublica']

// I-16: Configuración del centro.
export default function ConfiguracionPage() {
  const [form, setForm] = useState(null)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  const { loading, error: loadError, reload } = useApi(async (signal) => {
    const { configuracion } = await api.get('/configuracion', undefined, { signal })
    setForm(Object.fromEntries(FIELDS.map((k) => [k, configuracion?.[k] ?? ''])))
    return configuracion
  })

  if (loading) return <Spinner />
  if (loadError) return <ErrorState error={loadError} onRetry={reload} />

  const set = (key) => (e) => {
    setSaved(false)
    setForm({ ...form, [key]: e.target.value })
  }
  const fieldErrors = error?.fieldErrors ?? {}

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.put('/configuracion', form)
      setSaved(true)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Configuración del centro" description="Datos que aparecen en la consulta pública y en los códigos QR." />
      <Card>
        <form onSubmit={submit} className="grid gap-5 md:grid-cols-2" noValidate>
          {saved && <Alert tone="success" title="Configuración guardada" className="md:col-span-2" />}
          {error && !Object.keys(fieldErrors).length && <Alert tone="error" title={error.message} className="md:col-span-2" />}
          <Input label="Razón social" required value={form.razonSocial} onChange={set('razonSocial')} error={fieldErrors.razonSocial} />
          <Input label="NIT" value={form.nit} onChange={set('nit')} error={fieldErrors.nit} />
          <Input label="Ciudad" value={form.ciudad} onChange={set('ciudad')} error={fieldErrors.ciudad} />
          <Input label="Dirección" value={form.direccion} onChange={set('direccion')} error={fieldErrors.direccion} />
          <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} error={fieldErrors.telefono} />
          <Input label="Correo" type="email" value={form.correo} onChange={set('correo')} error={fieldErrors.correo} />
          <div className="md:col-span-2">
            <Input
              label="URL base pública de verificación"
              required
              value={form.urlBasePublica}
              onChange={set('urlBasePublica')}
              error={fieldErrors.urlBasePublica}
              hint="Ej. https://certificados.alturamambuscay.com/verificar — se usa para los QR de nuevos certificados."
              className="font-mono"
            />
          </div>
          <div className="flex justify-end border-t border-line pt-4 md:col-span-2">
            <Button type="submit" icon={Save} loading={saving}>Guardar</Button>
          </div>
        </form>
      </Card>
    </>
  )
}
