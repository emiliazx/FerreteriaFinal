import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";

interface CheckoutItem {
    id: number;
    titulo: string;
    precio: number;
    cantidad: number;
}

interface CheckoutProps {
    items: CheckoutItem[];
    subtotal: number;
    onPedidoRealizado: () => void;
}

type Campo = "nombre" | "email" | "telefono" | "direccion" | "comuna" | "region" | "transportista" | "metodoPago";

const transportistas = {
    chilexpress: { nombre: "Chilexpress", plazo: "3-4 días hábiles", precio: 4990 },
    starken: { nombre: "Starken", plazo: "6-7 días hábiles", precio: 2990 },
} as const;

const validadores: Record<Campo, (valor: string) => boolean> = {
    nombre: valor => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/.test(valor.trim()),
    email: valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()),
    telefono: valor => valor.replace(/\D/g, "").length >= 8,
    direccion: valor => valor.trim().length >= 5,
    comuna: valor => valor.trim().length > 0,
    region: valor => valor.trim().length > 0,
    transportista: valor => valor === "chilexpress" || valor === "starken",
    metodoPago: valor => valor.length > 0,
};

const mensajesError: Record<Campo, string> = {
    nombre: "Ingresa tu nombre y apellido (mínimo 3 letras).",
    email: "Ingresa un correo con formato válido.",
    telefono: "Ingresa un teléfono válido (mínimo 8 dígitos).",
    direccion: "Ingresa una dirección válida (mínimo 5 caracteres).",
    comuna: "Ingresa tu comuna.",
    region: "Ingresa tu región.",
    transportista: "Selecciona un transportista para continuar.",
    metodoPago: "Selecciona un método de pago.",
};

function Checkout({ items, subtotal, onPedidoRealizado }: CheckoutProps) {
    const [pedidoRealizado, setPedidoRealizado] = useState(false);
    const [transportista, setTransportista] = useState<keyof typeof transportistas | "">("");
    const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});
    const [intentado, setIntentado] = useState(false);
    const costoDespacho = transportista ? transportistas[transportista].precio : 0;

    const cambiarCampo = (campo: Campo, valor: string) => {
        if (intentado) {
            setErrores(actuales => ({ ...actuales, [campo]: !validadores[campo](valor) }));
        }
    };

    const enviarPedido = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIntentado(true);
        const datos = new FormData(event.currentTarget);
        const valores: Record<Campo, string> = {
            nombre: String(datos.get("nombre") ?? ""),
            email: String(datos.get("email") ?? ""),
            telefono: String(datos.get("telefono") ?? ""),
            direccion: String(datos.get("direccion") ?? ""),
            comuna: String(datos.get("comuna") ?? ""),
            region: String(datos.get("region") ?? ""),
            transportista: String(datos.get("transportista") ?? ""),
            metodoPago: String(datos.get("metodoPago") ?? ""),
        };
        const nuevosErrores: Partial<Record<Campo, boolean>> = {};
        for (const campo of Object.keys(validadores) as Campo[]) {
            nuevosErrores[campo] = !validadores[campo](valores[campo]);
        }
        setErrores(nuevosErrores);
        if (Object.values(nuevosErrores).some(Boolean)) return;

        onPedidoRealizado();
        setPedidoRealizado(true);
    };
    const hayErrores = Object.values(errores).some(Boolean);

    if (pedidoRealizado) {
        return (
            <main className="container my-5">
                <div className="checkout-card checkout-confirmacion text-center mx-auto">
                    <div className="fs-1 mb-3" aria-hidden="true">✅</div>
                    <h1 className="fw-bold mb-3 titulo-seccion">¡Pedido realizado!</h1>
                    <p className="text-secondary mb-4" role="status">
                        Recibimos tu pedido correctamente. Pronto nos pondremos en contacto contigo para coordinar el despacho y el pago.
                    </p>
                    <Link to="/productos" className="btn btn-naranja fw-bold px-4 py-2">
                        SEGUIR COMPRANDO
                    </Link>
                </div>
            </main>
        );
    }

    if (items.length === 0) {
        return (
            <main className="container my-5">
                <div className="checkout-card text-center mx-auto">
                    <h1 className="fw-bold mb-3">Tu carrito está vacío</h1>
                    <p className="text-secondary">Agrega productos antes de continuar con tu compra.</p>
                    <Link to="/productos" className="btn btn-naranja fw-bold px-4 py-2">
                        VER CATÁLOGO
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="container checkout-page my-5">
            <div className="checkout-heading">
                <span className="contacto-eyebrow">FINALIZA TU COMPRA</span>
                <h1 className="fw-bold mb-2">Datos de despacho y pago</h1>
                <p className="text-secondary mb-0">Completa tus datos para confirmar el pedido.</p>
            </div>

            <div className="row g-4">
                <div className="col-12 col-lg-7">
                    <form className="checkout-card" onSubmit={enviarPedido} noValidate>
                        {hayErrores && (
                            <div className="alert alert-danger py-2 px-3 small" role="alert">
                                ⚠ Revisa los campos marcados en rojo antes de confirmar tu pedido.
                            </div>
                        )}
                        <section className="mb-4" aria-labelledby="checkout-contacto">
                            <h2 id="checkout-contacto" className="contacto-subtitulo">Datos de contacto</h2>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-nombre">Nombre y apellido</label>
                                    <input className={`form-control contacto-input${errores.nombre ? " is-invalid" : ""}`} id="checkout-nombre" name="nombre" autoComplete="name" onChange={e => cambiarCampo("nombre", e.target.value)} aria-invalid={Boolean(errores.nombre)} />
                                    {errores.nombre && <div className="invalid-feedback">{mensajesError.nombre}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-email">Correo electrónico</label>
                                    <input className={`form-control contacto-input${errores.email ? " is-invalid" : ""}`} id="checkout-email" name="email" type="email" autoComplete="email" onChange={e => cambiarCampo("email", e.target.value)} aria-invalid={Boolean(errores.email)} />
                                    {errores.email && <div className="invalid-feedback">{mensajesError.email}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-telefono">Teléfono</label>
                                    <input className={`form-control contacto-input${errores.telefono ? " is-invalid" : ""}`} id="checkout-telefono" name="telefono" type="tel" autoComplete="tel" onChange={e => cambiarCampo("telefono", e.target.value)} aria-invalid={Boolean(errores.telefono)} />
                                    {errores.telefono && <div className="invalid-feedback">{mensajesError.telefono}</div>}
                                </div>
                            </div>
                        </section>

                        <section className="mb-4" aria-labelledby="checkout-despacho">
                            <h2 id="checkout-despacho" className="contacto-subtitulo">Dirección de despacho</h2>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-direccion">Dirección</label>
                                    <input className={`form-control contacto-input${errores.direccion ? " is-invalid" : ""}`} id="checkout-direccion" name="direccion" autoComplete="street-address" onChange={e => cambiarCampo("direccion", e.target.value)} aria-invalid={Boolean(errores.direccion)} />
                                    {errores.direccion && <div className="invalid-feedback">{mensajesError.direccion}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-comuna">Comuna</label>
                                    <input className={`form-control contacto-input${errores.comuna ? " is-invalid" : ""}`} id="checkout-comuna" name="comuna" onChange={e => cambiarCampo("comuna", e.target.value)} aria-invalid={Boolean(errores.comuna)} />
                                    {errores.comuna && <div className="invalid-feedback">{mensajesError.comuna}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-region">Región</label>
                                    <input className={`form-control contacto-input${errores.region ? " is-invalid" : ""}`} id="checkout-region" name="region" onChange={e => cambiarCampo("region", e.target.value)} aria-invalid={Boolean(errores.region)} />
                                    {errores.region && <div className="invalid-feedback">{mensajesError.region}</div>}
                                </div>
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-referencia">Referencia (opcional)</label>
                                    <input className="form-control contacto-input" id="checkout-referencia" name="referencia" placeholder="Casa, departamento, indicaciones para llegar" />
                                </div>
                            </div>
                        </section>

                        <fieldset className="mb-4" aria-describedby={errores.transportista ? "checkout-transportista-error" : undefined}>
                            <legend className="contacto-subtitulo">Elige tu transportista</legend>
                            <div className="row g-3">
                                {(Object.entries(transportistas) as [keyof typeof transportistas, typeof transportistas[keyof typeof transportistas]][]).map(([id, opcion]) => (
                                    <div className="col-12 col-md-6" key={id}>
                                        <label
                                            className={`checkout-carrier-option${transportista === id ? " seleccionado" : ""}${errores.transportista ? " is-invalid" : ""}`}
                                            htmlFor={`checkout-transportista-${id}`}
                                        >
                                            <input
                                                className="form-check-input mt-1"
                                                type="radio"
                                                id={`checkout-transportista-${id}`}
                                                name="transportista"
                                                value={id}
                                                checked={transportista === id}
                                                onChange={() => {
                                                    setTransportista(id);
                                                    cambiarCampo("transportista", id);
                                                }}
                                                aria-invalid={Boolean(errores.transportista)}
                                            />
                                            <span className="checkout-carrier-details">
                                                <span className="fw-bold">{opcion.nombre}</span>
                                                <span className="text-secondary">{opcion.plazo}</span>
                                                <span className="fw-semibold">${opcion.precio.toLocaleString("es-CL")}</span>
                                            </span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                            {errores.transportista && <div id="checkout-transportista-error" className="text-danger small mt-2">{mensajesError.transportista}</div>}
                        </fieldset>

                        <section className="mb-4" aria-labelledby="checkout-pago">
                            <h2 id="checkout-pago" className="contacto-subtitulo">Método de pago</h2>
                            <label className="form-label" htmlFor="checkout-metodo">Selecciona cómo pagarás</label>
                            <select className={`form-select contacto-input${errores.metodoPago ? " is-invalid" : ""}`} id="checkout-metodo" name="metodoPago" defaultValue="" onChange={e => cambiarCampo("metodoPago", e.target.value)} aria-invalid={Boolean(errores.metodoPago)}>
                                <option value="" disabled>Selecciona un método</option>
                                <option value="tarjeta">Tarjeta de crédito o débito</option>
                                <option value="transferencia">Transferencia bancaria</option>
                                <option value="contra-entrega">Efectivo al recibir</option>
                            </select>
                            {errores.metodoPago && <div className="invalid-feedback">{mensajesError.metodoPago}</div>}
                            <p className="form-text mb-0">El pago se coordinará contigo al confirmar el despacho. No ingreses datos de tarjeta en este sitio.</p>
                        </section>

                        <button type="submit" className="btn btn-naranja w-100 fw-bold py-3">
                            CONFIRMAR PEDIDO
                        </button>
                    </form>
                </div>

                <aside className="col-12 col-lg-5" aria-labelledby="checkout-resumen">
                    <div className="checkout-card checkout-resumen">
                        <h2 id="checkout-resumen" className="contacto-subtitulo">Resumen de tu pedido</h2>
                        <ul className="list-unstyled mb-3">
                            {items.map(item => (
                                <li key={item.id} className="d-flex justify-content-between gap-3 py-2 border-bottom">
                                    <span>{item.titulo} <span className="text-secondary">× {item.cantidad}</span></span>
                                    <span className="text-nowrap">${(item.precio * item.cantidad).toLocaleString("es-CL")}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="d-flex justify-content-between text-secondary mb-2">
                            <span>Despacho{transportista ? ` (${transportistas[transportista].nombre})` : ""}</span>
                            <span>{transportista ? `$${costoDespacho.toLocaleString("es-CL")}` : "Selecciona un transportista"}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold fs-5">
                            <span>Total a pagar</span>
                            <span className="total-orden">${(subtotal + costoDespacho).toLocaleString("es-CL")}</span>
                        </div>
                        <p className="form-text mt-3 mb-0">El total incluye el costo de despacho del transportista seleccionado.</p>
                    </div>
                    <Link to="/carrito" className="btn btn-outline-dark w-100 mt-3">Volver al carrito</Link>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;