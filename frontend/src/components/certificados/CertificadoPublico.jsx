import { ShieldAlert, ShieldCheck, ShieldX } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge.jsx'
import { GuardarCertificadoButton } from './GuardarCertificadoButton.jsx'
import { ESTADOS } from '../../lib/constants.js'
import { constanciaDesdePublico } from '../../lib/constancia.js'
import { formatDate, formatDateTime } from '../../lib/format.js'

const RESULT_COPY = {
  VIGENTE: { icon: ShieldCheck, title: 'Certificado vigente', subtitle: 'El certificado es auténtico y se encuentra vigente.' },
  VENCIDO: { icon: ShieldAlert, title: 'Certificado vencido', subtitle: null },
  SUSPENDIDO: { icon: ShieldAlert, title: 'Certificado suspendido', subtitle: 'El certificado es auténtico, pero actualmente está suspendido por el centro de formación.' },
  ANULADO: { icon: ShieldX, title: 'Certificado anulado — no válido', subtitle: 'Este certificado fue anulado por el centro de formación y no tiene validez.' },
}

export function DataRow({ label, children, mono = false }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-line py-3 last:border-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt className="text-sm text-muted">{label}</dt>
      <dd className={`font-semibold text-ink sm:text-right ${mono ? 'font-mono tracking-wide' : ''}`}>{children}</dd>
    </div>
  )
}

export function MessagePanel({ icon: Icon, title, children, as: Heading = 'h1' }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface-elevated p-6 text-center shadow-[var(--shadow-elevation-1)]">
      <Icon className="mx-auto size-12 text-muted" aria-hidden="true" />
      <Heading className="mt-3 text-2xl text-ink">{title}</Heading>
      <div className="mt-2 text-muted">{children}</div>
    </div>
  )
}

/**
 * Resultado público de un certificado (P-03a–e). Solo datos de RF-16.
 * `persona` se pasa en la consulta por documento; en la consulta por código los datos
 * de la persona vienen en el propio certificado.
 */
export function CertificadoPublicoCard({ certificado: c, persona, consultadoEn, mostrarPersona = true, headingLevel = 'h1' }) {
  const estado = ESTADOS[c.estado]
  const copy = RESULT_COPY[c.estado]
  const Icon = copy.icon
  const Heading = headingLevel
  const p = persona ?? c

  return (
    <article className={`overflow-hidden rounded-[var(--radius-card)] border-2 bg-surface-elevated shadow-[var(--shadow-elevation-2)] ${estado.border}`}>
      <header className={`flex items-center gap-4 p-5 text-white ${estado.solid}`}>
        <Icon className="size-12 shrink-0" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/85">Estado: {estado.label}</p>
          <Heading className="text-2xl uppercase leading-tight sm:text-3xl">{copy.title}</Heading>
        </div>
      </header>
      <p className={`px-5 py-3 text-sm font-medium ${estado.soft} ${estado.text}`}>
        {copy.subtitle ?? `El certificado venció el ${formatDate(c.fecha_vencimiento)}.`}
      </p>

      <dl className="px-5 py-2">
        {mostrarPersona && (
          <>
            <DataRow label="Nombre completo">{p.nombre_completo}</DataRow>
            <DataRow label="Documento" mono>
              {p.tipo_documento} {p.numero_documento_enmascarado}
            </DataRow>
          </>
        )}
        <DataRow label="Programa">{c.curso}</DataRow>
        <DataRow label="Nivel">{c.nivel_formacion ?? c.tipo_actividad}</DataRow>
        <DataRow label="Tipo de formación">{c.tipo_actividad}</DataRow>
        <DataRow label="Intensidad horaria">{c.intensidad_horaria} horas</DataRow>
        <DataRow label="Número de certificado" mono>
          {c.numero_certificado}
        </DataRow>
        <DataRow label="Fecha de expedición">{formatDate(c.fecha_expedicion)}</DataRow>
        <DataRow label="Fecha de vencimiento">{formatDate(c.fecha_vencimiento)}</DataRow>
        <DataRow label="Estado">
          <StatusBadge estado={c.estado} />
        </DataRow>
        <DataRow label="Centro de formación">{c.centro_formacion}</DataRow>
      </dl>

      {c.estado === 'VIGENTE' && (
        <div className="px-5 pb-5">
          <GuardarCertificadoButton constancia={constanciaDesdePublico(c, persona, consultadoEn)} size="lg" />
        </div>
      )}

      <footer className="border-t border-line bg-surface px-5 py-3 text-xs text-muted">
        Consultado el {formatDateTime(consultadoEn)} · Código de consulta {c.codigo_verificacion}
      </footer>
    </article>
  )
}
