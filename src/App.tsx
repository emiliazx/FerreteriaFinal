import { Routes, Route } from 'react-router-dom'
import NavBar from './components/organism/NavBar'
import Footer from './components/organism/Footer'
import ScrollArriba from './components/organism/Cambios'
import Inicio from './components/pages/Inicio'
import Productos from './components/pages/Productos'
import Detalleproducto from './components/pages/DetalleProducto'
import Carrito from './components/pages/Carrito'
import Checkout from './components/pages/Checkout'
import Contacto from './components/pages/Contacto'
import Gracias from './components/pages/Gracias'
import QuienesSomos from './components/pages/QuienesSomos'
import Login from './components/pages/Login'
import Usuario from './components/pages/Usuario'
import Vendedor from './components/pages/Vendedor'
import Admin from './components/pages/Admin'
import NoEncontrado from './components/pages/NoEncontrado'
import { CartProvider, useCart } from './context/CartContext'
import { AuthProvider } from './context/AuthContext'
import { CatalogProvider, useCatalog } from './context/CatalogContext'

function AppRoutes() {
  const { totalUnidades } = useCart()
  const { categorias } = useCatalog()

  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollArriba />
      <NavBar categorias={categorias} totalUnidades={totalUnidades} />

      <div className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/categoria/:slug" element={<Productos />} />
          <Route path="/productos/:id" element={<Detalleproducto />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/gracias" element={<Gracias />} />
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/login" element={<Login />} />
          <Route path="/usuario" element={<Usuario />} />
          <Route path="/vendedor" element={<Vendedor />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </div>

      <Footer />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <CatalogProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </CatalogProvider>
    </AuthProvider>
  )
}

export default App
