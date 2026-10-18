import { BackLink } from '../components/atom/BackLink'
import { Button } from '../components/atom/Button'
import { Footer } from '../components/organisms/Footer'
import { Navbar } from '../components/organisms/Navbar'
import type { CatalogProduct } from '../data/catalog'
import { catalogSections, getCatalogImage } from '../data/catalog'

type Props = { product: CatalogProduct; categoryId: string; cartCount: number; onAdd: (product: CatalogProduct) => void }

export function ProductDetailsPage({ product, categoryId, cartCount, onAdd }: Props) {
  const category = catalogSections.find((section) => section.id === categoryId)
  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main className="section product-details-page">
        <div className="container">
          <BackLink href={`#/catalogo/${categoryId}`}>Volver a {category?.title ?? 'la categoría'}</BackLink>
          <article className="product-details">
            <img src={getCatalogImage(product.image)} alt={product.name} />
            <div className="product-details-content">
              <span className="product-tag">{product.tag}</span><h1>{product.name}</h1>
              <p className="product-details-description">{product.description}</p>
              <p className="product-details-price">{product.price}</p>
              <Button className="product-details-add" onClick={() => onAdd(product)}>Agregar al pedido</Button>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </div>
  )
}
