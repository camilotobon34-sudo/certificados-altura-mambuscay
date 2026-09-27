import { useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '../ui/Button.jsx'

// El generador de PDF se carga bajo demanda para no pesar en la consulta pública.
export function GuardarCertificadoButton({ constancia, variant = 'accent', size = 'md', className = '' }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const guardar = async () => {
    setSaving(true)
    setError('')
    try {
      const { descargarConstanciaPdf } = await import('../../lib/constancia-pdf.js')
      await descargarConstanciaPdf(constancia)
    } catch {
      setError('No fue posible generar el certificado. Revise su conexión e intente de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 print:hidden ${className}`}>
      <Button variant={variant} size={size} icon={FileDown} loading={saving} onClick={guardar} className="w-full uppercase tracking-wide">
        Guardar certificado
      </Button>
      {error && (
        <p role="alert" className="text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
