import { Suspense, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import {
  BookOpen,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  Users,
  UserSquare,
  X,
} from 'lucide-react'
import { Logo, LogoSymbol } from '../components/brand/Logo.jsx'
import { Spinner } from '../components/ui/Feedback.jsx'
import { OfflineBanner } from '../components/pwa/PwaBanners.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ROL_LABELS, ROLES } from '../lib/constants.js'

// docs/06-prototipo-figma (6.5): Personal autorizado no ve Usuarios, Niveles ni Configuración.
const NAV_ITEMS = [
  { to: '/admin', label: 'Panel', icon: LayoutDashboard, end: true },
  { to: '/admin/certificados', label: 'Certificados', icon: FileText },
  { to: '/admin/personas', label: 'Personas certificadas', icon: UserSquare },
  { to: '/admin/cursos', label: 'Cursos', icon: BookOpen },
  { to: '/admin/niveles', label: 'Niveles de formación', icon: Layers, roles: [ROLES.ADMIN] },
  { to: '/admin/usuarios', label: 'Usuarios', icon: Users, roles: [ROLES.ADMIN] },
  { to: '/admin/configuracion', label: 'Configuración', icon: Settings, roles: [ROLES.ADMIN] },
]

function SidebarNav({ onNavigate }) {
  const { usuario } = useAuth()
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(usuario.rol))
  return (
    <nav aria-label="Menú principal" className="flex flex-col gap-1 px-3">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex min-h-11 items-center gap-3 rounded-[var(--radius-control)] px-3 text-sm font-medium transition-colors ${
              isActive ? 'bg-white/10 text-white shadow-[inset_3px_0_0_var(--color-accent)]' : 'text-white/75 hover:bg-white/5 hover:text-white'
            }`
          }
        >
          <Icon className="size-5 shrink-0" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function InternalLayout() {
  const { usuario, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col bg-primary py-5 lg:flex print:hidden">
        <div className="mb-8 px-5">
          <Logo negative />
        </div>
        <SidebarNav />
        <p className="mt-auto px-5 pt-6 text-xs leading-relaxed text-white/50">
          Panel administrativo
          <br />
          CERTIFICADOS ALTURA MAMBUSCAY
        </p>
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden print:hidden">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Cerrar menú" onClick={() => setMenuOpen(false)} />
          <aside className="relative flex h-full w-72 flex-col bg-primary py-5">
            <div className="mb-8 flex items-center justify-between px-5">
              <Logo negative />
              <button type="button" onClick={() => setMenuOpen(false)} className="inline-flex size-11 items-center justify-center text-white" aria-label="Cerrar menú">
                <X className="size-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMenuOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <OfflineBanner />
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface-elevated px-4 lg:px-8 print:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] text-primary lg:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="size-6" />
          </button>
          <div className="flex min-w-0 items-center gap-2 lg:hidden">
            <LogoSymbol className="h-9" />
            <span className="truncate font-display text-lg font-bold uppercase tracking-wider text-primary">Altura Mambuscay</span>
          </div>
          <div className="ml-auto flex items-center gap-1 sm:gap-3">
            <NavLink
              to="/admin/cuenta"
              className="flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] px-2 text-right leading-tight hover:bg-surface"
              title="Mi cuenta"
            >
              <span className="hidden sm:block">
                <span className="block text-sm font-semibold text-ink">
                  {usuario.nombres} {usuario.apellidos}
                </span>
                <span className="block text-xs text-muted">{ROL_LABELS[usuario.rol]}</span>
              </span>
              <UserCog className="size-5 text-primary" aria-label="Mi cuenta" />
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--radius-control)] px-3 text-sm font-medium text-muted hover:bg-surface hover:text-danger"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 lg:px-8">
          <Suspense fallback={<Spinner />} key={location.pathname}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
