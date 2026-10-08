import { lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'
import { AuthProvider } from './context/AuthContext.jsx'
import { PublicLayout } from './layouts/PublicLayout.jsx'
import { InternalLayout } from './layouts/InternalLayout.jsx'
import { StudentLayout } from './layouts/StudentLayout.jsx'
import { RequireRole } from './routes/RequireRole.jsx'
import { INTERNAL_ROLES, ROLES } from './lib/constants.js'
import ConsultaCertificadoPage from './pages/public/ConsultaCertificadoPage.jsx'
import ScanQrPage from './pages/public/ScanQrPage.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

// El panel interno y el portal del estudiante se cargan bajo demanda para que
// la consulta pública (uso principal en campo) sea liviana.
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage.jsx'))
const CertificadosPage = lazy(() => import('./pages/admin/certificados/CertificadosPage.jsx'))
const EmitirCertificadoPage = lazy(() => import('./pages/admin/certificados/EmitirCertificadoPage.jsx'))
const CertificadoDetallePage = lazy(() => import('./pages/admin/certificados/CertificadoDetallePage.jsx'))
const EditarCertificadoPage = lazy(() => import('./pages/admin/certificados/EditarCertificadoPage.jsx'))
const CuentaPage = lazy(() => import('./pages/admin/CuentaPage.jsx'))
const PersonasPage = lazy(() => import('./pages/admin/personas/PersonasPage.jsx'))
const PersonaFormPage = lazy(() => import('./pages/admin/personas/PersonaFormPage.jsx'))
const PersonaDetallePage = lazy(() => import('./pages/admin/personas/PersonaDetallePage.jsx'))
const CursosPage = lazy(() => import('./pages/admin/cursos/CursosPage.jsx'))
const CursoFormPage = lazy(() => import('./pages/admin/cursos/CursoFormPage.jsx'))
const NivelesPage = lazy(() => import('./pages/admin/NivelesPage.jsx'))
const UsuariosPage = lazy(() => import('./pages/admin/usuarios/UsuariosPage.jsx'))
const UsuarioFormPage = lazy(() => import('./pages/admin/usuarios/UsuarioFormPage.jsx'))
const ConfiguracionPage = lazy(() => import('./pages/admin/ConfiguracionPage.jsx'))
const ReporteDiarioPage = lazy(() => import('./pages/admin/ReporteDiarioPage.jsx'))
const MisCertificadosPage = lazy(() => import('./pages/estudiante/MisCertificadosPage.jsx'))
const MiCertificadoPage = lazy(() => import('./pages/estudiante/MiCertificadoPage.jsx'))

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <ConsultaCertificadoPage /> },
      { path: 'escanear', element: <ScanQrPage /> },
      { path: 'verificar', element: <Navigate to="/" replace /> },
      // Destino de los QR (/verificar/:codigo): precarga el código; no cambiar la ruta.
      { path: 'verificar/:codigo', element: <ConsultaCertificadoPage /> },
    ],
  },
  { path: 'login', element: <LoginPage /> },
  {
    path: 'admin',
    element: <RequireRole roles={INTERNAL_ROLES} />,
    children: [
      {
        element: <InternalLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'certificados', element: <CertificadosPage /> },
          { path: 'certificados/nuevo', element: <EmitirCertificadoPage /> },
          { path: 'certificados/:id', element: <CertificadoDetallePage /> },
          { path: 'personas', element: <PersonasPage /> },
          { path: 'personas/nueva', element: <PersonaFormPage /> },
          { path: 'personas/:id', element: <PersonaDetallePage /> },
          { path: 'personas/:id/editar', element: <PersonaFormPage /> },
          { path: 'cursos', element: <CursosPage /> },
          { path: 'cursos/nuevo', element: <CursoFormPage /> },
          { path: 'cursos/:id/editar', element: <CursoFormPage /> },
          { path: 'cuenta', element: <CuentaPage /> },
          {
            element: <RequireRole roles={[ROLES.ADMIN]} />,
            children: [
              { path: 'certificados/:id/editar', element: <EditarCertificadoPage /> },
              { path: 'niveles', element: <NivelesPage /> },
              { path: 'usuarios', element: <UsuariosPage /> },
              { path: 'usuarios/nuevo', element: <UsuarioFormPage /> },
              { path: 'usuarios/:id/editar', element: <UsuarioFormPage /> },
              { path: 'configuracion', element: <ConfiguracionPage /> },
              { path: 'reporte-diario', element: <ReporteDiarioPage /> },
            ],
          },
        ],
      },
    ],
  },
  {
    path: 'mis-certificados',
    element: <RequireRole roles={[ROLES.ESTUDIANTE]} />,
    children: [
      {
        element: <StudentLayout />,
        children: [
          { index: true, element: <MisCertificadosPage /> },
          { path: ':id', element: <MiCertificadoPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}
