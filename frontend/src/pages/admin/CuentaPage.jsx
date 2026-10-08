import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { api } from '../../lib/api.js'
import { ROL_LABELS } from '../../lib/constants.js'

const VACIO = { actual: '', nueva: '', confirmacion: '' }

export default function CuentaPage() {
  const { usuario } = useAuth()
  const [form, setForm] = useState(VACIO)
  const [errors, setErrors] = useState({})
  const [error, setError] = useState('')
  const [ok, setOk] = useState(false)
  const [saving, setSaving] = useState(false)

  const set = (campo) => (e) => {
    setForm({ ...form, [campo]: e.target.value })
    setErrors({ ...errors, [campo]: undefined })
    setOk(false)
  }

  const submit = async (event) => {
    event.preventDefault()
    const next = {}
    if (!form.actual) next.actual = 'Ingrese su contraseña actual'
    if (form.nueva.length < 10) next.nueva = 'Mínimo 10 caracteres'
    if (form.confirmacion !== form.nueva) next.confirmacion = 'Las contraseñas no coinciden'
    setErrors(next)
    if (Object.keys(next).length) return

    setSaving(true)
    setError('')
    try {
      await api.put('/auth/password', { actual: form.actual, nueva: form.nueva })
      setForm(VACIO)
      setOk(true)
    } catch (err) {
      if (Object.keys(err.fieldErrors ?? {}).length) setErrors(err.fieldErrors)
      else setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Mi cuenta" description={[
          `${usuario.nombres} ${usuario.apellidos}`,
          usuario.numeroDocumento && `${usuario.tipoDocumento} ${usuario.numeroDocumento}`,
          usuario.correo,
          ROL_LABELS[usuario.rol],
        ]
          .filter(Boolean)
          .join(' · ')} />
      <Card title="Cambiar contraseña" className="max-w-xl">
        <form onSubmit={submit} noValidate className="flex flex-col gap-4">
          <p className="text-sm text-muted">
            Si ingresó con una contraseña temporal, reemplácela por una personal. Use al menos 10 caracteres.
          </p>
          {ok && <Alert tone="success" title="Contraseña actualizada correctamente" />}
          {error && <Alert tone="error" title={error} />}
          <Input label="Contraseña actual" type="password" autoComplete="current-password" required value={form.actual} onChange={set('actual')} error={errors.actual} />
          <Input label="Nueva contraseña" type="password" autoComplete="new-password" required value={form.nueva} onChange={set('nueva')} error={errors.nueva} />
          <Input label="Confirmar nueva contraseña" type="password" autoComplete="new-password" required value={form.confirmacion} onChange={set('confirmacion')} error={errors.confirmacion} />
          <Button type="submit" icon={KeyRound} loading={saving} className="self-start">
            Guardar contraseña
          </Button>
        </form>
      </Card>
    </>
  )
}
