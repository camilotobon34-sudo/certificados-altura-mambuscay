import { useEffect, useRef, useState } from 'react'
import { FileDown } from 'lucide-react'
import { Button } from '../ui/Button.jsx'
import { plantillaDeCurso } from '../../lib/plantillas.js'

// El generador de PDF se carga bajo demanda para no pesar en la consulta pública.
export function GuardarCertificadoButton({ constancia, automatico = false, variant = 'accent', size = 'md', className = '' }) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [descargado, setDescargado] = useState(false)
  const yaDescargo = useRef(false)

  const guardar = async () => {
    setSaving(true)
    setError('')
    try {
      if (plantillaDeCurso(constancia)) {
        const { descargarCertificadoPdf } = await import('../../lib/certificado-pdf.js')
        await descargarCertificadoPdf(constancia)
      } else {
        const { descargarConstanciaPdf } = await import('../../lib/constancia-pdf.js')
        await descargarConstanciaPdf(constancia)
      }
      setDescargado(true)
    } catch {
      setError('No fue posible generar el certificado. Revise su conexión e intente de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    if (!automatico || yaDescargo.current) return
    yaDescargo.current = true
    guardar()
    // Solo una vez al mostrarse; volver a descargar es con el botón.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [automatico])

  return (
    <div className={`flex flex-col gap-1.5 print:hidden ${className}`}>
      <Button variant={variant} size={size} icon={FileDown} loading={saving} onClick={guardar} className="w-full uppercase tracking-wide">
        {automatico && descargado ? 'Descargar de nuevo' : 'Guardar certificado'}
      </Button>
      {automatico && descargado && !error && (
        <p className="text-center text-sm text-success">El certificado se descargó en su equipo.</p>
      )}
      {error && (
        <p role="alert" className="text-center text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
