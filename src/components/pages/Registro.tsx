import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Registro() {
    const navigate = useNavigate()
    const { register } = useAuth()
    const [nombre, setNombre] = useState('')
    const [correo, setCorreo] = useState('')
    const [clave, setClave] = useState('')
    const [confirmarClave, setConfirmarClave] = useState('')
    const [verClave, setVerClave] = useState(false)
    const [error, setError] = useState('')
    const [cargando, setCargando] = useState(false)

    const registrar = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        const nombreLimpio = nombre.trim()
        const correoLimpio = correo.trim()
        const claveLimpia = clave.trim()

        if (!nombreLimpio || !correoLimpio || !claveLimpia || !confirmarClave.trim()) {
            return setError('Debe completar todos los campos')
        }
        if (nombreLimpio.length < 2) {
            return setError('El nombre debe tener al menos 2 caracteres')
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return setError('Ingrese un correo válido')
        }
        if (claveLimpia.length < 6) {
            return setError('La clave debe tener al menos 6 caracteres')
        }
        if (claveLimpia !== confirmarClave.trim()) {
            return setError('Las contraseñas no coinciden')
        }

        setCargando(true)
        try {
            const user = await register({
                nombre: nombreLimpio,
                email: correoLimpio,
                password: claveLimpia,
            })

            if (user.rol === 'ADMIN') navigate('/admin')
            else if (user.rol === 'VENDEDOR') navigate('/vendedor')
            else navigate('/usuario')
        } catch (err: any) {
            setError(err?.message || 'No se pudo crear la cuenta. Verifica si el correo ya está registrado.')
        } finally {
            setCargando(false)
        }
    }

    return (
        <main className="container my-5">
            <form className="login" onSubmit={registrar} noValidate>
                <div className="login-brand">
                    <img src="/img/logo1.jpg" alt="Logo Ferretería Los Maestros" />
                    <span>Ferretería Los Maestros</span>
                    <small>Tu aliado en construcción desde 2004</small>
                </div>

                <h1>Crear cuenta</h1>

                <label htmlFor="nombre">Nombre completo</label>
                <input
                    id="nombre"
                    type="text"
                    placeholder="Juan Pérez"
                    autoComplete="name"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                />

                <label htmlFor="correo">Correo</label>
                <input
                    id="correo"
                    type="email"
                    placeholder="tu@correo.cl"
                    autoComplete="email"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                />

                <label htmlFor="clave">Clave</label>
                <div className="clave-wrap">
                    <input
                        id="clave"
                        type={verClave ? 'text' : 'password'}
                        placeholder="******"
                        autoComplete="new-password"
                        value={clave}
                        onChange={e => setClave(e.target.value)}
                    />
                    <button
                        type="button"
                        className="ver-clave"
                        onClick={() => setVerClave(!verClave)}
                        aria-label={verClave ? 'Ocultar clave' : 'Mostrar clave'}
                    >
                        👁
                    </button>
                </div>

                <label htmlFor="confirmarClave">Confirmar clave</label>
                <input
                    id="confirmarClave"
                    type={verClave ? 'text' : 'password'}
                    placeholder="******"
                    autoComplete="new-password"
                    value={confirmarClave}
                    onChange={e => setConfirmarClave(e.target.value)}
                />

                {error && <p className="mensaje-error">{error}</p>}

                <button type="submit" className="btn-ingresar" disabled={cargando}>
                    {cargando ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
                </button>

                <p className="text-center small my-2">
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="volver" style={{ display: 'inline', margin: 0, fontWeight: 600 }}>
                        Iniciar sesión
                    </Link>
                </p>

                <Link className="volver" to="/">← Volver al inicio</Link>
                <p className="copy">© 2026 Ferretería Los Maestros — La Serena</p>
            </form>
        </main>
    )
}

export default Registro