import { featuredBrands, getCatalogImage } from '../../data/catalog'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <h3>Ferretería Los Maestros</h3>
          <p>Tu aliado en construcción desde 2004.</p>
        </div>
        <div>
          <h4>Ubicación</h4>
          <p>La Serena, Región de Coquimbo.</p>
        </div>
      </div>
      <section className="container brands-section" aria-labelledby="brands-title">
        <div className="section-heading">
          <h3 id="brands-title">Marcas más vendidas</h3>
          <p>Calidad garantizada para tus proyectos</p>
        </div>
        <div className="brand-grid">
          {featuredBrands.map((brand) => (
            <div className="brand-logo" key={brand.name}>
              <img src={getCatalogImage(brand.image)} alt={brand.name} />
            </div>
          ))}
        </div>
      </section>
      <div className="container footer-copyright">
        <p>Ferretería Los Maestros · La Serena, Región de Coquimbo</p>
        <p>© 2026 Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
