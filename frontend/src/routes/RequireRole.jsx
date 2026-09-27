import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { Spinner } from '../components/ui/Feedback.jsx'
import { homePathForRole } from '../lib/constants.js'

export function RequireRole({ roles }) {
  const { status, usuario } = useAuth()
  const location = useLocation()

  if (status === 'loading') return <Spinner label="Verificando sesión..." className="min-h-dvh" />

  if (status !== 'authenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={homePathForRole(usuario.rol)} replace />
  }

  return <Outlet />
}
