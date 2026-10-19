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
        <main className="container my-5">

            <div className="border-bottom border-dark border-2 pb-2 mb-4">
                <h1 className="fw-bold m-0 titulo-seccion">CONTACTO</h1>
            </div>

            <div className="row g-5">

                <div className="col-lg-6">

                    <p className="mb-4 text-secondary">
                        Siéntase libre de contactarnos en cualquier momento.<br />
                        Nos pondremos en contacto con usted lo más pronto posible.
                    </p>

                    {hayErrores && (
                        <div className="alert alert-danger py-2 px-3 small" role="alert">
                            ⚠ Revisa los campos marcados en rojo antes de enviar.
                        </div>
                    )}

                    <form onSubmit={enviar} noValidate>

                        <div className="mb-4">
                            <label htmlFor="nombre" className="form-label text-dark fw-medium">Nombre</label>
                            <input
                                id="nombre"
                                type="text"
                                className={claseInput('nombre')}
                                placeholder="Escribe aquí tu Nombre y Apellido"
                                value={valores.nombre}
                                onChange={e => cambiar('nombre', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.nombre}</div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="telefono" className="form-label text-dark fw-medium">Teléfono</label>
                            <input
                                id="telefono"
                                type="tel"
                                className={claseInput('telefono')}
                                placeholder="Indícanos un teléfono de contacto"
                                value={valores.telefono}
                                onChange={e => cambiar('telefono', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.telefono}</div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="form-label text-dark fw-medium">Email</label>
                            <input
                                id="email"
                                type="email"
                                className={claseInput('email')}
                                placeholder="¿A qué email te podemos escribir?"
                                value={valores.email}
                                onChange={e => cambiar('email', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.email}</div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="mensaje" className="form-label text-dark fw-medium">Mensaje</label>
                            <textarea
                                id="mensaje"
                                className={claseInput('mensaje')}
                                rows={2}
                                placeholder="Cuéntanos en qué podemos apoyarte"
                                value={valores.mensaje}
                                onChange={e => cambiar('mensaje', e.target.value)}
                            />
                            <div className="invalid-feedback">{mensajesError.mensaje}</div>
                        </div>

                        <p className="text-muted small mt-2 mb-4">
                            Este sitio está protegido por la política de privacidad y los términos del servicio de Google.
                        </p>

                        <button type="submit" className="btn btn-dark w-100 rounded-0 py-3 fw-bold">
                            ENVIAR
                        </button>

                    </form>

                </div>

                <div className="col-lg-6">
                    <div className="border-start-lg ps-lg-5 h-100 d-flex flex-column justify-content-center gap-5">

                        <div className="d-flex align-items-center gap-4">
                            <div className="fs-2">✉️</div>
                            <span className="text-secondary fs-5">contactoFerreteria@LosMaestros</span>
                        </div>

                        <div className="d-flex align-items-center gap-4">
                            <div className="fs-2">📞</div>
                            <span className="text-secondary fs-5">(+56 9)2450003</span>
                        </div>

                        <div className="d-flex align-items-center gap-4">
                            <div className="fs-2">📍</div>
                            <span className="text-secondary fs-5">
                                La Serena, Región de Coquimbo.<br />
                                calle universidad de chile 1
                            </span>
                        </div>

                    </div>
                </div>

            </div>

        </main>
    )
}
export default Contacto
