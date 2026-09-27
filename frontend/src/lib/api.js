const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '')
const TOKEN_KEY = 'mambuscay.token'

export const SESSION_EXPIRED_EVENT = 'mambuscay:session-expired'

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message)
    this.status = status
    this.details = details
  }

  get isNetwork() {
    return this.status === 0
  }

  // Devuelve { campo: mensaje } para mostrar errores junto a cada input.
  get fieldErrors() {
    return Object.fromEntries((this.details ?? []).map((d) => [d.campo, d.mensaje]))
  }
}

const buildUrl = (path, params) => {
  const url = `${API_URL}/api${path}`
  if (!params) return url
  const search = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
  const qs = search.toString()
  return qs ? `${url}?${qs}` : url
}

export const request = async (path, { method = 'GET', body, params, signal } = {}) => {
  const token = tokenStorage.get()
  let response
  try {
    response = await fetch(buildUrl(path, params), {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError(0, 'No hay conexión con el servidor. Revise su conexión a internet.')
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStorage.clear()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(response.status, data?.error ?? 'Ocurrió un error inesperado', data?.details)
  }

  return data
}

export const api = {
  get: (path, params, options) => request(path, { ...options, params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
}
