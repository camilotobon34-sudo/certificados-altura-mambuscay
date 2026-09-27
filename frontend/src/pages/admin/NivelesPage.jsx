import { Alert } from '../../components/ui/Alert.jsx'
import { Card } from '../../components/ui/Card.jsx'
import { ErrorState, Spinner } from '../../components/ui/Feedback.jsx'
import { PageHeader } from '../../components/ui/PageHeader.jsx'
import { Table } from '../../components/ui/Table.jsx'
import { useCatalogos } from '../../hooks/useCatalogos.js'

const columns = [
  { key: 'codigo', header: 'Código', className: 'font-mono text-xs' },
  { key: 'nombre', header: 'Nivel' },
  { key: 'intensidad_minima_horas', header: 'Intensidad mínima', render: (n) => `${n.intensidad_minima_horas} horas`, className: 'whitespace-nowrap' },
  { key: 'descripcion', header: 'Detalle normativo', render: (n) => <span className="text-muted">{n.descripcion}</span> },
]

// I-07: Niveles de formación (HU-07). Catálogo fijado por la Res. 4272 de 2021, Art. 10.
export default function NivelesPage() {
  const { data, error, loading, reload } = useCatalogos()
  return (
    <>
      <PageHeader title="Niveles de formación" description="Niveles definidos por la Resolución 4272 de 2021 (Artículo 10)." />
      <Alert tone="info" title="El reentrenamiento no es un nivel de formación" className="mb-6">
        Res. 4272 de 2021, Art. 27: se gestiona como tipo de actividad, con mínimo 8 horas (20 % teórico y 80 % práctico).
      </Alert>
      <Card bodyClassName="p-0">
        {loading && <Spinner />}
        {error && <div className="p-5"><ErrorState error={error} onRetry={reload} /></div>}
        {data && <Table columns={columns} rows={data.niveles} />}
      </Card>
    </>
  )
}
