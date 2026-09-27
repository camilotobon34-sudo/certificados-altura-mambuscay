import { useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { Download, Printer } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

// El QR apunta a la URL pública de verificación (RF-09).
export function QRBlock({ url, codigo, numero, showActions = true }) {
  const wrapperRef = useRef(null)

  const download = () => {
    const canvas = wrapperRef.current?.querySelector('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `QR-${numero ?? codigo}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <div ref={wrapperRef} className="rounded-[var(--radius-control)] border border-line bg-white p-3">
        <QRCodeCanvas value={url} size={176} level="M" marginSize={1} fgColor="#1A2332" title={`Verificar ${codigo}`} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted">Código de consulta</p>
        <p className="font-mono text-lg font-medium tracking-wider text-ink">{codigo}</p>
      </div>
      {showActions && (
        <div className="flex flex-wrap justify-center gap-2 print:hidden">
          <Button variant="secondary" size="sm" icon={Download} onClick={download}>
            Descargar
          </Button>
          <Button variant="ghost" size="sm" icon={Printer} onClick={() => window.print()}>
            Imprimir
          </Button>
        </div>
      )}
    </div>
  )
}
