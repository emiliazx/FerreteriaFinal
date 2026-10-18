import { Button } from '../atom/Button'
import type { CatalogProduct } from '../../data/catalog'
import { getCatalogImage, getProductId } from '../../data/catalog'

type ProductCardProps = {
  product: CatalogProduct
  onAdd: (product: CatalogProduct) => void
}

export function ProductCard({ product, onAdd }: ProductCardProps) {
  return (
    <article className="product-card">
      <img src={getCatalogImage(product.image)} alt={product.name} />
      <div className="product-body">
        <span className="product-tag">{product.tag}</span>
        <h3>{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-meta">
          <strong>{product.price}</strong>
          <Button onClick={() => onAdd(product)}>Añadir</Button>
        </div>
        <a className="product-details-link" href={`#/producto/${getProductId(product.name)}`}>Ver detalles</a>
      </div>
    </article>
  )
}
