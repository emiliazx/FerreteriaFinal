import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { listarProductos, type Producto } from '../api/productos'
import { categorias as categoriasEstaticas, type Categoria } from '../data/productos'

type CatalogContextValue = {
  productos: Producto[]
  categorias: Categoria[]
  cargando: boolean
  error: string | null
  recargar: () => Promise<void>
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await listarProductos()
      setProductos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el catálogo')
      setProductos([])
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void recargar()
  }, [recargar])

  const value = useMemo(
    () => ({
      productos,
      categorias: categoriasEstaticas,
      cargando,
      error,
      recargar,
    }),
    [productos, cargando, error, recargar],
  )

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog() {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog debe usarse dentro de CatalogProvider')
  return ctx
}
