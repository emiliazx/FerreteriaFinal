import { useEffect, useState } from 'react'
import { BenefitCard } from '../components/molecules/BenefitCard'
import { CategoryCard } from '../components/molecules/CategoryCard'
import { ProductCard } from '../components/molecules/ProductCard'
import { Footer } from '../components/organisms/Footer'
import { Navbar } from '../components/organisms/Navbar'
import type { CatalogProduct } from '../data/catalog'
import { benefits, catalogSections, getCatalogImage } from '../data/catalog'

const heroSlides = [
  { image: '/logo.jpg', alt: 'Ferretería Los Maestros' },
  { image: '/index.jpg', alt: 'Herramientas y productos de ferretería' },
]

type HomePageProps = {
  cartCount: number
  onAdd: (product: CatalogProduct) => void
}

export function HomePage({ cartCount, onAdd }: HomePageProps) {
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length)
    }, 4500)
    return () => window.clearInterval(interval)
  }, [])

  const showSlide = (change: number) => {
    setActiveSlide((current) => (current + change + heroSlides.length) % heroSlides.length)
  }

  const featuredProducts = catalogSections.find((section) => section.id === 'herramientas')?.products ?? []

  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main>
        <section className="hero-section" aria-label="Presentación de Ferretería Los Maestros">
          <img src={getCatalogImage(heroSlides[activeSlide].image)} alt={heroSlides[activeSlide].alt} />
          <div className="hero-caption"><h1>Ferretería Los Maestros</h1><p>Todo para tu obra y tu hogar</p></div>
          <button className="hero-control hero-control-previous" type="button" aria-label="Imagen anterior" onClick={() => showSlide(-1)}>Anterior</button>
          <button className="hero-control hero-control-next" type="button" aria-label="Imagen siguiente" onClick={() => showSlide(1)}>Siguiente</button>
        </section>
        <section className="section">
          <div className="container">
            <div className="section-heading"><h2>¿Por qué elegirnos?</h2></div>
            <div className="benefits-grid">{benefits.map((item) => <BenefitCard key={item.title} {...item} />)}</div>
          </div>
        </section>
        <section className="section featured-section">
          <div className="container">
            <div className="section-heading">
              <h2>Productos destacados</h2>
              <p>Conoce algunos de nuestros productos disponibles.</p>
            </div>
            <div className="product-grid">
              {featuredProducts.map((product) => <ProductCard key={product.name} product={product} onAdd={onAdd} />)}
            </div>
          </div>
        </section>
        <section className="section categories-section">
          <div className="container">
            <div className="section-heading"><h2>Categorías principales</h2><p>Explora nuestro catálogo con stock en tiempo real.</p></div>
            <div className="category-grid">
              {catalogSections.map((section) => <CategoryCard key={section.id} title={section.homeTitle} image={section.image} link={`#/catalogo/${section.id}`} />)}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
