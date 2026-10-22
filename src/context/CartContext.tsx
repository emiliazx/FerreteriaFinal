import { createContext, useContext, useState, type ReactNode } from 'react'
import type { CartItem, CatalogProduct } from '../data/catalog'

type CartContextValue = {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (product: CatalogProduct) => void
  changeQuantity: (name: string, change: number) => void
  removeFromCart: (name: string) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  const addToCart = (product: CatalogProduct) => {
    setCartItems((items) => {
      const existing = items.find((item) => item.name === product.name)
      return existing
        ? items.map((item) => item.name === product.name ? { ...item, quantity: item.quantity + 1 } : item)
        : [...items, { ...product, quantity: 1 }]
    })
  }

  const changeQuantity = (name: string, change: number) => {
    setCartItems((items) => items
      .map((item) => item.name === name ? { ...item, quantity: item.quantity + change } : item)
      .filter((item) => item.quantity > 0))
  }

  const removeFromCart = (name: string) => {
    setCartItems((items) => items.filter((item) => item.name !== name))
  }

  const clearCart = () => setCartItems([])

  return (
    <CartContext.Provider value={{ cartItems, cartCount, addToCart, changeQuantity, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider')
  }
  return context
}
