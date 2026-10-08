import { useState } from 'react'
import { Link } from 'react-router'
import { Award, BookOpen, BookPlus, ChevronDown, Clock, FileText, Layers, UserRound } from 'lucide-react'
import { Button } from '../../../components/ui/Button.jsx'
import { Card } from '../../../components/ui/Card.jsx'
import { EmptyState, ErrorState, Spinner } from '../../../components/ui/Feedback.jsx'
import { PageHeader } from '../../../components/ui/PageHeader.jsx'
import { useApi } from '../../../hooks/useApi.js'
import { api } from '../../../lib/api.js'
import { GRUPOS_CURSO, plantillaDeCurso } from '../../../lib/plantillas.js'

function Miniatura({ plantilla, inactivo }) {
  if (!plantilla) {
    return (
      <div className="flex aspect-[3/4] w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-[var(--radius-control)] border border-dashed border-line bg-surface text-center text-[11px] text-muted sm:w-28">
        <FileText className="size-6" aria-hidden="true" />
        Sin plantilla
      </div>
    )
  }
  return (
    <div className="relative aspect-[3/4] w-24 shrink-0 overflow-hidden rounded-[var(--radius-control)] border border-line bg-white shadow-[var(--shadow-elevation-1)] sm:w-28">
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

function CursoCard({ curso }) {
  const plantilla = plantillaDeCurso(curso)
  const inactivo = !curso.activo
  return (
    <Link
      to={`/admin/cursos/${curso.id}/editar`}
      className={`group flex gap-4 rounded-[var(--radius-card)] border border-line bg-surface-elevated p-4 shadow-[var(--shadow-elevation-1)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-elevation-2)] ${
        inactivo ? 'opacity-70' : ''
      }`}
    >
      <Miniatura plantilla={plantilla} inactivo={inactivo} />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg leading-snug text-ink group-hover:text-primary">{curso.nombre}</h3>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
              inactivo ? 'bg-surface text-muted' : 'bg-success-soft text-success'
            }`}
          >
            {inactivo ? 'Inactivo' : 'Activo'}
          </span>
        </div>
        {curso.descripcion && <p className="line-clamp-2 text-sm text-muted">{curso.descripcion}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-1 text-xs font-medium">
          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2 py-1 text-warning">
            <Clock className="size-3.5" aria-hidden="true" />
            {curso.intensidadHoraria} horas
          </span>
          {curso.nivel && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-primary">
              <Layers className="size-3.5" aria-hidden="true" />
              {curso.nivel}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-1 text-ink">
            <Award className="size-3.5" aria-hidden="true" />
            {curso.certificadosEmitidos} {curso.certificadosEmitidos === 1 ? 'certificado' : 'certificados'}
          </span>
        </div>
        {plantilla && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <UserRound className="size-3.5" aria-hidden="true" />
            {plantilla.entrenadores.join(' · ')}
          </p>
        )}
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

// I-05: Cursos — catálogo agrupado por tipo de formación, con la plantilla de cada curso (HU-08).
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
        description="Oferta de formación de Altura Mambuscay. Cada curso usa su plantilla oficial de certificado."
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

          {GRUPOS_CURSO.map((grupo) => {
            const delGrupo = activos.filter((c) => c.tipoActividadCodigo === grupo.codigo)
            if (delGrupo.length === 0) return null
            return (
              <section key={grupo.codigo} aria-labelledby={`grupo-${grupo.codigo}`}>
                <header className="mb-3 flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-accent/60 pb-2">
                  <h2 id={`grupo-${grupo.codigo}`} className="text-xl text-primary">
                    {grupo.titulo}
                  </h2>
                  <p className="text-sm text-muted">{grupo.descripcion}</p>
                </header>
                <div className="grid gap-4 xl:grid-cols-2">
                  {delGrupo.map((curso) => (
                    <CursoCard key={curso.id} curso={curso} />
                  ))}
                </div>
              </section>
            )
          })}

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
                <div className="grid gap-4 xl:grid-cols-2">
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
