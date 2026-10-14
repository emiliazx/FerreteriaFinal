import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

// Cuentas de prueba (sin base de datos), igual que en el sitio original
const cuentas = [
    { correo: 'admin@maestro.cl',    clave: '1234', ruta: '/admin' },
    { correo: 'vendedor@maestro.cl', clave: '2468', ruta: '/vendedor' },
    { correo: 'usuario@maestro.cl',  clave: '5678', ruta: '/usuario' },
]

function Login(){

    const navigate = useNavigate()

    const [correo, setCorreo] = useState('')
    const [clave, setClave] = useState('')
    const [verClave, setVerClave] = useState(false)
    const [error, setError] = useState('')

    const ingresar = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()

        const correoLimpio = correo.trim()
        const claveLimpia = clave.trim()

        if (correoLimpio === '' || claveLimpia === '') {
            return setError('Debe completar todos los campos')
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return setError('Ingrese un correo válido')
        }

        if (claveLimpia.length !== 4) {
            return setError('La clave debe tener exactamente 4 caracteres')
        }

        const cuenta = cuentas.find(c => c.correo === correoLimpio && c.clave === claveLimpia)

        if (!cuenta) {
            return setError('Correo o clave incorrectos')
        }

        navigate(cuenta.ruta)
    }

    return(
        <main className="container my-5">

            <form className="login" onSubmit={ingresar} noValidate>

                <div className="login-brand">
                    <img src="/img/logo1.jpg" alt="Logo Ferretería Los Maestros" />
                    <span>Ferretería Los Maestros</span>
                    <small>Tu aliado en construcción desde 2004</small>
                </div>

                <h1>Iniciar sesión</h1>

                <ul className="beneficios">
                    <li>Consulta el stock en tiempo real</li>
                    <li>Revisa el historial de tus pedidos</li>
                    <li>Guarda cotizaciones sin compromiso</li>
                    <li>Coordina despachos a tu obra</li>
                </ul>

                <label htmlFor="correo">Correo</label>
                <input
                    id="correo"
                    type="email"
                    placeholder="tu@correo.cl"
                    autoComplete="username"
                    value={correo}
                    onChange={e => setCorreo(e.target.value)}
                />

                <label htmlFor="clave">Clave</label>
                <div className="clave-wrap">
                    <input
                        id="clave"
                        type={verClave ? 'text' : 'password'}
                        maxLength={4}
                        placeholder="****"
                        autoComplete="current-password"
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

                {error && <p className="mensaje-error">{error}</p>}

                <button type="submit" className="btn-ingresar">Ingresar</button>

                <Link className="olvido" to="/contacto">¿Olvidó su contraseña?</Link>

                <p className="ayuda">
                    Cuentas de prueba (sin base de datos):<br />
                    Admin: <b>admin@maestro.cl</b> / <b>1234</b><br />
                    Usuario: <b>usuario@maestro.cl</b> / <b>5678</b><br />
                    Vendedor: <b>vendedor@maestro.cl</b> / <b>2468</b>
                </p>

                <Link className="volver" to="/">← Volver al inicio</Link>

                <p className="copy">© 2026 Ferretería Los Maestros — La Serena</p>

            </form>

        </main>
    )
}
export default Login
