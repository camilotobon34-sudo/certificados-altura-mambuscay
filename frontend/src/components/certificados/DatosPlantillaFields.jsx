import { Building2 } from 'lucide-react'
import { Input, Select } from '../ui/Field.jsx'
import { useApi } from '../../hooks/useApi.js'
import { api } from '../../lib/api.js'
import { empresaPorDefecto } from '../../lib/datos-plantilla.js'
import { EMPRESAS_PLANTILLAS, empresaDeCurso, plantillaDeCurso } from '../../lib/plantillas.js'

const normalizar = (texto = '') => texto.trim().replace(/\s+/g, ' ').toUpperCase()

// Las de certificados ya emitidos traen los datos más recientes y reemplazan a las de las plantillas.
const unirEmpresas = (usadas) => {
  const porNombre = new Map(EMPRESAS_PLANTILLAS.map((x) => [normalizar(x.empresa), x]))
  for (const x of usadas) porNombre.set(normalizar(x.empresa), x)
  return [...porNombre.values()].sort((a, b) => a.empresa.localeCompare(b.empresa, 'es'))
}

export function DatosPlantillaFields({ values, curso, onChange, errors = {}, onClearError }) {
  const usadas = useApi((signal) => api.get('/certificados/empresas', undefined, { signal })).data?.items ?? []
  const empresas = unirEmpresas(usadas)
  const set = (campo) => (e) => {
    onChange({ ...values, [campo]: e.target.value })
    if (errors[campo]) onClearError?.(campo)
  }
  // Al elegir una empresa ya usada se completan sus demás datos.
  const setEmpresa = (e) => {
    const empresa = e.target.value
    const conocida = empresas.find((x) => normalizar(x.empresa) === normalizar(empresa))
    onChange({
      ...values,
      empresa,
      ...(conocida && {
        empresa: conocida.empresa,
        nitEmpresa: conocida.nitEmpresa ?? '',
        representanteLegal: conocida.representanteLegal ?? '',
        documentoRepresentante: conocida.documentoRepresentante ?? '',
        arl: conocida.arl || values.arl,
      }),
    })
    if (errors.empresa) onClearError?.('empresa')
  }
  // Si la empresa es la que traía la plantilla del entrenador anterior, se cambia por la del nuevo.
  const setEntrenador = (e) => {
    const entrenador = e.target.value
    const deLaPlantilla = normalizar(values.empresa) === normalizar(empresaDeCurso(curso, values.entrenador)?.empresa ?? '')
    onChange({ ...values, entrenador, ...(deLaPlantilla && empresaPorDefecto(curso, entrenador)) })
    if (errors.entrenador) onClearError?.('entrenador')
  }
  const empresaCurso = empresaDeCurso(curso, values.entrenador)
  const esDeLaPlantilla = Boolean(empresaCurso) && normalizar(values.empresa) === normalizar(empresaCurso.empresa)
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
        {esDeLaPlantilla && (
          <p className="mb-4 rounded-[var(--radius-control)] bg-accent-soft px-3 py-2 text-sm text-ink">
            Viene de la plantilla de este curso. Si la persona trabaja en otra empresa, escríbala o elíjala de la lista.
          </p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Nombre de la empresa"
            value={values.empresa}
            onChange={setEmpresa}
            error={errors.empresa}
            maxLength={200}
            list="empresas-usadas"
            autoComplete="off"
            placeholder="Escriba y elija de la lista, o escriba una nueva"
            hint={
              empresas.length
                ? 'Si la empresa ya se usó antes, al elegirla se llenan solos el NIT, el representante y su cédula.'
                : undefined
            }
          />
          <datalist id="empresas-usadas">
            {empresas.map((x) => (
              <option key={x.empresa} value={x.empresa}>
                {x.nitEmpresa ? `NIT ${x.nitEmpresa}` : ''}
              </option>
            ))}
          </datalist>
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
            <Select label="Entrenador que firma" required options={opciones} value={values.entrenador} onChange={setEntrenador} error={errors.entrenador} />
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
