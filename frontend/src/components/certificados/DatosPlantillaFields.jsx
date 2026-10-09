import { Input, Select } from '../ui/Field.jsx'
import { plantillaDeCurso } from '../../lib/plantillas.js'

export function DatosPlantillaFields({ values, curso, onChange, errors = {}, onClearError }) {
  const set = (campo) => (e) => {
    onChange({ ...values, [campo]: e.target.value })
    if (errors[campo]) onClearError?.(campo)
  }
  const entrenadores = plantillaDeCurso(curso)?.entrenadores ?? []
  const opciones = [...new Set([...entrenadores, values.entrenador].filter(Boolean))].map((n) => ({ value: n, label: n }))

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <p className="text-sm text-muted md:col-span-2">
        Ya viene lleno con los datos de siempre (y la empresa del último certificado de la persona). Cambie solo lo que sea
        distinto; lo que quede vacío no sale en el certificado.
      </p>
      <Input label="Empresa (empleador)" value={values.empresa} onChange={set('empresa')} error={errors.empresa} maxLength={200} />
      <Input label="NIT de la empresa" value={values.nitEmpresa} onChange={set('nitEmpresa')} error={errors.nitEmpresa} maxLength={30} className="font-mono" />
      <Input
        label="Representante legal del empleador"
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
      <Input label="ARL" value={values.arl} onChange={set('arl')} error={errors.arl} maxLength={100} placeholder="Ej. SURA" />
      {opciones.length > 0 ? (
        <Select label="Entrenador que firma" required options={opciones} value={values.entrenador} onChange={set('entrenador')} error={errors.entrenador} />
      ) : (
        <Input label="Entrenador que firma" value={values.entrenador} onChange={set('entrenador')} error={errors.entrenador} maxLength={150} />
      )}
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
  )
}
