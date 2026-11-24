import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './AuthContext'
import {
  obtenerCarrito,
  agregarAlCarrito,
  actualizarCantidadCarrito,
  eliminarItemCarrito,
  vaciarCarrito,
  type ItemCarrito as ItemBackend,
} from '../api/carrito'
import type { Producto } from '../api/productos'

export type ItemCarrito = {
  id: number
  titulo: string
  precio: number
  imagen: string | null
  cantidad: number
}

type CartContextValue = {
  items: ItemCarrito[]
  totalUnidades: number
  subtotal: number
  agregar: (id: number) => Promise<void>
  cambiarCantidad: (id: number, cantidad: number) => Promise<void>
  eliminar: (id: number) => Promise<void>
  vaciar: () => Promise<void>
  cargando: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

const GUEST_KEY = 'ferreteria_guest_id'

function getClienteId(userId?: number | null): string {
  if (userId) return `user-${userId}`
  let guest = localStorage.getItem(GUEST_KEY)
  if (!guest) {
    guest = `guest-${crypto.randomUUID()}`
    localStorage.setItem(GUEST_KEY, guest)
  }
  return guest
}

function mapItems(items: ItemBackend[]): ItemCarrito[] {
  return items.map((i) => ({
    id: i.productoId,
    titulo: i.titulo,
    precio: i.precioUnitario,
    imagen: i.imagen,
    cantidad: i.cantidad,
  }))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<ItemCarrito[]>([])
  const [cargando, setCargando] = useState(true)

  const clienteId = useMemo(() => getClienteId(user?.userId), [user?.userId])

  const cargar = useCallback(async () => {
    setCargando(true)
    try {
      const carrito = await obtenerCarrito(clienteId)
      setItems(mapItems(carrito.items))
    } catch {
      setItems([])
    } finally {
      setCargando(false)
    }
  }, [clienteId])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const totalUnidades = useMemo(
    () => items.reduce((s, i) => s + i.cantidad, 0),
    [items],
  )
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.precio * i.cantidad, 0),
    [items],
  )

  const agregar = useCallback(
    async (id: number) => {
      try {
        const carrito = await agregarAlCarrito(clienteId, id, 1)
        setItems(mapItems(carrito.items))
      } catch (err) {
        console.error(err)
      }
    },
    [clienteId],
  )

  const cambiarCantidad = useCallback(
    async (id: number, cantidad: number) => {
      if (cantidad < 1) return
      try {
        const carrito = await actualizarCantidadCarrito(clienteId, id, cantidad)
        setItems(mapItems(carrito.items))
      } catch (err) {
        console.error(err)
      }
    },
    [clienteId],
  )

  const eliminar = useCallback(
    async (id: number) => {
      try {
        const carrito = await eliminarItemCarrito(clienteId, id)
        setItems(mapItems(carrito.items))
      } catch (err) {
        console.error(err)
      }
    },
    [clienteId],
  )

  const vaciar = useCallback(async () => {
    try {
      await vaciarCarrito(clienteId)
      setItems([])
    } catch (err) {
      console.error(err)
    }
  }, [clienteId])

  const value = useMemo(
    () => ({
      items,
      totalUnidades,
      subtotal,
      agregar,
      cambiarCantidad,
      eliminar,
      vaciar,
      cargando,
    }),
    [items, totalUnidades, subtotal, agregar, cambiarCantidad, eliminar, vaciar, cargando],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
