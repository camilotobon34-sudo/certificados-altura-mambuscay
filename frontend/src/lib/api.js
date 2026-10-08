// En localhost la URL queda vacía y Vite redirige /api al backend local (vite.config.js).
// Se decide por el dominio en tiempo de ejecución para no depender de VITE_API_URL ni de
// NODE_ENV en Vercel: fuera de localhost siempre se usa el backend de producción.
const PRODUCTION_API_URL = 'https://certificados-altura-mambuscay.vercel.app'
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]']
const isLocalHost = LOCAL_HOSTS.includes(window.location.hostname)
const API_URL = (import.meta.env.VITE_API_URL || (isLocalHost ? '' : PRODUCTION_API_URL)).replace(/\/+$/, '')
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

// Las lecturas (GET) se reintentan ante fallos transitorios (red o 5xx) antes de mostrar un error.
const GET_RETRY_DELAYS_MS = [600, 1500]

const isTransient = (error) => error instanceof ApiError && (error.status === 0 || error.status >= 500)

const wait = (ms, signal) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })

export const request = async (path, options = {}) => {
  const method = options.method ?? 'GET'
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await send(path, options)
    } catch (error) {
      if (method !== 'GET' || !isTransient(error) || attempt >= GET_RETRY_DELAYS_MS.length) throw error
      await wait(GET_RETRY_DELAYS_MS[attempt], options.signal)
    }
  }
}

const send = async (path, { method = 'GET', body, params, signal } = {}) => {
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

// Descarga un archivo autenticado (p. ej. Excel) y lo guarda con el nombre indicado.
const download = async (path, params, filename) => {
  const token = tokenStorage.get()
  let response
  try {
    response = await fetch(buildUrl(path, params), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    throw new ApiError(0, 'No hay conexión con el servidor. Revise su conexión a internet.')
  }
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    if (response.status === 401 && token) {
      tokenStorage.clear()
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT))
    }
    throw new ApiError(response.status, data?.error ?? 'No fue posible descargar el archivo', data?.details)
  }
  const url = URL.createObjectURL(await response.blob())
  const link = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const api = {
  get: (path, params, options) => request(path, { ...options, params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  download,
}
