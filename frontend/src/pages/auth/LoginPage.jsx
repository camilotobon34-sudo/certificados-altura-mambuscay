import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { ArrowLeft, LogIn } from 'lucide-react'
import { Logo } from '../../components/brand/Logo.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input } from '../../components/ui/Field.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { homePathForRole, INTERNAL_ROLES, ROLES } from '../../lib/constants.js'

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
  const [form, setForm] = useState({ correo: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated' && !submitting) {
    return <Navigate to={homePathForRole(usuario.rol)} replace />
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const u = await login(form.correo.trim(), form.password)
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
          <h1 className="mb-1 text-center text-2xl text-ink">Acceso administrativo</h1>
          <p className="mb-6 text-center text-sm text-muted">
            Exclusivo para la administración del centro. Para consultar un certificado use la consulta pública.
          </p>

          {sessionExpired && !error && (
            <Alert tone="warning" title="Su sesión expiró" className="mb-4">
              Por seguridad, vuelva a iniciar sesión.
            </Alert>
          )}
          {error && <Alert tone="error" title={error} className="mb-4" />}

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              type="email"
              autoComplete="username"
              required
              value={form.correo}
              onChange={(e) => setForm({ ...form, correo: e.target.value })}
            />
            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
