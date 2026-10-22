import { Button } from '../components/atom/Button'
import { Footer } from '../components/organisms/Footer'
import { Navbar } from '../components/organisms/Navbar'
import type { CartItem } from '../data/catalog'
import { getCatalogImage } from '../data/catalog'

type Props = {
  items: CartItem[]
  cartCount: number
  onIncrease: (name: string) => void
  onDecrease: (name: string) => void
  onRemove: (name: string) => void
  onClear: () => void
}

function priceNumber(price: string) {
  return Number(price.replace(/[^0-9]/g, ''))
}

function formatPrice(value: number) {
  return `$${value.toLocaleString('es-CL')}`
}

export function CartPage({ items, cartCount, onIncrease, onDecrease, onRemove, onClear }: Props) {
  const total = items.reduce((sum, item) => sum + priceNumber(item.price) * item.quantity, 0)
  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main className="section cart-page">
        <div className="container">
          <div className="section-heading"><h1>Mi pedido</h1><p>Revisa los productos que agregaste.</p></div>
          {items.length === 0 ? <div className="empty-cart"><p>Tu pedido está vacío</p><a className="button-link" href="#/catalogo">Ver catálogo</a></div> : (
            <>
              <div className="cart-items">
                {items.map((item) => (
                  <article className="cart-item" key={item.name}>
                    <img src={getCatalogImage(item.image)} alt={item.name} />
                    <div className="cart-item-info"><h2>{item.name}</h2><p>{item.price} c/u</p></div>
                    <div className="quantity-controls">
                      <Button aria-label={`Quitar una unidad de ${item.name}`} onClick={() => onDecrease(item.name)}>-</Button>
                      <span>{item.quantity}</span>
                      <Button aria-label={`Agregar una unidad de ${item.name}`} onClick={() => onIncrease(item.name)}>+</Button>
                    </div>
                    <strong>{formatPrice(priceNumber(item.price) * item.quantity)}</strong>
                    <Button className="remove-button" onClick={() => onRemove(item.name)}>Quitar</Button>
                  </article>
                ))}
              </div>
              <section className="cart-summary" aria-label="Resumen de la orden">
                <h2>Resumen de la orden</h2>
                <p><span>Subtotal productos</span><strong>{formatPrice(total)}</strong></p>
                <p><span>Despacho</span><strong>Por calcular</strong></p>
                <p className="cart-total"><span>Total estimado</span><strong>{formatPrice(total)}</strong></p>
                <a className="button-link" href="#/contacto">Consultar despacho y cotizar</a>
                <a className="continue-shopping" href="#/catalogo">Seguir comprando</a>
                <Button onClick={onClear}>Vaciar pedido</Button>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
