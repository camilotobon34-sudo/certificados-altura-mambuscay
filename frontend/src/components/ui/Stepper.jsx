import { Check } from 'lucide-react'

export function Stepper({ steps, current }) {
  return (
    <ol className="mb-6 grid gap-2 sm:grid-cols-4" aria-label="Pasos">
      {steps.map((label, index) => {
        const done = index < current
        const active = index === current
        return (
          <li
            key={label}
            aria-current={active ? 'step' : undefined}
            className={`flex items-center gap-3 rounded-[var(--radius-control)] border px-3 py-2 text-sm ${
              active ? 'border-primary bg-primary text-white' : done ? 'border-success/40 bg-success-soft text-success' : 'border-line bg-surface-elevated text-muted'
            }`}
          >
            <span
              className={`inline-flex size-7 shrink-0 items-center justify-center rounded-full font-semibold ${
                active ? 'bg-accent text-white' : done ? 'bg-success text-white' : 'bg-surface text-muted'
              }`}
            >
              {done ? <Check className="size-4" aria-hidden="true" /> : index + 1}
            </span>
            <span className="font-medium">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
