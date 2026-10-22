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

function Checkout({ items, subtotal, onPedidoRealizado }: CheckoutProps) {
    const [pedidoRealizado, setPedidoRealizado] = useState(false);

    const enviarPedido = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onPedidoRealizado();
        setPedidoRealizado(true);
    };

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
                    <form className="checkout-card" onSubmit={enviarPedido}>
                        <section className="mb-4" aria-labelledby="checkout-contacto">
                            <h2 id="checkout-contacto" className="contacto-subtitulo">Datos de contacto</h2>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-nombre">Nombre y apellido</label>
                                    <input className="form-control contacto-input" id="checkout-nombre" name="nombre" autoComplete="name" required minLength={3} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-email">Correo electrónico</label>
                                    <input className="form-control contacto-input" id="checkout-email" name="email" type="email" autoComplete="email" required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-telefono">Teléfono</label>
                                    <input className="form-control contacto-input" id="checkout-telefono" name="telefono" type="tel" autoComplete="tel" required minLength={8} />
                                </div>
                            </div>
                        </section>

                        <section className="mb-4" aria-labelledby="checkout-despacho">
                            <h2 id="checkout-despacho" className="contacto-subtitulo">Dirección de despacho</h2>
                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-direccion">Dirección</label>
                                    <input className="form-control contacto-input" id="checkout-direccion" name="direccion" autoComplete="street-address" required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-comuna">Comuna</label>
                                    <input className="form-control contacto-input" id="checkout-comuna" name="comuna" required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="checkout-region">Región</label>
                                    <input className="form-control contacto-input" id="checkout-region" name="region" required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label" htmlFor="checkout-referencia">Referencia (opcional)</label>
                                    <input className="form-control contacto-input" id="checkout-referencia" name="referencia" placeholder="Casa, departamento, indicaciones para llegar" />
                                </div>
                            </div>
                        </section>

                        <section className="mb-4" aria-labelledby="checkout-pago">
                            <h2 id="checkout-pago" className="contacto-subtitulo">Método de pago</h2>
                            <label className="form-label" htmlFor="checkout-metodo">Selecciona cómo pagarás</label>
                            <select className="form-select contacto-input" id="checkout-metodo" name="metodoPago" required defaultValue="">
                                <option value="" disabled>Selecciona un método</option>
                                <option value="tarjeta">Tarjeta de crédito o débito</option>
                                <option value="transferencia">Transferencia bancaria</option>
                                <option value="contra-entrega">Efectivo al recibir</option>
                            </select>
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
                            <span>Despacho</span>
                            <span>Por calcular</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between fw-bold fs-5">
                            <span>Subtotal</span>
                            <span className="total-orden">${subtotal.toLocaleString("es-CL")}</span>
                        </div>
                        <p className="form-text mt-3 mb-0">El costo de despacho se confirmará contigo antes de la entrega.</p>
                    </div>
                    <Link to="/carrito" className="btn btn-outline-dark w-100 mt-3">Volver al carrito</Link>
                </aside>
            </div>
        </main>
    );
}

export default Checkout;