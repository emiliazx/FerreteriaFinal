import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearNotificacion } from "../../api/notificaciones";
import { login as loginApi } from "../../api/auth";

function Login(){
    const navigate = useNavigate()
    const [correo, setCorreo] = useState('')
    const [clave, setClave] = useState('')
    const [verClave, setVerClave] = useState(false)
    const [error, setError] = useState('')
    const [recuperando, setRecuperando] = useState(false)
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(false)

    const ingresar = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setMensaje('')

        const correoLimpio = correo.trim()
        const claveLimpia = clave.trim()

        if (!correoLimpio || !claveLimpia) {
            return setError('Debe completar todos los campos')
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return setError('Ingrese un correo válido')
        }

        setCargando(true)
        try {
            const user = await loginApi(correoLimpio, claveLimpia)
            localStorage.setItem('ferreteria_token', user.token)
            localStorage.setItem('ferreteria_user', JSON.stringify(user))
            
            // Redirigir según rol
            if (user.rol === 'ADMIN') navigate('/admin')
            else if (user.rol === 'VENDEDOR') navigate('/vendedor')
            else navigate('/usuario')
        } catch {
            setError('Correo o clave incorrectos')
        } finally {
            setCargando(false)
        }
    }

    const recuperarClave = async () => {
        setError('')
        setMensaje('')
        const correoLimpio = correo.trim()

        if (!correoLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return setError('Ingresa un correo válido para recuperar la contraseña')
        }

        setRecuperando(true)
        try {
            await crearNotificacion({
                email: correoLimpio,
                tipo: 'RESET_PASSWORD',
                titulo: 'Recuperación de contraseña',
                mensaje: `Se solicitó recuperar la contraseña para ${correoLimpio}`
            })
            setMensaje('Si el correo está registrado, recibirás instrucciones para recuperar tu contraseña.')
        } catch {
            setError('No se pudo enviar la solicitud. Intenta de nuevo.')
        } finally {
            setRecuperando(false)
        }
    }

    return (
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
                        placeholder="******"
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
                {mensaje && <p className="text-success small">{mensaje}</p>}

                <button type="submit" className="btn-ingresar" disabled={cargando}>
                    {cargando ? 'INGRESANDO...' : 'INGRESAR'}
                </button>

                <button
                    type="button"
                    className="olvido"
                    onClick={recuperarClave}
                    disabled={recuperando}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '10px auto' }}
                >
                    {recuperando ? 'Enviando...' : '¿Olvidó su contraseña?'}
                </button>

                <Link className="volver" to="/">← Volver al inicio</Link>
                <p className="copy">© 2026 Ferretería Los Maestros — La Serena</p>
            </form>
        </main>
    )
}
export default Login