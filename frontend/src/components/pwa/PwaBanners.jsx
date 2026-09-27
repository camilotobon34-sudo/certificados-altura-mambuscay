import { useEffect, useState } from 'react'
import { Smartphone, WifiOff, X } from 'lucide-react'
import { useOnlineStatus } from '../../hooks/useOnlineStatus.js'

const DISMISS_KEY = 'mambuscay.install-dismissed'

export function OfflineBanner() {
  const online = useOnlineStatus()
  if (online) return null
  return (
    <div role="status" className="flex items-center justify-center gap-2 bg-warning px-4 py-2 text-sm font-medium text-white print:hidden">
      <WifiOff className="size-4" aria-hidden="true" />
      Sin conexión. La verificación de certificados requiere internet.
    </div>
  )
}

// HU-19: invita a instalar la PWA cuando el navegador lo permite.
export function InstallBanner() {
  const [promptEvent, setPromptEvent] = useState(null)
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1')

  useEffect(() => {
    const onPrompt = (event) => {
      event.preventDefault()
      setPromptEvent(event)
    }
    const onInstalled = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!promptEvent || dismissed) return null

  const install = async () => {
    promptEvent.prompt()
    await promptEvent.userChoice.catch(() => null)
    setPromptEvent(null)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 mx-auto flex max-w-md items-center gap-3 rounded-[var(--radius-card)] bg-primary p-3 text-white shadow-[var(--shadow-elevation-2)] print:hidden">
      <Smartphone className="size-6 shrink-0 text-accent" aria-hidden="true" />
      <p className="flex-1 text-sm">Instale la aplicación para verificar certificados más rápido.</p>
      <button type="button" onClick={install} className="h-11 rounded-[var(--radius-control)] bg-accent px-3 text-sm font-semibold">
        Instalar
      </button>
      <button type="button" onClick={dismiss} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-white/10" aria-label="Cerrar aviso de instalación">
        <X className="size-4" />
      </button>
    </div>
  )
}
