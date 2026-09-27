import { ESTADOS } from '../../lib/constants.js'

export function StatusBadge({ estado, size = 'md' }) {
  const config = ESTADOS[estado]
  if (!config) return null
  const Icon = config.icon
  const sizes = size === 'lg' ? 'px-4 py-1.5 text-base' : 'px-2.5 py-0.5 text-sm'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${config.badge} ${sizes}`}>
      <Icon className={size === 'lg' ? 'size-5' : 'size-4'} aria-hidden="true" />
      {config.label}
    </span>
  )
}
