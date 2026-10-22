import { useState } from "react";
import { Link, NavLink } from "react-router-dom";

interface NavBarProps {
    categorias: { slug: string; nombreCorto: string }[];
    totalUnidades: number;
}

function NavBar({ categorias, totalUnidades }: NavBarProps) {

    const [menuAbierto, setMenuAbierto] = useState(false)
    const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)

    const cerrarTodo = () => {
        setMenuAbierto(false)
        setCategoriasAbiertas(false)
    }

    const claseLink = ({ isActive }: { isActive: boolean }) =>
        `nav-link${isActive ? ' active' : ''}`

    return(
        <nav className="navbar navbar-expand-lg lm-navbar">

            <div className="container">

                <Link className="navbar-brand" to="/" onClick={cerrarTodo}>
                    <img src="/img/logo1.jpg" alt="Logo de Ferretería Los Maestros" />
                    Ferretería Los Maestros
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    aria-label="Abrir menú"
                    aria-expanded={menuAbierto}
                    onClick={() => setMenuAbierto(!menuAbierto)}
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className={`collapse navbar-collapse${menuAbierto ? ' show' : ''}`}>

                    <ul className="navbar-nav mx-auto">

                        <li className="nav-item">
                            <NavLink className={claseLink} to="/" end onClick={cerrarTodo}>
                                Inicio
                            </NavLink>
                        </li>

                        <li className="nav-item dropdown">

                            <button
                                type="button"
                                className="nav-link dropdown-toggle btn btn-link"
                                aria-expanded={categoriasAbiertas}
                                onClick={() => setCategoriasAbiertas(!categoriasAbiertas)}
                            >
                                Categorías
                            </button>

                            <ul className={`dropdown-menu lm-dropdown${categoriasAbiertas ? ' show' : ''}`}>

                                <li>
                                    <Link className="dropdown-item" to="/productos" onClick={cerrarTodo}>
                                        Todos los productos
                                    </Link>
                                </li>

                                {categorias.map(c => (
                                    <li key={c.slug}>
                                        <Link
                                            className="dropdown-item"
                                            to={`/categoria/${c.slug}`}
                                            onClick={cerrarTodo}
                                        >
                                            {c.nombreCorto}
                                        </Link>
                                    </li>
                                ))}

                            </ul>

                        </li>

                        <li className="nav-item">
                            <NavLink className={claseLink} to="/carrito" onClick={cerrarTodo}>
                                Mi carrito
                                {totalUnidades > 0 && (
                                    <span className="badge rounded-pill ms-2 badge-carrito">
                                        {totalUnidades}
                                    </span>
                                )}
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink className={claseLink} to="/contacto" onClick={cerrarTodo}>
                                Contacto
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink className={claseLink} to="/quienes-somos" onClick={cerrarTodo}>
                                Quienes Somos
                            </NavLink>
                        </li>

                        <li className="nav-item">
                            <NavLink className={claseLink} to="/login" onClick={cerrarTodo}>
                                Iniciar sesión
                            </NavLink>
                        </li>

                    </ul>

                </div>

            </div>

        </nav>
    )

}

export default NavBar
