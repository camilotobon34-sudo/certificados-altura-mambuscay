import { useCallback, useEffect, useRef, useState } from 'react'

// Ejecuta una petición al montar y cuando cambian las dependencias; expone reload().
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true })
  const [version, setVersion] = useState(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    const controller = new AbortController()
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((error) => {
        if (error.name === 'AbortError') return
        setState({ data: null, error, loading: false })
      })
    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  const setData = useCallback((data) => setState((prev) => ({ ...prev, data })), [])

  return { ...state, reload, setData }
}
