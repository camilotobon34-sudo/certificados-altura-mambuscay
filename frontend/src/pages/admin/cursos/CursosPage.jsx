import { useState } from 'react'
import { Link } from 'react-router'
import { Award, BookOpen, BookPlus, ChevronDown, Clock, FileText, Hash, UserRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { plantillaDeCurso } from '../../../lib/plantillas.js'

function Miniatura({ plantilla, inactivo }) {
  if (!plantilla) {
    return (
      <div className="flex aspect-[3/4] w-20 shrink-0 self-start flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] border border-dashed border-line bg-surface text-center text-[11px] text-muted sm:w-28">
        <FileText className="size-6" aria-hidden="true" />
        Sin plantilla
      </div>
    )
  }
  return (
    <div className="relative aspect-[3/4] w-20 shrink-0 self-start overflow-hidden rounded-[var(--radius-control)] border border-line bg-white shadow-[var(--shadow-elevation-1)] sm:w-28">
      <img
        src={plantilla.fondo}
        alt={`Plantilla ${plantilla.nombre}`}
        loading="lazy"
        className={`size-full object-fill ${inactivo ? 'grayscale' : ''}`}
      />
      <span className="absolute inset-x-0 bottom-0 bg-primary/85 px-1 py-0.5 text-center text-[10px] font-semibold tracking-wide text-white uppercase">
        {plantilla.nombre}
      </span>
    </div>
  )
}

function Dato({ icon: Icon, etiqueta, children }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="flex items-center gap-1 text-xs font-medium tracking-wide text-muted uppercase">
        <Icon className="size-3.5" aria-hidden="true" />
        {etiqueta}
      </dt>
      <dd className="text-sm font-semibold text-ink">{children}</dd>
    </div>
  )
}

function CursoCard({ curso, numero }) {
  const plantilla = plantillaDeCurso(curso)
  const inactivo = !curso.activo
  return (
    <Link
      to={`/admin/cursos/${curso.id}/editar`}
      aria-label={`Editar ${curso.nombre}`}
      className={`group flex gap-4 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 shadow-[var(--shadow-elevation-1)] transition hover:border-primary/40 hover:shadow-[var(--shadow-elevation-2)] sm:gap-6 sm:p-5 ${
        inactivo ? 'opacity-70' : ''
      }`}
    >
      <Miniatura plantilla={plantilla} inactivo={inactivo} />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {numero && <p className="text-xs font-semibold tracking-wide text-accent uppercase">Curso {numero}</p>}
            <h2 className="text-xl leading-snug text-ink group-hover:text-primary">{curso.nombre}</h2>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              inactivo ? 'bg-surface text-muted' : 'bg-success-soft text-success'
            }`}
          >
            {inactivo ? 'Inactivo' : 'Activo'}
          </span>
        </div>
        {curso.descripcion && <p className="line-clamp-2 text-sm text-muted">{curso.descripcion}</p>}
        <dl className="mt-auto grid grid-cols-1 gap-x-6 gap-y-3 border-t border-line pt-3 sm:grid-cols-2 lg:grid-cols-4">
          <Dato icon={Hash} etiqueta="Próximo código">
            {curso.proximoCodigo ? (
              <span className="font-mono whitespace-nowrap">{curso.proximoCodigo}</span>
            ) : (
              <span className="text-muted">Sin prefijo</span>
            )}
          </Dato>
          <Dato icon={Clock} etiqueta="Intensidad">{curso.intensidadHoraria} horas</Dato>
          <Dato icon={UserRound} etiqueta={plantilla?.entrenadores.length === 1 ? 'Entrenador' : 'Entrenadores'}>
            {plantilla ? plantilla.entrenadores.join(', ') : <span className="text-muted">—</span>}
          </Dato>
          <Dato icon={Award} etiqueta="Certificados">{curso.certificadosEmitidos}</Dato>
        </dl>
      </div>
    </Link>
  )
}

function Estadistica({ icon: Icon, valor, etiqueta }) {
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 shadow-[var(--shadow-elevation-1)]">
      <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span>
        <span className="block font-display text-3xl font-semibold text-ink">{valor}</span>
        <span className="text-sm text-muted">{etiqueta}</span>
      </span>
    </div>
  )
}

// I-05: Cursos — cada curso por separado, con su plantilla, código y entrenadores (HU-08).
export default function CursosPage() {
  const { data, error, loading, reload } = useApi((signal) => api.get('/cursos', undefined, { signal }))
  const [verInactivos, setVerInactivos] = useState(false)

  const cursos = data?.items ?? []
  const activos = cursos.filter((c) => c.activo)
  const inactivos = cursos.filter((c) => !c.activo)
  const totalCertificados = cursos.reduce((suma, c) => suma + c.certificadosEmitidos, 0)
  const plantillasEnUso = new Set(activos.map((c) => plantillaDeCurso(c)?.nombre).filter(Boolean)).size

  return (
    <>
      <PageHeader
        title="Cursos"
        description="Cada curso tiene su propia plantilla de certificado, su código y su consecutivo anual."
        actions={<Button to="/admin/cursos/nuevo" icon={BookPlus}>Nuevo curso</Button>}
      />

      {loading && <Spinner />}
      {error && <ErrorState error={error} onRetry={reload} />}

      {data && (
        <div className="flex flex-col gap-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <Estadistica icon={BookOpen} valor={activos.length} etiqueta="Cursos activos" />
            <Estadistica icon={FileText} valor={plantillasEnUso} etiqueta="Plantillas en uso" />
            <Estadistica icon={Award} valor={totalCertificados} etiqueta="Certificados emitidos" />
          </div>

          {activos.length === 0 && (
            <Card>
              <EmptyState title="No hay cursos activos" description="Cree un curso para poder emitir certificados." />
            </Card>
          )}

          <div className="flex flex-col gap-4">
            {activos.map((curso, i) => (
              <CursoCard key={curso.id} curso={curso} numero={i + 1} />
            ))}
          </div>

          {inactivos.length > 0 && (
            <section>
              <button
                type="button"
                onClick={() => setVerInactivos((v) => !v)}
                aria-expanded={verInactivos}
                className="mb-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted hover:text-primary"
              >
                <ChevronDown className={`size-4 transition-transform ${verInactivos ? 'rotate-180' : ''}`} aria-hidden="true" />
                Cursos inactivos ({inactivos.length})
              </button>
              {verInactivos && (
                <div className="flex flex-col gap-4">
                  {inactivos.map((curso) => (
                    <CursoCard key={curso.id} curso={curso} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </>
  )
}
