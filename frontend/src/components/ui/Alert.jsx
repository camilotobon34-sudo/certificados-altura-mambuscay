import { CircleCheck, Info, TriangleAlert, CircleX } from 'lucide-react'

const TONES = {
  info: { icon: Info, classes: 'bg-info-soft text-info border-info/30' },
  success: { icon: CircleCheck, classes: 'bg-success-soft text-success border-success/30' },
  warning: { icon: TriangleAlert, classes: 'bg-warning-soft text-warning border-warning/30' },
  error: { icon: CircleX, classes: 'bg-danger-soft text-danger border-danger/30' },
}

export function Alert({ tone = 'info', title, children, className = '' }) {
  const { icon: Icon, classes } = TONES[tone]
  return (
    <div role={tone === 'error' ? 'alert' : 'status'} className={`flex gap-3 rounded-[var(--radius-control)] border p-3 ${classes} ${className}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="text-sm">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-ink/90">{children}</div>}
      </div>
    </div>
  )
}
