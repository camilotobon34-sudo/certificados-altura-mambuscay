import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { QrCode, RotateCcw, Search, ShieldAlert, ShieldX, WifiOff } from 'lucide-react'
import { LogoSymbol } from '../../components/brand/Logo.jsx'
import { CertificadoPublicoCard, MessagePanel } from '../../components/certificados/CertificadoPublico.jsx'
import { Alert } from '../../components/ui/Alert.jsx'
import { Button } from '../../components/ui/Button.jsx'
import { Input, Select } from '../../components/ui/Field.jsx'
import { Spinner } from '../../components/ui/Feedback.jsx'
import { api } from '../../lib/api.js'
import { NOMBRE_SISTEMA } from '../../lib/brand.js'
import { extractVerificationCode, looksLikeCertificateNumber } from '../../lib/verification.js'

// Respaldo si no hay conexión al cargar; los códigos coinciden con tipos_documento.
const TIPOS_RESPALDO = [
  { codigo: 'CC', nombre: 'Cédula de ciudadanía' },
  { codigo: 'CE', nombre: 'Cédula de extranjería' },
  { codigo: 'PA', nombre: 'Pasaporte' },
  { codigo: 'PPT', nombre: 'Permiso por protección temporal' },
  { codigo: 'TI', nombre: 'Tarjeta de identidad' },
]
const ORDEN_TIPOS = TIPOS_RESPALDO.map((t) => t.codigo)
const TIPOS_ALFANUMERICOS = new Set(['PA', 'PPT'])

const NO_VERIFICADO = 'No fue posible verificar el certificado con los datos ingresados.'

const ordenarTipos = (tipos) =>
  [...tipos].sort((a, b) => {
    const ia = ORDEN_TIPOS.indexOf(a.codigo)
    const ib = ORDEN_TIPOS.indexOf(b.codigo)
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib)
  })

// Consulta pública (RF-15, RF-16): tipo + número de documento + código del certificado.
// /verificar/:codigo (destino de los QR) precarga el código.
export default function ConsultaCertificadoPage() {
  const { codigo: codigoRuta } = useParams()
  const [tipos, setTipos] = useState(TIPOS_RESPALDO)
  const [form, setForm] = useState(() => ({
    tipoDocumento: '',
    numeroDocumento: '',
    codigo: codigoRuta ? extractVerificationCode(codigoRuta) : '',
  }))
  const [fieldErrors, setFieldErrors] = useState({})
  const [estado, setEstado] = useState('idle')
  const [resultado, setResultado] = useState(null)
  const [requestError, setRequestError] = useState(null)
  const resultadoRef = useRef(null)
  const primerCampoRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    api
      .get('/public/tipos-documento', undefined, { signal: controller.signal })
      .then(({ tipos: remotos }) => remotos?.length && setTipos(ordenarTipos(remotos)))
      .catch(() => {})
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (estado === 'done' || estado === 'error') {
      resultadoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      resultadoRef.current?.focus({ preventScroll: true })
    }
  }, [estado])

  const set = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }))
    setFieldErrors((prev) => ({ ...prev, [campo]: undefined }))
  }

  const validar = () => {
    const errors = {}
    if (!form.tipoDocumento) errors.tipoDocumento = 'Seleccione el tipo de documento.'
    if (!/^[A-Za-z0-9]{3,30}$/.test(form.numeroDocumento.replace(/[\s.-]/g, ''))) {
      errors.numeroDocumento = 'Ingrese un número de identificación válido.'
    }
    if (!/^[A-Za-z0-9-]{4,64}$/.test(form.codigo.replace(/\s/g, ''))) {
      errors.codigo = 'Ingrese el código de verificación del certificado.'
    } else if (looksLikeCertificateNumber(extractVerificationCode(form.codigo))) {
      errors.codigo =
        'Ese es el número de certificado. Ingrese el código de verificación que aparece junto al código QR.'
    }
    return errors
  }

  const consultar = async (event) => {
    event.preventDefault()
    const errors = validar()
    setFieldErrors(errors)
    if (Object.keys(errors).length) return

    setEstado('loading')
    setRequestError(null)
    setResultado(null)
    try {
      setResultado(await api.post('/public/consulta', { ...form, codigo: extractVerificationCode(form.codigo) }))
      setEstado('done')
    } catch (error) {
      if (error.status === 400 && Object.keys(error.fieldErrors).length) {
        setFieldErrors(error.fieldErrors)
        setEstado('idle')
        return
      }
      setRequestError(error)
      setEstado('error')
    }
  }

  const nuevaConsulta = () => {
    setForm({ tipoDocumento: '', numeroDocumento: '', codigo: '' })
    setResultado(null)
    setRequestError(null)
    setEstado('idle')
    window.scrollTo({ top: 0, behavior: 'smooth' })
    primerCampoRef.current?.focus()
  }

  let errorPanel = null
  if (estado === 'error') {
    if (requestError?.isNetwork) {
      errorPanel = (
        <MessagePanel icon={WifiOff} title="Sin conexión" as="h2">
          No fue posible realizar la consulta. Revise su conexión a internet e intente de nuevo.
        </MessagePanel>
      )
    } else if (requestError?.status === 404) {
      errorPanel = (
        <MessagePanel icon={ShieldX} title="Certificado no verificado" as="h2">
          <p className="font-semibold text-ink">{NO_VERIFICADO}</p>
          <p className="mt-2 text-sm">
            Revise el tipo y número de documento y el código impreso en su certificado. Si el problema continúa,
            comuníquese con el centro de formación.
          </p>
        </MessagePanel>
      )
    } else {
      errorPanel = (
        <MessagePanel icon={ShieldAlert} title="No fue posible consultar" as="h2">
          {requestError?.message}
        </MessagePanel>
      )
    }
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-4 py-8 sm:py-12">
      <section className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface-elevated shadow-[var(--shadow-elevation-2)]">
        <header className="flex items-center gap-3 bg-primary px-5 py-4 text-white sm:px-6">
          <LogoSymbol className="h-14" />
          <div className="leading-tight">
            <p className="font-display text-lg font-bold uppercase tracking-wider">{NOMBRE_SISTEMA}</p>
            <h1 className="text-2xl text-white sm:text-3xl">Consulta de certificados</h1>
          </div>
        </header>
        <div className="h-1 bg-accent" aria-hidden="true" />

        <form onSubmit={consultar} noValidate className="flex flex-col gap-4 p-5 sm:p-6">
          <p className="text-muted">
            Ingrese sus datos y el código de verificación que aparece en su certificado de formación en trabajo en alturas
            (Resolución 4272 de 2021). No necesita crear una cuenta.
          </p>
          {codigoRuta && (
            <Alert tone="info" title="Código cargado desde el QR">
              Para ver el certificado, confirme el tipo y número de documento del titular.
            </Alert>
          )}
          <Select
            ref={primerCampoRef}
            label="Tipo de documento"
            required
            placeholder="Seleccione el tipo de documento"
            options={tipos.map((t) => ({ value: t.codigo, label: `${t.nombre} (${t.codigo})` }))}
            value={form.tipoDocumento}
            onChange={set('tipoDocumento')}
            error={fieldErrors.tipoDocumento}
          />
          <Input
            label="Número de identificación"
            required
            placeholder="Sin puntos ni espacios"
            value={form.numeroDocumento}
            onChange={set('numeroDocumento')}
            error={fieldErrors.numeroDocumento}
            inputMode={TIPOS_ALFANUMERICOS.has(form.tipoDocumento) ? 'text' : 'numeric'}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={30}
            className="font-mono tracking-wider"
          />
          <Input
            label="Código de verificación"
            required
            placeholder="Ej. 7K4P-X9QM-2RTD"
            hint="Está impreso en su certificado, junto al código QR."
            value={form.codigo}
            onChange={set('codigo')}
            error={fieldErrors.codigo}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            maxLength={64}
            className="font-mono uppercase tracking-wider"
          />
          <Button type="submit" size="lg" icon={Search} loading={estado === 'loading'} className="uppercase tracking-wide">
            Consultar certificado
          </Button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface px-5 py-3 sm:px-6">
          <p className="text-sm text-muted">¿Tiene el código QR del certificado?</p>
          <Button to="/escanear" variant="ghost" size="sm" icon={QrCode}>
            Escanear QR
          </Button>
        </div>
      </section>

      <div ref={resultadoRef} tabIndex={-1} aria-live="polite" className="scroll-mt-4 outline-none">
        {estado === 'loading' && <Spinner label="Verificando certificado..." className="py-10" />}

        {errorPanel && (
          <div className="flex flex-col gap-4">
            {errorPanel}
            <Button variant="secondary" icon={RotateCcw} onClick={() => setEstado('idle')}>
              Corregir datos
            </Button>
          </div>
        )}

        {estado === 'done' && resultado && (
          <div className="flex flex-col gap-5">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-muted">Resultado de consulta</h2>
            <CertificadoPublicoCard certificado={resultado.certificado} consultadoEn={resultado.consultadoEn} headingLevel="h3" />
            <Button variant="secondary" icon={RotateCcw} onClick={nuevaConsulta}>
              Nueva consulta
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
