import { useState, type SubmitEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { crearNotificacion } from "../../api/notificaciones";
import { resetPassword } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function Login(){
    const navigate = useNavigate()
    const { login } = useAuth()
    const [correo, setCorreo] = useState('')
    const [clave, setClave] = useState('')
    const [verClave, setVerClave] = useState(false)
    const [error, setError] = useState('')
    const [mensaje, setMensaje] = useState('')
    const [cargando, setCargando] = useState(false)

    // Modo recuperación
    const [modoRecuperar, setModoRecuperar] = useState(false)
    const [nuevaClave, setNuevaClave] = useState('')
    const [confirmarNuevaClave, setConfirmarNuevaClave] = useState('')

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
            const user = await login(correoLimpio, claveLimpia)

            if (user.rol === 'ADMIN') navigate('/admin')
            else if (user.rol === 'VENDEDOR') navigate('/vendedor')
            else navigate('/usuario')
        } catch {
            setError('Correo o clave incorrectos')
        } finally {
            setCargando(false)
        }
    }

    const handleRecuperarClave = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')
        setMensaje('')

        const correoLimpio = correo.trim()
        const nuevaLimpia = nuevaClave.trim()

        if (!correoLimpio || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoLimpio)) {
            return setError('Ingresa un correo válido')
        }
        if (nuevaLimpia.length < 6) {
            return setError('La nueva contraseña debe tener al menos 6 caracteres')
        }
        if (nuevaLimpia !== confirmarNuevaClave.trim()) {
            return setError('Las contraseñas no coinciden')
        }

        setCargando(true)
        try {
            await resetPassword(correoLimpio, nuevaLimpia)

            // Registrar notificación (no bloquea si notificaciones está sin Resend)
            crearNotificacion({
                email: correoLimpio,
                tipo: 'RESET_PASSWORD',
                titulo: 'Contraseña restablecida',
                mensaje: `Se actualizó la contraseña de la cuenta ${correoLimpio}`
            }).catch(() => {})

            setMensaje('¡Contraseña actualizada! Ya puedes iniciar sesión con tu nueva clave.')
            setClave('')
            setNuevaClave('')
            setConfirmarNuevaClave('')
            setModoRecuperar(false)
        } catch (err: any) {
            setError(err?.message || 'No se pudo actualizar la contraseña. Verifica el correo ingresado.')
        } finally {
            setCargando(false)
        }
    }

    return (
        <main className="container my-5">
            {!modoRecuperar ? (
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
                        onClick={() => {
                            setError('')
                            setMensaje('')
                            setModoRecuperar(true)
                        }}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '10px auto' }}
                    >
                        ¿Olvidó su contraseña?
                    </button>

                    <p className="text-center small my-2">
                        ¿No tienes cuenta?{' '}
                        <Link to="/registro" className="volver" style={{ display: 'inline', margin: 0, fontWeight: 600 }}>
                            Crear cuenta
                        </Link>
                    </p>

                    <Link className="volver" to="/">← Volver al inicio</Link>
                    <p className="copy">© 2026 Ferretería Los Maestros — La Serena</p>
                </form>
            ) : (
                <form className="login" onSubmit={handleRecuperarClave} noValidate>
                    <div className="login-brand">
                        <img src="/img/logo1.jpg" alt="Logo Ferretería Los Maestros" />
                        <span>Ferretería Los Maestros</span>
                        <small>Tu aliado en construcción desde 2004</small>
                    </div>

                    <h1>Recuperar contraseña</h1>
                    <p className="small text-muted text-center">
                        Ingresa el correo de tu cuenta (Cliente, Vendedor o Admin) y define una nueva clave.
                    </p>

                    <label htmlFor="correoRecuperar">Correo registrado</label>
                    <input
                        id="correoRecuperar"
                        type="email"
                        placeholder="tu@correo.cl"
                        value={correo}
                        onChange={e => setCorreo(e.target.value)}
                    />

                    <label htmlFor="nuevaClave">Nueva contraseña</label>
                    <div className="clave-wrap">
                        <input
                            id="nuevaClave"
                            type={verClave ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            value={nuevaClave}
                            onChange={e => setNuevaClave(e.target.value)}
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

                    <label htmlFor="confirmarNuevaClave">Confirmar nueva contraseña</label>
                    <input
                        id="confirmarNuevaClave"
                        type={verClave ? 'text' : 'password'}
                        placeholder="Repite la nueva clave"
                        value={confirmarNuevaClave}
                        onChange={e => setConfirmarNuevaClave(e.target.value)}
                    />

                    {error && <p className="mensaje-error">{error}</p>}

                    <button type="submit" className="btn-ingresar" disabled={cargando}>
                        {cargando ? 'ACTUALIZANDO...' : 'CAMBIAR CONTRASEÑA'}
                    </button>

                    <button
                        type="button"
                        className="olvido"
                        onClick={() => {
                            setError('')
                            setModoRecuperar(false)
                        }}
                        style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', textDecoration: 'underline', display: 'block', margin: '10px auto' }}
                    >
                        Volver a iniciar sesión
                    </button>

                    <p className="copy">© 2026 Ferretería Los Maestros — La Serena</p>
                </form>
            )}
        </main>
    )
}
export default Login