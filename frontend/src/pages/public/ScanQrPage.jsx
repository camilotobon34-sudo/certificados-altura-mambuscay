import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Keyboard, Smartphone } from 'lucide-react'
import { Button } from '../../components/ui/Button.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { extractVerificationCode, isValidCode } from '../../lib/verification.js'

const supportsScanner = () =>
  typeof window !== 'undefined' && 'BarcodeDetector' in window && Boolean(navigator.mediaDevices?.getUserMedia)

// P-02: Escanear QR (HU-17). Usa BarcodeDetector cuando el navegador lo soporta.
export default function ScanQrPage() {
  const navigate = useNavigate()
  const videoRef = useRef(null)
  const [error, setError] = useState(() =>
    supportsScanner() ? '' : 'unsupported',
  )

  useEffect(() => {
    if (!supportsScanner()) return undefined

    let stream
    let frame
    let stopped = false

    const start = async () => {
      try {
        const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
        if (stopped) return
        const video = videoRef.current
        video.srcObject = stream
        await video.play()

        const scan = async () => {
          if (stopped) return
          try {
            const [result] = await detector.detect(video)
            const code = result && extractVerificationCode(result.rawValue)
            if (code && isValidCode(code)) {
              navigate(`/verificar/${encodeURIComponent(code)}`, { replace: true })
              return
            }
          } catch {
            // Fotograma no disponible todavía; se reintenta en el siguiente.
          }
          frame = requestAnimationFrame(scan)
        }
        scan()
      } catch (err) {
        setError(err?.name === 'NotAllowedError' ? 'denied' : 'camera')
      }
    }

    start()
    return () => {
      stopped = true
      cancelAnimationFrame(frame)
      stream?.getTracks().forEach((track) => track.stop())
    }
  }, [navigate])

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5 px-4 py-8">
      <div>
        <h1 className="text-3xl text-primary">Escanear código QR</h1>
        <p className="mt-1 text-muted">Ubique el código QR del certificado dentro del marco.</p>
      </div>

      {error ? (
        <Alert
          tone="info"
          title={
            error === 'denied'
              ? 'No se concedió permiso para usar la cámara'
              : 'Este navegador no permite escanear desde la aplicación'
          }
        >
          <p className="flex items-start gap-2">
            <Smartphone className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Abra la cámara de su teléfono y apunte al código QR: el enlace abrirá directamente la verificación.
          </p>
        </Alert>
      ) : (
        <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-ink">
          <video ref={videoRef} className="size-full object-cover" playsInline muted aria-label="Vista de la cámara" />
          <div className="pointer-events-none absolute inset-[15%] rounded-[var(--radius-card)] border-4 border-accent shadow-[0_0_0_9999px_rgb(26_35_50/0.45)]" />
        </div>
      )}

      <Button to="/" variant="secondary" icon={Keyboard}>
        Ingresar código manualmente
      </Button>
    </div>
  )
}
