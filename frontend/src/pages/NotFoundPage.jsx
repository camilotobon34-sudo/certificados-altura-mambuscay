import { Home } from 'lucide-react'
import { LogoSymbol } from '../components/brand/Logo.jsx'
import { Button } from '../components/ui/Button.jsx'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <LogoSymbol className="h-24" />
      <h1 className="text-4xl text-primary">Página no encontrada</h1>
      <p className="max-w-md text-muted">La dirección que intenta abrir no existe o fue movida.</p>
      <Button to="/" icon={Home}>
        Ir a la consulta pública
      </Button>
    </div>
  )
}
