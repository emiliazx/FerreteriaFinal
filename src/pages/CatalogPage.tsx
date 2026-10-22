import { Footer } from '../components/organisms/Footer'
import { Navbar } from '../components/organisms/Navbar'
import { ProductCard } from '../components/molecules/ProductCard'
import type { CatalogProduct } from '../data/catalog'
import { catalogSections } from '../data/catalog'

type Props = { categoryId?: string; cartCount: number; onAdd: (product: CatalogProduct) => void }

export function CatalogPage({ categoryId, cartCount, onAdd }: Props) {
  const selected = catalogSections.find((section) => section.id === categoryId)
  const sections = categoryId ? selected ? [selected] : [] : catalogSections
  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main className="catalog-route section">
        <div className="container">
          <div className="section-heading catalog-heading">
            <span className="eyebrow">Ferretería Los Maestros</span>
            <h1>{selected?.title ?? 'Catálogo de productos'}</h1>
            <p>{selected ? `Productos de ${selected.title.toLowerCase()}.` : 'Explora nuestro catálogo con stock en tiempo real.'}</p>
          </div>
          <nav className="catalog-filters" aria-label="Filtrar productos por categoría">
            <a className={!categoryId ? 'active' : ''} href="#/catalogo">Todas</a>
            {catalogSections.map((section) => (
              <a key={section.id} className={categoryId === section.id ? 'active' : ''} href={`#/catalogo/${section.id}`}>{section.title}</a>
            ))}
          </nav>
          {sections.length ? sections.map((section) => (
            <section key={section.id} className="catalog-section">
              {!categoryId && <div className="section-heading catalog-section-heading"><h2>{section.title}</h2></div>}
              <div className="product-grid catalog-grid">
                {section.products.map((product) => <ProductCard key={product.name} product={product} onAdd={onAdd} />)}
              </div>
              {section.products.length === 0 && <p className="catalog-empty">Aún no hay productos publicados para esta categoría.</p>}
            </section>
          )) : <p className="catalog-empty">No encontramos esa categoría. <a href="#/catalogo">Ver todo el catálogo</a></p>}
        </div>
      </main>
      <Footer />
    </div>
  )
}
