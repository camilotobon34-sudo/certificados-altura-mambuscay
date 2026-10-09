import { Lock, PencilLine } from 'lucide-react'
import { datosFijos } from '../../lib/plantillas.js'

const LO_QUE_CAMBIA = [
  'Nombre y cédula de la persona',
  'Fecha del certificado (sale en letras sola) y fechas de la formación',
  'Horas del curso y código del certificado (el código se asigna solo)',
  'Empresa, solo si la persona trabaja en otra distinta a la de la plantilla',
  'Entrenador que firma, si el curso tiene más de uno',
]

function Fila({ etiqueta, children }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:gap-4">
      <dt className="shrink-0 text-xs font-medium tracking-wide text-muted uppercase sm:w-40 sm:pt-0.5">{etiqueta}</dt>
      <dd className="min-w-0 text-sm text-ink">{children}</dd>
    </div>
  )
}

// Información de la plantilla Word del curso: sale igual en todos sus certificados.
export function InfoFijaCurso({ plantilla, compacto = false }) {
  const f = datosFijos(plantilla)
  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Lock className="size-4 text-primary" aria-hidden="true" />
          Sale igual en todos los certificados de este curso
        </h3>
        <dl className="mt-1 divide-y divide-line">
          <Fila etiqueta="Título">{f.titulo}</Fila>
          <Fila etiqueta="Curso aprobado">{f.curso}</Fila>
          <Fila etiqueta="Centro">
            {compacto ? f.centro.slice(0, 3).join(' · ') : f.centro.map((l) => <span key={l} className="block">{l}</span>)}
          </Fila>
          <Fila etiqueta="Lugar donde se firma">{f.lugar}</Fila>
          <Fila etiqueta="Representante legal">{f.representante}</Fila>
          <Fila etiqueta={f.entrenadores.length > 1 ? 'Entrenadores' : 'Entrenador'}>
            {f.entrenadores.map((e) => (
              <span key={e.nombre} className="block">
                {e.nombre}
                {e.licencia && <span className="text-muted"> · Licencia S.O {e.licencia}</span>}
              </span>
            ))}
          </Fila>
          <Fila etiqueta="ARL">{f.arl} (se puede cambiar si el trabajador tiene otra)</Fila>
          {f.empresas.length > 0 && (
            <Fila etiqueta="Empresa">
              {f.empresas.map((e) => (
                <span key={e.entrenador} className="block">
                  {e.empresa}
                  {f.empresas.length > 1 && <span className="text-muted"> · con {e.entrenador}</span>}
                </span>
              ))}
              <span className="block text-muted">Viene llena; se cambia si la persona trabaja en otra.</span>
            </Fila>
          )}
          {f.contacto && !compacto && <Fila etiqueta="Autenticidad">{f.contacto}</Fila>}
        </dl>
      </section>
      <section className="rounded-[var(--radius-control)] bg-accent-soft p-3">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <PencilLine className="size-4 text-warning" aria-hidden="true" />
          Lo único que se llena en cada certificado
        </h3>
        <ul className="mt-1 list-disc pl-5 text-sm text-ink">
          {LO_QUE_CAMBIA.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
