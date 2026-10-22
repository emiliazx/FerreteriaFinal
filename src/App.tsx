import { useEffect, useState } from 'react'
import './App.css'
import { CartProvider, useCart } from './context/CartContext'
import { catalogSections, getProductId } from './data/catalog'
import { CartPage } from './pages/CartPage'
import { CatalogPage } from './pages/CatalogPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProductDetailsPage } from './pages/ProductoDetallesPago'
import { ThankYouPage } from './pages/ExitosoPago'

function AppContent() {
  const [hash, setHash] = useState(window.location.hash)
  const { cartItems, cartCount, addToCart, changeQuantity, removeFromCart, clearCart } = useCart()

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash)
    window.addEventListener('hashchange', updateHash)
    return () => window.removeEventListener('hashchange', updateHash)
  }, [])

  const [page, routeId] = hash.replace(/^#\/?/, '').split('/')
  if (page === 'catalogo') return <CatalogPage categoryId={routeId} cartCount={cartCount} onAdd={addToCart} />

  if (page === 'producto' && routeId) {
    const section = catalogSections.find((entry) => entry.products.some((product) => getProductId(product.name) === routeId))
    const product = section?.products.find((entry) => getProductId(entry.name) === routeId)
    if (section && product) return <ProductDetailsPage product={product} categoryId={section.id} cartCount={cartCount} onAdd={addToCart} />
    return <CatalogPage cartCount={cartCount} onAdd={addToCart} />
  }

  if (page === 'carrito') {
    return <CartPage
      items={cartItems}
      cartCount={cartCount}
      onIncrease={(name) => changeQuantity(name, 1)}
      onDecrease={(name) => changeQuantity(name, -1)}
      onRemove={removeFromCart}
      onClear={clearCart}
    />
  }

  if (page === 'contacto') return <ContactPage cartCount={cartCount} />
  if (page === 'login') return <LoginPage cartCount={cartCount} />
  if (page === 'gracias') return <ThankYouPage cartCount={cartCount} />
  return <HomePage cartCount={cartCount} onAdd={addToCart} />
}

export default function App() {
  return (
    <CartProvider>
      <AppContent />
    </CartProvider>
  )
}
