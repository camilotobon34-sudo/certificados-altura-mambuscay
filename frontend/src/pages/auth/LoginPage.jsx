import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, LogIn, ShieldCheck, UserRound } from 'lucide-react'
import { Logo } from '../../components/brand/Logo.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select } from '../../components/ui/Field.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { homePathForRole, INTERNAL_ROLES, ROLES } from '../../lib/constants.js'
import { TIPOS_ALFANUMERICOS, useTiposDocumentoPublicos } from '../../lib/tipos-documento.js'

const TIPOS_USUARIO = [
  { value: 'ADMINISTRADOR', label: 'Administrador', descripcion: 'Gestión del centro', icon: ShieldCheck },
  { value: 'CLIENTE', label: 'Cliente', descripcion: 'Mis certificados', icon: UserRound },
]

const canAccess = (path, rol) => {
  if (!path) return false
  if (path.startsWith('/admin')) return INTERNAL_ROLES.includes(rol)
  if (path.startsWith('/mis-certificados')) return rol === ROLES.ESTUDIANTE
  return false
}

// A-01 / A-02: Iniciar sesión y sesión expirada (HU-01).
export default function LoginPage() {
  const { login, status, usuario, sessionExpired } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const tipos = useTiposDocumentoPublicos()
  const [form, setForm] = useState({
    tipoUsuario: location.state?.from?.startsWith('/mis-certificados') ? 'CLIENTE' : 'ADMINISTRADOR',
    tipoDocumento: 'CC',
    numeroDocumento: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated' && !submitting) {
    return <Navigate to={homePathForRole(usuario.rol)} replace />
  }

  const set = (campo) => (e) => setForm({ ...form, [campo]: e.target.value })

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const u = await login({ ...form, numeroDocumento: form.numeroDocumento.trim() })
      const from = location.state?.from
      navigate(canAccess(from, u.rol) ? from : homePathForRole(u.rol), { replace: true })
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-primary px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="rounded-[var(--radius-card)] bg-surface-elevated p-6 shadow-[var(--shadow-elevation-2)] sm:p-8">
          <Logo variant="stacked" className="mb-6" />
          <h1 className="mb-1 text-center text-2xl text-ink">Iniciar sesión</h1>
          <p className="mb-6 text-center text-sm text-muted">
            Ingrese con su documento de identidad. Para verificar un certificado use la consulta pública.
          </p>

          {sessionExpired && !error && (
            <Alert tone="warning" title="Su sesión expiró" className="mb-4">
              Por seguridad, vuelva a iniciar sesión.
            </Alert>
          )}
          {error && <Alert tone="error" title={error} className="mb-4" />}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">Tipo de usuario</legend>
              <div role="radiogroup" className="grid grid-cols-2 gap-2">
                {TIPOS_USUARIO.map(({ value, label, descripcion, icon: Icon }) => {
                  const activo = form.tipoUsuario === value
                  return (
                    <label
                      key={value}
                      className={`flex min-h-11 cursor-pointer flex-col items-center gap-1 rounded-[var(--radius-control)] border px-2 py-3 text-center transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary/30 ${
                        activo ? 'border-primary bg-primary/5 text-primary' : 'border-line text-muted hover:border-primary/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoUsuario"
                        value={value}
                        checked={activo}
                        onChange={set('tipoUsuario')}
                        className="sr-only"
                      />
                      <Icon className="size-5" aria-hidden="true" />
                      <span className={`text-sm font-semibold ${activo ? 'text-primary' : 'text-ink'}`}>{label}</span>
                      <span className="text-xs">{descripcion}</span>
                    </label>
                  )
                })}
              </div>
            </fieldset>
            <Select
              label="Tipo de identificación"
              required
              value={form.tipoDocumento}
              onChange={set('tipoDocumento')}
              options={tipos.map((t) => ({ value: t.codigo, label: `${t.nombre} (${t.codigo})` }))}
            />
            <Input
              label="Número de identificación"
              autoComplete="username"
              inputMode={TIPOS_ALFANUMERICOS.has(form.tipoDocumento) ? 'text' : 'numeric'}
              required
              value={form.numeroDocumento}
              onChange={set('numeroDocumento')}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={set('password')}
            />
            <Button type="submit" size="lg" icon={LogIn} loading={submitting}>
              Ingresar
            </Button>
          </form>
        </div>
        <Link to="/" className="mt-4 inline-flex min-h-11 items-center gap-1 text-sm font-medium text-white/80 hover:text-white">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Volver a la consulta pública
        </Link>
      </div>
    </div>
  )
}
