import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { productos,type Producto } from '../data/productos'

const CARRITO_KEY = 'carritoFerreteria'

export interface Linea {
  id: number
  cantidad: number
}

export type ItemCarrito = Producto & { cantidad: number }

type CartContextValue = {
  items: ItemCarrito[]
  totalUnidades: number
  subtotal: number
  agregar: (id: number) => void
  cambiarCantidad: (id: number, cantidad: number) => void
  eliminar: (id: number) => void
  vaciar: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

function leerLineas(): Linea[] {
  try {
    const guardado = JSON.parse(localStorage.getItem(CARRITO_KEY) ?? '[]')
    if (!Array.isArray(guardado)) return []
    return guardado.filter(
      (l): l is Linea =>
        typeof l?.id === 'number' &&
        typeof l?.cantidad === 'number' &&
        productos.some((p) => p.id === l.id),
    )
  } catch {
    return []
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lineas, setLineas] = useState<Linea[]>(leerLineas)

  useEffect(() => {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(lineas))
  }, [lineas])

  const items = useMemo(
    () =>
      lineas.flatMap((linea) => {
        const producto = productos.find((p) => p.id === linea.id)
        return producto ? [{ ...producto, cantidad: linea.cantidad }] : []
      }),
    [lineas],
  )

  const totalUnidades = useMemo(
    () => items.reduce((suma, i) => suma + i.cantidad, 0),
    [items],
  )

  const subtotal = useMemo(
    () => items.reduce((suma, i) => suma + i.precio * i.cantidad, 0),
    [items],
  )

  const agregar = useCallback((id: number) => {
    setLineas((actual) =>
      actual.some((l) => l.id === id)
        ? actual.map((l) =>
            l.id === id ? { ...l, cantidad: l.cantidad + 1 } : l,
          )
        : [...actual, { id, cantidad: 1 }],
    )
  }, [])

  const cambiarCantidad = useCallback((id: number, cantidad: number) => {
    setLineas((actual) =>
      actual.map((l) =>
        l.id === id
          ? { ...l, cantidad: Math.max(1, Math.floor(cantidad) || 1) }
          : l,
      ),
    )
  }, [])

  const eliminar = useCallback((id: number) => {
    setLineas((actual) => actual.filter((l) => l.id !== id))
  }, [])

  const vaciar = useCallback(() => setLineas([]), [])

  const value = useMemo(
    () => ({
      items,
      totalUnidades,
      subtotal,
      agregar,
      cambiarCantidad,
      eliminar,
      vaciar,
    }),
    [items, totalUnidades, subtotal, agregar, cambiarCantidad, eliminar, vaciar],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider')
  }
  return context
}
