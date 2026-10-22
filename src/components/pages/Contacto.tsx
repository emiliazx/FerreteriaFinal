import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";

type Campo = 'nombre' | 'telefono' | 'email' | 'mensaje'

const validadores: Record<Campo, (valor: string) => boolean> = {
    nombre:   v => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/.test(v.trim()),
    telefono: v => v.replace(/\D/g, '').length >= 8,
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    mensaje:  v => v.trim().length >= 10,
}

const mensajesError: Record<Campo, string> = {
    nombre:   'Ingresa tu nombre y apellido (mínimo 3 letras).',
    telefono: 'Ingresa un teléfono válido (mínimo 8 dígitos).',
    email:    'Ingresa un correo con formato válido.',
    mensaje:  'Cuéntanos un poco más (mínimo 10 caracteres).',
}

function Contacto(){

    const navigate = useNavigate()

    const [valores, setValores] = useState<Record<Campo, string>>({
        nombre: '', telefono: '', email: '', mensaje: '',
    })
    const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({})
    const [intentado, setIntentado] = useState(false)

    const cambiar = (campo: Campo, valor: string) => {
        setValores(v => ({ ...v, [campo]: valor }))
        // Una vez que se intentó enviar, se revalida en vivo
        if (intentado) {
            setErrores(e => ({ ...e, [campo]: !validadores[campo](valor) }))
        }
    }

    const enviar = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIntentado(true)

        if (!valores.email.trim()) {
            window.alert('Debe ingresar su correo electrónico')
        }

        const nuevos: Partial<Record<Campo, boolean>> = {}
        let valido = true

        for (const campo of Object.keys(validadores) as Campo[]) {
            const falla = !validadores[campo](valores[campo])
            nuevos[campo] = falla
            if (falla) valido = false
        }

        setErrores(nuevos)

        if (valido) {
            navigate('/gracias')
        }
    }

    const hayErrores = Object.values(errores).some(Boolean)

    const claseInput = (campo: Campo) =>
        `form-control border-0 border-bottom rounded-0 px-0 shadow-none${errores[campo] ? ' is-invalid' : ''}`

    return(
        <main className="container contacto-page my-5">

            <div className="contacto-heading">
                <span className="contacto-eyebrow">ESTAMOS PARA AYUDARTE</span>
                <h1 className="fw-bold m-0 titulo-seccion">Contáctanos</h1>
                <p className="mb-0 text-secondary">
                    Cuéntanos qué necesitas y nuestro equipo se pondrá en contacto contigo.
                </p>
            </div>

            <div className="row g-4 contacto-layout">

                <div className="col-lg-6">

                    <section className="contacto-form-card">
                        <h2 className="contacto-subtitulo">Envíanos un mensaje</h2>
                        <p className="text-secondary mb-4">
                            Completa tus datos y te responderemos lo antes posible.
                        </p>

                        {hayErrores && (
                            <div className="alert alert-danger py-2 px-3 small" role="alert">
                                ⚠ Revisa los campos marcados en rojo antes de enviar.
                            </div>
                        )}

                        <form onSubmit={enviar} noValidate>

                        <div className="mb-3 contacto-field">
                            <label htmlFor="nombre" className="form-label text-dark fw-medium">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                className={`${claseInput('nombre')} contacto-input`}
                                placeholder="Escribe aquí tu Nombre y Apellido"
                                value={valores.nombre}
                                onChange={e => cambiar('nombre', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.nombre}</div>
                        </div>

                        <div className="mb-3 contacto-field">
                            <label htmlFor="telefono" className="form-label text-dark fw-medium">Teléfono</label>
                            <input
                                id="telefono"
                                type="tel"
                                className={`${claseInput('telefono')} contacto-input`}
                                placeholder="Indícanos un teléfono de contacto"
                                value={valores.telefono}
                                onChange={e => cambiar('telefono', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.telefono}</div>
                        </div>

                        <div className="mb-3 contacto-field">
                            <label htmlFor="email" className="form-label text-dark fw-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                className={`${claseInput('email')} contacto-input`}
                                placeholder="¿A qué email te podemos escribir?"
                                value={valores.email}
                                onChange={e => cambiar('email', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.email}</div>
                        </div>

                        <div className="mb-3 contacto-field">
                            <label htmlFor="mensaje" className="form-label text-dark fw-medium">Mensaje</label>
                            <textarea
                                id="mensaje"
                                className={`${claseInput('mensaje')} contacto-input`}
                                rows={4}
                                placeholder="Cuéntanos en qué podemos apoyarte"
                                value={valores.mensaje}
                                onChange={e => cambiar('mensaje', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.mensaje}</div>
                        </div>

                        <p className="text-muted small mt-3 mb-4">
                            Revisaremos tu consulta y te responderemos con la información que necesitas.
                        </p>

                        <button type="submit" className="btn btn-naranja w-100 py-3 fw-bold">
                            ENVIAR
                        </button>

                        </form>
                    </section>

                </div>

                <div className="col-lg-6">
                    <section className="contacto-info-card h-100">
                        <div>
                            <span className="contacto-eyebrow">INFORMACIÓN</span>
                            <h2 className="contacto-subtitulo">Visítanos o escríbenos</h2>
                            <p className="text-secondary mb-0">
                                Estamos en La Serena para ayudarte con tus proyectos.
                            </p>
                        </div>

                        <div className="contacto-info-item">
                            <span className="contacto-info-icon" aria-hidden="true">✉</span>
                            <div>
                                <span className="contacto-info-label">Correo electrónico</span>
                                <span className="contacto-info-value">contactoFerreteria@LosMaestros</span>
                            </div>
                        </div>

                        <div className="contacto-info-item">
                            <span className="contacto-info-icon" aria-hidden="true">☎</span>
                            <div>
                                <span className="contacto-info-label">Teléfono</span>
                                <span className="contacto-info-value">(+56 9) 2450 003</span>
                            </div>
                        </div>

                        <div className="contacto-info-item">
                            <span className="contacto-info-icon" aria-hidden="true">⌖</span>
                            <div>
                                <span className="contacto-info-label">Dirección</span>
                                <span className="contacto-info-value">
                                    Calle Universidad de Chile 1<br />
                                    La Serena, Región de Coquimbo
                                </span>
                            </div>
                        </div>

                        <div className="contacto-horario">
                            <strong>Ferretería Los Maestros</strong>
                            <span>Tu aliado en construcción y herramientas.</span>
                        </div>
                    </section>
                </div>

            </div>

        </main>
    )
}
export default Contacto
