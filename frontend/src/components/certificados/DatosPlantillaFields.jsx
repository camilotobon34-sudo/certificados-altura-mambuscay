import { Building2 } from 'lucide-react'
import { Input, Select } from '../ui/Field.jsx'
import { plantillaDeCurso } from '../../lib/plantillas.js'

export function DatosPlantillaFields({ values, curso, onChange, errors = {}, onClearError, empresaCopiada = false }) {
  const set = (campo) => (e) => {
    onChange({ ...values, [campo]: e.target.value })
    if (errors[campo]) onClearError?.(campo)
  }
  const entrenadores = plantillaDeCurso(curso)?.entrenadores ?? []
  const opciones = [...new Set([...entrenadores, values.entrenador].filter(Boolean))].map((n) => ({ value: n, label: n }))
  const esElCentro = /mambuscay/i.test(values.empresa ?? '')

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-[var(--radius-card)] border-2 border-primary/30 bg-primary/5 p-4">
        <h3 className="flex items-center gap-2 font-semibold text-ink">
          <Building2 className="size-5 text-primary" aria-hidden="true" />
          Empresa donde trabaja la persona
        </h3>
        <p className="mt-1 mb-4 text-sm text-muted">
          Es la empresa que envía al trabajador a capacitarse, <strong>no Altura Mambuscay</strong>. Sale en el certificado como
          “EMPRESA” o “EMPLEADOR”. Si la persona es independiente, deje estos datos vacíos y no saldrán.
        </p>
        {esElCentro && (
          <p role="alert" className="mb-4 rounded-[var(--radius-control)] border border-warning bg-warning-soft px-3 py-2 text-sm font-medium text-ink">
            Ojo: escribió Altura Mambuscay. Aquí va la empresa donde trabaja la persona, no el centro de capacitación. Si es
            independiente, deje el nombre vacío.
          </p>
        )}
        {empresaCopiada && values.empresa && !esElCentro && (
          <p className="mb-4 rounded-[var(--radius-control)] bg-accent-soft px-3 py-2 text-sm text-ink">
            Se copió del último certificado de esta persona. Verifique que siga trabajando en la misma empresa.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nombre de la empresa"
            value={values.empresa}
            onChange={set('empresa')}
            error={errors.empresa}
            maxLength={200}
            placeholder="Ej. INTA INGENIERIA Y TRABAJOS DE ALTURAS SAS"
          />
          <Input label="NIT de la empresa" value={values.nitEmpresa} onChange={set('nitEmpresa')} error={errors.nitEmpresa} maxLength={30} className="font-mono" />
          <Input
            label="Representante legal de la empresa"
            value={values.representanteLegal}
            onChange={set('representanteLegal')}
            error={errors.representanteLegal}
            maxLength={150}
          />
          <Input
            label="Cédula del representante legal"
            value={values.documentoRepresentante}
            onChange={set('documentoRepresentante')}
            error={errors.documentoRepresentante}
            maxLength={30}
            className="font-mono"
          />
          <Input label="ARL del trabajador" value={values.arl} onChange={set('arl')} error={errors.arl} maxLength={100} placeholder="Ej. SURA" />
        </div>
      </section>

      <section>
        <h3 className="mb-1 font-semibold text-ink">Datos de la formación</h3>
        <p className="mb-4 text-sm text-muted">Ya vienen llenos con los datos de siempre; cambie solo lo que sea distinto.</p>
        <div className="grid gap-4 md:grid-cols-2">
          {opciones.length > 0 ? (
            <Select label="Entrenador que firma" required options={opciones} value={values.entrenador} onChange={set('entrenador')} error={errors.entrenador} />
          ) : (
            <Input label="Entrenador que firma" value={values.entrenador} onChange={set('entrenador')} error={errors.entrenador} maxLength={150} />
          )}
          <div className="hidden md:block" />
          <Input
            label="Inicio de la formación"
            type="date"
            value={values.fechaInicioFormacion}
            onChange={set('fechaInicioFormacion')}
            error={errors.fechaInicioFormacion}
          />
          <Input
            label="Fin de la formación"
            type="date"
            min={values.fechaInicioFormacion || undefined}
            value={values.fechaFinFormacion}
            onChange={set('fechaFinFormacion')}
            error={errors.fechaFinFormacion}
            hint="Sale en el certificado como “FORMACION REALIZADA EN LA CEJA ENTRE EL … AL …”."
          />
        </div>
      </section>
    </div>
  )
}
