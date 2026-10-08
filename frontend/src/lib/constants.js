import { Ban, CircleCheck, CirclePause, Clock } from 'lucide-react'

export const ROLES = Object.freeze({
  ADMIN: 'ADMIN',
  PERSONAL: 'PERSONAL_AUTORIZADO',
  ESTUDIANTE: 'ESTUDIANTE',
})

export const ROL_LABELS = {
  [ROLES.ADMIN]: 'Administrador',
  [ROLES.PERSONAL]: 'Personal autorizado',
  [ROLES.ESTUDIANTE]: 'Cliente',
}

export const INTERNAL_ROLES = [ROLES.ADMIN, ROLES.PERSONAL]

export const homePathForRole = (rol) =>
  rol === ROLES.ESTUDIANTE ? '/mis-certificados' : '/admin'

// El estado nunca se comunica solo con color: siempre icono + texto (docs 6.8).
export const ESTADOS = {
  VIGENTE: {
    label: 'Vigente',
    icon: CircleCheck,
    badge: 'bg-success-soft text-success',
    solid: 'bg-success',
    text: 'text-success',
    soft: 'bg-success-soft',
    border: 'border-success',
  },
  VENCIDO: {
    label: 'Vencido',
    icon: Clock,
    badge: 'bg-warning-soft text-warning',
    solid: 'bg-warning',
    text: 'text-warning',
    soft: 'bg-warning-soft',
    border: 'border-warning',
  },
  SUSPENDIDO: {
    label: 'Suspendido',
    icon: CirclePause,
    badge: 'bg-info-soft text-info',
    solid: 'bg-info',
    text: 'text-info',
    soft: 'bg-info-soft',
    border: 'border-info',
  },
  ANULADO: {
    label: 'Anulado',
    icon: Ban,
    badge: 'bg-danger-soft text-danger',
    solid: 'bg-danger',
    text: 'text-danger',
    soft: 'bg-danger-soft',
    border: 'border-danger',
  },
}

export const ESTADO_KEYS = Object.keys(ESTADOS)
