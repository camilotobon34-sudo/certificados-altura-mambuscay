import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api, SESSION_EXPIRED_EVENT, tokenStorage } from '../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [status, setStatus] = useState(() => (tokenStorage.get() ? 'loading' : 'anonymous'))
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (status !== 'loading') return
    const controller = new AbortController()
    api
      .get('/auth/me', undefined, { signal: controller.signal })
      .then(({ usuario: u }) => {
        setUsuario(u)
        setStatus('authenticated')
      })
      .catch((error) => {
        if (error.name === 'AbortError') return
        // Solo un 401 invalida el token; ante un fallo temporal se conserva para el siguiente intento.
        if (error.status === 401) tokenStorage.clear()
        setStatus('anonymous')
      })
    return () => controller.abort()
  }, [status])

  useEffect(() => {
    const onExpired = () => {
      setUsuario(null)
      setStatus('anonymous')
      setSessionExpired(true)
    }
    window.addEventListener(SESSION_EXPIRED_EVENT, onExpired)
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, onExpired)
  }, [])

  const login = useCallback(async ({ tipoUsuario, tipoDocumento, numeroDocumento, password }) => {
    const { token, usuario: u } = await api.post('/auth/login', {
      tipoUsuario,
      tipoDocumento,
      numeroDocumento,
      password,
    })
    tokenStorage.set(token)
    setUsuario(u)
    setStatus('authenticated')
    setSessionExpired(false)
    return u
  }, [])

  const logout = useCallback(() => {
    tokenStorage.clear()
    setUsuario(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo(
    () => ({
      usuario,
      status,
      sessionExpired,
      isAuthenticated: status === 'authenticated',
      hasRole: (...roles) => Boolean(usuario && roles.includes(usuario.rol)),
      login,
      logout,
    }),
    [usuario, status, sessionExpired, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return context
}
