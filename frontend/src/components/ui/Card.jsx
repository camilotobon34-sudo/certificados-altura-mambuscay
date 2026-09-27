export function Card({ as: Tag = 'section', title, actions, className = '', bodyClassName = '', children }) {
  return (
    <Tag
      className={`rounded-[var(--radius-card)] border border-line bg-surface-elevated shadow-[var(--shadow-elevation-1)] ${className}`}
    >
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title && <h2 className="text-xl text-ink">{title}</h2>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </header>
      )}
      <div className={bodyClassName || 'p-5'}>{children}</div>
    </Tag>
  )
}
