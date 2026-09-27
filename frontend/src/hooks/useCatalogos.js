import { api } from '../lib/api.js'
import { useApi } from './useApi.js'

let cache = null

export function useCatalogos() {
  return useApi(async (signal) => {
    if (cache) return cache
    cache = await api.get('/catalogos', undefined, { signal })
    return cache
  })
}
