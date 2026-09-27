import { Suspense } from 'react'
import { Link, Outlet } from 'react-router'
import { LogOut } from 'lucide-react'
import { Logo } from '../components/brand/Logo.jsx'
import { Spinner } from '../components/ui/Feedback.jsx'
import { InstallBanner, OfflineBanner } from '../components/pwa/PwaBanners.jsx'
import { useAuth } from '../context/AuthContext.jsx'

export function StudentLayout() {
  const { usuario, logout } = useAuth()
  return (
    <div className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <header className="bg-primary text-white print:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <Link to="/mis-certificados" aria-label="Mis certificados">
            <Logo negative />
          </Link>
          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-control)] px-3 text-sm font-medium text-white/80 hover:bg-white/10"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Salir
          </button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <p className="mb-1 text-sm text-muted">Hola, {usuario.nombres}</p>
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <InstallBanner />
    </div>
  )
}
