import { LoaderCircle } from 'lucide-react'
import { Link } from 'react-router'

const VARIANTS = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-primary/50',
  secondary:
    'border border-primary bg-transparent text-primary hover:bg-primary/5 disabled:border-line disabled:text-muted',
  accent: 'bg-accent text-white hover:bg-warning disabled:bg-accent/50',
  ghost: 'bg-transparent text-primary hover:bg-primary/5 disabled:text-muted',
  danger: 'bg-danger text-white hover:bg-danger/90 disabled:bg-danger/50',
}

const SIZES = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-4 text-base gap-2',
  lg: 'h-12 px-6 text-lg gap-2',
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  to,
  className = '',
  children,
  disabled,
  type = 'button',
  ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-[var(--radius-control)] font-semibold transition-colors disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`
  const content = (
    <>
      {loading ? (
        <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && <IconRight className="size-4 shrink-0" aria-hidden="true" />}
    </>
  )

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...props}>
      {content}
    </button>
  )
}
