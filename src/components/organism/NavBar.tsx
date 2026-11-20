import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface NavBarProps {
    categorias: { slug: string; nombreCorto: string }[];
    totalUnidades: number;
}

function NavBar({ categorias, totalUnidades }: NavBarProps) {
    const navigate = useNavigate()
    const { user, isAuthenticated, inicial, logout } = useAuth()

    const [menuAbierto, setMenuAbierto] = useState(false)
    const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)

    const cerrarTodo = () => {
        setMenuAbierto(false)
        setCategoriasAbiertas(false)
    }

    const handleLogout = () => {
        cerrarTodo()
        logout()
        navigate('/login')
    }

    const rutaPanel =
        user?.rol === 'ADMIN'
            ? '/admin'
            : user?.rol === 'VENDEDOR'
              ? '/vendedor'
              : '/usuario'

    const claseLink = ({ isActive }: { isActive: boolean }) =>
        `nav-link${isActive ? ' active' : ''}`

    return (
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

                    <ul className="navbar-nav mx-auto align-items-lg-center">

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

                        <li className="nav-item ms-lg-2">
                            {isAuthenticated && user ? (
                                <div className="d-flex align-items-center gap-2">
                                    <Link
                                        to={rutaPanel}
                                        onClick={cerrarTodo}
                                        title={`${user.nombre || user.email} — Ir a mi cuenta`}
                                        className="d-inline-flex align-items-center justify-content-center text-white fw-bold text-decoration-none"
                                        style={{
                                            width: '34px',
                                            height: '34px',
                                            borderRadius: '50%',
                                            backgroundColor: '#222',
                                            border: '2px solid #fff',
                                            fontSize: '0.9rem',
                                        }}
                                    >
                                        {inicial ?? '?'}
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="btn btn-sm btn-outline-light py-0 px-2"
                                        style={{ fontSize: '0.78rem' }}
                                    >
                                        Salir
                                    </button>
                                </div>
                            ) : (
                                <NavLink className={claseLink} to="/login" onClick={cerrarTodo}>
                                    Iniciar sesión
                                </NavLink>
                            )}
                        </li>

                    </ul>

                </div>

            </div>

        </nav>
    )
}

export default NavBar