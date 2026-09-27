import { Link, Outlet } from 'react-router'
import { KeyRound } from 'lucide-react'
import { Logo } from '../components/brand/Logo.jsx'
import { InstallBanner, OfflineBanner } from '../components/pwa/PwaBanners.jsx'

export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <OfflineBanner />
      <header className="border-b border-line bg-surface-elevated">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/" aria-label="Ir al inicio">
            <Logo />
          </Link>
          <Link
            to="/login"
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"
          >
            <KeyRound className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">Acceso administrativo</span>
            <span className="sm:hidden">Acceso</span>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface-elevated">
        <div className="mx-auto max-w-5xl px-4 py-5 text-center text-sm text-muted">
          <p className="font-semibold text-ink">CERTIFICADOS ALTURA MAMBUSCAY</p>
          <p>Formación en trabajo en alturas conforme a la Resolución 4272 de 2021.</p>
        </div>
      </footer>
      <InstallBanner />
    </div>
  )
}
