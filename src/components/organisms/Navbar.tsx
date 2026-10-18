import { catalogSections } from '../../data/catalog'

export function Navbar({ cartCount }: { cartCount: number }) {
  return (
    <header className="topbar">
      <div className="container nav-wrapper">
        <a className="brand" href="#/">
          <img src="/img/logo1.jpg" alt="Logo Ferretería Los Maestros" />
          <span>Ferretería Los Maestros</span>
        </a>
        <nav className="main-nav" aria-label="Navegación principal">
          <a href="#/">Inicio</a>
          <div className="nav-dropdown">
            <a href="#/catalogo" aria-haspopup="true" aria-label="Categorías del catálogo">Categorías</a>
            <div className="nav-dropdown-menu">
              {catalogSections.map((section) => <a key={section.id} href={`#/catalogo/${section.id}`}>{section.title}</a>)}
            </div>
          </div>
          <a href="#/carrito">Mi pedido{cartCount > 0 ? ` (${cartCount})` : ''}</a>
          <a href="#/contacto">Contáctanos</a>
          <a href="#/login">Ingresar</a>
        </nav>
      </div>
    </header>
  )
}
