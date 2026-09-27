import { LOGO_URL, NOMBRE_EMPRESA, NOMBRE_SISTEMA } from '../../lib/brand.js'

// El logo oficial tiene fondo blanco: se presenta sobre una placa blanca redondeada para que
// se integre también en fondos oscuros. Solo se fija la altura para no deformarlo.
export function LogoSymbol({ className = 'h-11' }) {
  return (
    <img
      src={LOGO_URL}
      alt="Logo Altura Mambuscay"
      className={`w-auto shrink-0 rounded-md bg-white object-contain p-0.5 ${className}`}
      draggable="false"
    />
  )
}

// Variantes de docs/06-prototipo-figma (6.3): horizontal, apilada y negativo.
// El wordmark se lee "CERTIFICADOS / ALTURA MAMBUSCAY".
export function Logo({ variant = 'horizontal', negative = false, className = '' }) {
  const main = negative ? 'text-white' : 'text-primary'
  const sub = negative ? 'text-white/75' : 'text-muted'

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 text-center ${className}`} aria-label={NOMBRE_SISTEMA}>
        <LogoSymbol className="h-28" />
        <div className="leading-none">
          <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${sub}`}>Certificados</p>
          <p className={`mt-1 font-display text-4xl font-bold uppercase tracking-wider ${main}`}>{NOMBRE_EMPRESA}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`} aria-label={NOMBRE_SISTEMA}>
      <LogoSymbol className="h-11" />
      <div className="min-w-0 leading-none">
        <p className={`text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${sub}`}>Certificados</p>
        <p className={`mt-0.5 whitespace-nowrap font-display text-lg font-bold uppercase tracking-wide ${main}`}>
          {NOMBRE_EMPRESA}
        </p>
      </div>
    </div>
  )
}
