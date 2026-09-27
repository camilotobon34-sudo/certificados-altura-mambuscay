import { useId } from 'react'

const controlClasses = (error) =>
  `w-full rounded-[var(--radius-control)] border bg-surface-elevated px-3 text-ink placeholder:text-muted/70 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-surface disabled:text-muted ${
    error ? 'border-danger' : 'border-line'
  }`

function FieldWrapper({ id, label, hint, error, required, badge, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="flex items-center gap-2 text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger" aria-hidden="true">*</span>}
          {badge}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-sm text-muted">{hint}</p>
      )}
    </div>
  )
}

const describedBy = (id, error, hint) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined)

export function Input({ label, hint, error, required, badge, className = '', ...props }) {
  const id = useId()
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} badge={badge}>
      <input
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`h-11 ${controlClasses(error)} ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Select({ label, hint, error, required, badge, options = [], placeholder, className = '', ...props }) {
  const id = useId()
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} badge={badge}>
      <select
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`h-11 ${controlClasses(error)} ${className}`}
        {...props}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  )
}

export function Textarea({ label, hint, error, required, badge, className = '', ...props }) {
  const id = useId()
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} badge={badge}>
      <textarea
        id={id}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        className={`min-h-24 py-2 ${controlClasses(error)} ${className}`}
        {...props}
      />
    </FieldWrapper>
  )
}

export function Checkbox({ label, className = '', ...props }) {
  const id = useId()
  return (
    <label htmlFor={id} className={`inline-flex min-h-11 items-center gap-2 text-sm font-medium ${className}`}>
      <input id={id} type="checkbox" className="size-4 accent-primary" {...props} />
      {label}
    </label>
  )
}
