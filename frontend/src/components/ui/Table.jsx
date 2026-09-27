import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Table({ columns, rows, rowKey = 'id', onRowClick, empty, minWidth = 'min-w-[640px]' }) {
  if (!rows?.length) return empty ?? null
  return (
    <div className="overflow-x-auto">
      <table className={`w-full border-collapse text-left text-sm ${minWidth}`}>
        <thead>
          <tr className="border-b border-line bg-surface text-xs uppercase tracking-wide text-muted">
            {columns.map((col) => (
              <th key={col.key} scope="col" className={`px-4 py-3 font-semibold ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-b border-line last:border-0 even:bg-surface/50 ${onRowClick ? 'cursor-pointer hover:bg-primary/5' : ''}`}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-4 py-3 align-middle ${col.className ?? ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ meta, onPage }) {
  if (!meta || meta.pages <= 1) return null
  return (
    <nav aria-label="Paginación" className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-sm">
      <span className="text-muted">
        Página {meta.page} de {meta.pages} · {meta.total} registros
      </span>
      <div className="flex gap-1">
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] border border-line disabled:opacity-40"
          onClick={() => onPage(meta.page - 1)}
          disabled={meta.page <= 1}
          aria-label="Página anterior"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className="inline-flex size-11 items-center justify-center rounded-[var(--radius-control)] border border-line disabled:opacity-40"
          onClick={() => onPage(meta.page + 1)}
          disabled={meta.page >= meta.pages}
          aria-label="Página siguiente"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </nav>
  )
}
