import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { crearNotificacion } from "../../api/notificaciones";
import { crearOrden } from "../../api/pedidos";
import { procesarPago } from "../../api/pagos";

type Campo =
    | "nombre"
    | "email"
    | "telefono"
    | "direccion"
    | "comuna"
    | "region"
    | "transportista"
    | "metodoPago";

type CampoTarjeta = "titular" | "numero" | "vencimiento" | "cvv";

type MetodoPagoForm = "tarjeta" | "transferencia";
type MetodoPagoBackend = "TARJETA" | "TRANSFERENCIA";

const metodosBackend: Record<MetodoPagoForm, MetodoPagoBackend> = {
    tarjeta: "TARJETA",
    transferencia: "TRANSFERENCIA",
};

const transportistas = {
    chilexpress: { nombre: "Chilexpress", plazo: "3-4 días hábiles", precio: 4990 },
    starken: { nombre: "Starken", plazo: "6-7 días hábiles", precio: 2990 },
} as const;

const BANCOS_CHILE = [
    "Banco Estado",
    "Banco de Chile",
    "Banco Santander",
    "Banco BCI",
    "Banco Scotiabank",
    "Banco Itaú",
];

const validadores: Record<Campo, (valor: string) => boolean> = {
    nombre: valor => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/.test(valor.trim()),
    email: valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()),
    telefono: valor => valor.replace(/\D/g, "").length >= 8,
    direccion: valor => valor.trim().length >= 5,
    comuna: valor => valor.trim().length > 0,
    region: valor => valor.trim().length > 0,
    transportista: valor => valor === "chilexpress" || valor === "starken",
    metodoPago: valor => valor === "tarjeta" || valor === "transferencia",
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

function formatearNumeroTarjeta(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 19);
    const grupos = digits.match(/.{1,4}/g);
    return grupos ? grupos.join(" ") : "";
}

function formatearVencimiento(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatearCvv(raw: string): string {
    return raw.replace(/\D/g, "").slice(0, 4);
}

function esLuhnValido(digits: string): boolean {
    let suma = 0;
    for (let i = digits.length - 1; i >= 0; i--) {
        let digito = Number(digits[i]);
        if ((digits.length - i) % 2 === 0) {
            digito *= 2;
            if (digito > 9) digito -= 9;
        }
        suma += digito;
    }
    return digits.length > 0 && suma % 10 === 0;
}

function validarCampoTarjeta(
    campo: CampoTarjeta,
    valores: { titular: string; numero: string; vencimiento: string; cvv: string }
): string | undefined {
    if (campo === "titular") {
        if (valores.titular.trim().length < 3) {
            return "Ingresa el nombre del titular (mínimo 3 caracteres).";
        }
        return undefined;
    }
    if (campo === "numero") {
        const digits = valores.numero.replace(/\D/g, "");
        if (digits.length < 13 || digits.length > 19 || !esLuhnValido(digits)) {
            return "Ingresa un número de tarjeta válido (13 a 19 dígitos).";
        }
        return undefined;
    }
    if (campo === "vencimiento") {
        const match = /^(\d{2})\/(\d{2})$/.exec(valores.vencimiento.trim());
        if (!match) {
            return "Ingresa el vencimiento en formato MM/YY.";
        }
        const mes = Number(match[1]);
        const anio = 2000 + Number(match[2]);
        const ahora = new Date();
        const mesActual = ahora.getMonth() + 1;
        const anioActual = ahora.getFullYear();
        if (mes < 1 || mes > 12 || anio < anioActual || (anio === anioActual && mes < mesActual)) {
            return "Vencimiento inválido o tarjeta vencida.";
        }
        return undefined;
    }
    if (campo === "cvv") {
        if (!/^\d{3,4}$/.test(valores.cvv.trim())) {
            return "Ingresa un CVV de 3 o 4 dígitos.";
        }
        return undefined;
    }
    return undefined;
}

type ResumenConfirmacion = {
    ordenId?: string | number;
    total: number;
    metodoPago: string;
    estadoPago?: string;
    comprobante?: string;
    bancoOrigen?: string;
    codigoTransferencia?: string;
};

function obtenerMensajeError(err: unknown, fallback: string): string {
    if (err instanceof Error && err.message.trim()) {
        try {
            const idx = err.message.indexOf("{");
            if (idx !== -1) {
                const parsed = JSON.parse(err.message.slice(idx));
                if (typeof parsed?.message === "string" && parsed.message.trim()) {
                    return parsed.message;
                }
            }
        } catch {
            // Si no contiene JSON, se retorna el mensaje directo
        }
        return err.message.trim();
    }
    return fallback;
}

function Checkout() {
    const { items, subtotal, vaciar } = useCart();
    const { user } = useAuth();

    const [pedidoRealizado, setPedidoRealizado] = useState(false);
    const [resumenConfirmacion, setResumenConfirmacion] = useState<ResumenConfirmacion | null>(null);
    const [transportista, setTransportista] = useState<keyof typeof transportistas | "">("");
    const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState<MetodoPagoForm | "">("");

    const [titularTarjeta, setTitularTarjeta] = useState("");
    const [numeroTarjeta, setNumeroTarjeta] = useState("");
    const [vencimientoTarjeta, setVencimientoTarjeta] = useState("");
    const [cvvTarjeta, setCvvTarjeta] = useState("");
    const [erroresTarjeta, setErroresTarjeta] = useState<Partial<Record<CampoTarjeta, string>>>({});

    // Simulación bancaria para transferencia
    const [bancoOrigen, setBancoOrigen] = useState(BANCOS_CHILE[0]);
    const [codigoTransferencia, setCodigoTransferencia] = useState("");
    const [errorTransferencia, setErrorTransferencia] = useState<string | null>(null);

    const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});
    const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
    const [intentado, setIntentado] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [estadoBancoSim, setEstadoBancoSim] = useState<string | null>(null);

    const costoDespacho = transportista ? transportistas[transportista].precio : 0;

    const cambiarCampo = (campo: Campo, valor: string) => {
        if (errorEnvio) {
            setErrorEnvio(null);
        }
        if (intentado) {
            setErrores(actuales => ({ ...actuales, [campo]: !validadores[campo](valor) }));
        }
    };

    const cambiarCampoTarjeta = (
        campo: CampoTarjeta,
        valor: string,
        overrides?: Partial<{ titular: string; numero: string; vencimiento: string; cvv: string }>
    ) => {
        if (errorEnvio) {
            setErrorEnvio(null);
        }
        if (intentado) {
            const snapshot = {
                titular: titularTarjeta,
                numero: numeroTarjeta,
                vencimiento: vencimientoTarjeta,
                cvv: cvvTarjeta,
                ...overrides,
                [campo]: valor,
            };
            const msg = validarCampoTarjeta(campo, snapshot);
            setErroresTarjeta(prev => {
                const next = { ...prev };
                if (msg) next[campo] = msg;
                else delete next[campo];
                return next;
            });
        }
    };

    const enviarPedido = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIntentado(true);
        setErrorEnvio(null);
        setErrorTransferencia(null);

        const datos = new FormData(event.currentTarget);
        const valores: Record<Campo, string> = {
            nombre: String(datos.get("nombre") ?? ""),
            email: String(datos.get("email") ?? ""),
            telefono: String(datos.get("telefono") ?? ""),
            direccion: String(datos.get("direccion") ?? ""),
            comuna: String(datos.get("comuna") ?? ""),
            region: String(datos.get("region") ?? ""),
            transportista: String(datos.get("transportista") ?? ""),
            metodoPago: String(datos.get("metodoPago") ?? metodoPagoSeleccionado),
        };
        const referenciaTexto = String(datos.get("referencia") ?? "").trim();

        const nuevosErrores: Partial<Record<Campo, boolean>> = {};
        for (const campo of Object.keys(validadores) as Campo[]) {
            nuevosErrores[campo] = !validadores[campo](valores[campo]);
        }
        setErrores(nuevosErrores);

        const metodoForm = valores.metodoPago as MetodoPagoForm;
        const metodoApi = metodoForm ? metodosBackend[metodoForm] : undefined;

        const nuevosErroresTarjeta: Partial<Record<CampoTarjeta, string>> = {};
        if (metodoApi === "TARJETA") {
            const snapshot = {
                titular: titularTarjeta,
                numero: numeroTarjeta,
                vencimiento: vencimientoTarjeta,
                cvv: cvvTarjeta,
            };
            for (const c of ["titular", "numero", "vencimiento", "cvv"] as CampoTarjeta[]) {
                const msg = validarCampoTarjeta(c, snapshot);
                if (msg) nuevosErroresTarjeta[c] = msg;
            }
        }
        setErroresTarjeta(nuevosErroresTarjeta);

        let codigoOperacionFinal = codigoTransferencia.trim();
        if (metodoApi === "TRANSFERENCIA") {
            if (!bancoOrigen) {
                setErrorTransferencia("Selecciona tu banco de origen para simular la conexión.");
                return;
            }
            if (!codigoOperacionFinal) {
                codigoOperacionFinal = `TRF-${Date.now().toString().slice(-6)}`;
                setCodigoTransferencia(codigoOperacionFinal);
            }
        }

        if (Object.values(nuevosErrores).some(Boolean) || Object.keys(nuevosErroresTarjeta).length > 0) {
            return;
        }

        const emailNormalizado = valores.email.trim().toLowerCase();
        const nombreLimpio = valores.nombre.trim();

        setEnviando(true);
        if (metodoApi === "TRANSFERENCIA") {
            setEstadoBancoSim(`Conectando con ${bancoOrigen}... verificando transferencia ${codigoOperacionFinal}`);
            await new Promise(resolve => setTimeout(resolve, 700));
            setEstadoBancoSim(`Transferencia validada con ${bancoOrigen} · Confirmando pedido...`);
        } else {
            setEstadoBancoSim(null);
        }

        try {
            const ordenCreada = await crearOrden({
                userId: user?.userId,
                email: emailNormalizado,
                nombreCliente: nombreLimpio,
                telefono: valores.telefono.trim(),
                direccion: valores.direccion.trim(),
                comuna: valores.comuna.trim(),
                region: valores.region.trim(),
                referencia: referenciaTexto || undefined,
                transportista: valores.transportista,
                costoDespacho,
                metodoPago: metodoApi,
                items: items.map(item => ({
                    productoId: item.id,
                    titulo: item.titulo,
                    precioUnitario: item.precio,
                    cantidad: item.cantidad,
                    imagen: item.imagen,
                })),
            });

            const montoFinal = ordenCreada?.total ?? subtotal + costoDespacho;

            const pagoResult = await procesarPago({
                ordenId: ordenCreada.id,
                monto: montoFinal,
                metodo: metodoApi!,
                ...(metodoApi === "TARJETA"
                    ? {
                          titular: titularTarjeta.trim(),
                          numeroTarjeta: numeroTarjeta.trim(),
                          vencimiento: vencimientoTarjeta.trim(),
                          cvv: cvvTarjeta.trim(),
                      }
                    : {}),
            });

            try {
                await crearNotificacion({
                    email: emailNormalizado,
                    tipo: "PEDIDO",
                    titulo: `Pedido #${ordenCreada.id} recibido`,
                    mensaje: `Pedido de ${nombreLimpio}. Total: $${montoFinal.toLocaleString("es-CL")}. Dirección: ${valores.direccion.trim()}, ${valores.comuna.trim()}.`,
                });
            } catch {
                // No bloquear la confirmación si la notificación falla
            }

            setResumenConfirmacion({
                ordenId: ordenCreada.id,
                total: montoFinal,
                metodoPago: metodoApi!,
                estadoPago: pagoResult?.estado ?? "CONFIRMADO",
                comprobante:
                    pagoResult?.comprobante ??
                    (pagoResult?.id !== undefined ? String(pagoResult.id) : undefined),
                bancoOrigen: metodoApi === "TRANSFERENCIA" ? bancoOrigen : undefined,
                codigoTransferencia: metodoApi === "TRANSFERENCIA" ? codigoOperacionFinal : undefined,
            });

            vaciar();
            setPedidoRealizado(true);
        } catch (err) {
            setEstadoBancoSim(null);
            setErrorEnvio(
                obtenerMensajeError(err, "Error al confirmar el pedido. Verifica tus datos e intenta de nuevo.")
            );
        } finally {
            setEnviando(false);
        }
    };

    const hayErrores = Object.values(errores).some(Boolean) || Object.keys(erroresTarjeta).length > 0;

    if (pedidoRealizado) {
        return (
            <main className="container my-5">
                <div className="checkout-card checkout-confirmacion text-center mx-auto">
                    <div className="fs-1 mb-3" aria-hidden="true">✅</div>
                    <h1 className="fw-bold mb-3 titulo-seccion">¡Pedido realizado!</h1>
                    <p className="text-secondary mb-3" role="status">
                        Recibimos tu pedido correctamente. Pronto nos pondremos en contacto contigo para coordinar el despacho y el pago.
                    </p>
                    {resumenConfirmacion && (
                        <div className="border rounded p-3 mb-4 text-start bg-light small">
                            {resumenConfirmacion.ordenId !== undefined && (
                                <div className="mb-1">
                                    <strong>N° de pedido:</strong> #{resumenConfirmacion.ordenId}
                                </div>
                            )}
                            <div className="mb-1">
                                <strong>Total pagado:</strong> ${resumenConfirmacion.total.toLocaleString("es-CL")}
                            </div>
                            <div className="mb-1">
                                <strong>Método de pago:</strong> {resumenConfirmacion.metodoPago}
                            </div>
                            {resumenConfirmacion.bancoOrigen && (
                                <div className="mb-1">
                                    <strong>Banco origen:</strong> {resumenConfirmacion.bancoOrigen}
                                </div>
                            )}
                            {resumenConfirmacion.codigoTransferencia && (
                                <div className="mb-1">
                                    <strong>N° operación bancaria (simulada):</strong> {resumenConfirmacion.codigoTransferencia}
                                </div>
                            )}
                            {resumenConfirmacion.estadoPago && (
                                <div className="mb-1">
                                    <strong>Estado del pago:</strong> {resumenConfirmacion.estadoPago}
                                </div>
                            )}
                            {resumenConfirmacion.comprobante && (
                                <div>
                                    <strong>Comprobante:</strong> {resumenConfirmacion.comprobante}
                                </div>
                            )}
                        </div>
                    )}
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
                        {errorEnvio && (
                            <div className="alert alert-danger py-2 px-3 small" role="alert">
                                ⚠ {errorEnvio}
                            </div>
                        )}
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
                            <select
                                className={`form-select contacto-input${errores.metodoPago ? " is-invalid" : ""}`}
                                id="checkout-metodo"
                                name="metodoPago"
                                value={metodoPagoSeleccionado}
                                onChange={e => {
                                    const val = e.target.value as MetodoPagoForm | "";
                                    setMetodoPagoSeleccionado(val);
                                    if (val !== "tarjeta") setErroresTarjeta({});
                                    if (val !== "transferencia") setErrorTransferencia(null);
                                    cambiarCampo("metodoPago", val);
                                }}
                                aria-invalid={Boolean(errores.metodoPago)}
                            >
                                <option value="" disabled>Selecciona un método</option>
                                <option value="tarjeta">Tarjeta de crédito o débito</option>
                                <option value="transferencia">Transferencia bancaria</option>
                            </select>
                            {errores.metodoPago && <div className="invalid-feedback">{mensajesError.metodoPago}</div>}

                            {metodoPagoSeleccionado === "tarjeta" && (
                                <div className="row g-3 mt-2 p-3 border rounded bg-light">
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="checkout-titular">Titular de la tarjeta</label>
                                        <input
                                            id="checkout-titular"
                                            type="text"
                                            className={`form-control contacto-input${erroresTarjeta.titular ? " is-invalid" : ""}`}
                                            placeholder="Como figura en la tarjeta"
                                            value={titularTarjeta}
                                            aria-invalid={Boolean(erroresTarjeta.titular)}
                                            onChange={e => {
                                                setTitularTarjeta(e.target.value);
                                                cambiarCampoTarjeta("titular", e.target.value);
                                            }}
                                        />
                                        {erroresTarjeta.titular && <div className="invalid-feedback">{erroresTarjeta.titular}</div>}
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label" htmlFor="checkout-numero-tarjeta">Número de tarjeta</label>
                                        <input
                                            id="checkout-numero-tarjeta"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={23}
                                            className={`form-control contacto-input${erroresTarjeta.numero ? " is-invalid" : ""}`}
                                            placeholder="4532 0151 1283 0366"
                                            value={numeroTarjeta}
                                            aria-invalid={Boolean(erroresTarjeta.numero)}
                                            onChange={e => {
                                                const formateado = formatearNumeroTarjeta(e.target.value);
                                                setNumeroTarjeta(formateado);
                                                cambiarCampoTarjeta("numero", formateado);
                                            }}
                                        />
                                        {erroresTarjeta.numero && <div className="invalid-feedback">{erroresTarjeta.numero}</div>}
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label" htmlFor="checkout-vencimiento">Vencimiento (MM/YY)</label>
                                        <input
                                            id="checkout-vencimiento"
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={5}
                                            className={`form-control contacto-input${erroresTarjeta.vencimiento ? " is-invalid" : ""}`}
                                            placeholder="12/28"
                                            value={vencimientoTarjeta}
                                            aria-invalid={Boolean(erroresTarjeta.vencimiento)}
                                            onChange={e => {
                                                const formateado = formatearVencimiento(e.target.value);
                                                setVencimientoTarjeta(formateado);
                                                cambiarCampoTarjeta("vencimiento", formateado);
                                            }}
                                        />
                                        {erroresTarjeta.vencimiento && <div className="invalid-feedback">{erroresTarjeta.vencimiento}</div>}
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label" htmlFor="checkout-cvv">CVV</label>
                                        <input
                                            id="checkout-cvv"
                                            type="password"
                                            inputMode="numeric"
                                            maxLength={4}
                                            className={`form-control contacto-input${erroresTarjeta.cvv ? " is-invalid" : ""}`}
                                            placeholder="123"
                                            value={cvvTarjeta}
                                            aria-invalid={Boolean(erroresTarjeta.cvv)}
                                            onChange={e => {
                                                const formateado = formatearCvv(e.target.value);
                                                setCvvTarjeta(formateado);
                                                cambiarCampoTarjeta("cvv", formateado);
                                            }}
                                        />
                                        {erroresTarjeta.cvv && <div className="invalid-feedback">{erroresTarjeta.cvv}</div>}
                                    </div>
                                </div>
                            )}

                            {metodoPagoSeleccionado === "transferencia" && (
                                <div className="mt-2 p-3 border rounded bg-light small">
                                    <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                                        <strong>Simulación de transferencia bancaria</strong>
                                        <span className="badge text-bg-warning">Conexión bancaria (simulación)</span>
                                    </div>
                                    <p className="text-secondary mb-3">
                                        Conectando con tu banco para autorizar la transferencia hacia{" "}
                                        <strong>Ferretería Los Maestros SpA</strong> (Cuenta Corriente Banco Estado N° 123456789 · RUT 76.543.210-K).
                                    </p>

                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <label className="form-label" htmlFor="checkout-banco-origen">
                                                Banco desde el que transfieres
                                            </label>
                                            <select
                                                id="checkout-banco-origen"
                                                className="form-select contacto-input"
                                                value={bancoOrigen}
                                                onChange={e => {
                                                    setBancoOrigen(e.target.value);
                                                    setErrorTransferencia(null);
                                                }}
                                            >
                                                {BANCOS_CHILE.map(b => (
                                                    <option key={b} value={b}>
                                                        {b}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label" htmlFor="checkout-codigo-transferencia">
                                                N° de operación / transferencia (opcional)
                                            </label>
                                            <input
                                                id="checkout-codigo-transferencia"
                                                type="text"
                                                className="form-control contacto-input"
                                                placeholder="Se genera automáticamente si lo dejas vacío"
                                                value={codigoTransferencia}
                                                onChange={e => {
                                                    setCodigoTransferencia(e.target.value);
                                                    setErrorTransferencia(null);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {errorTransferencia && (
                                        <div className="text-danger mt-2">{errorTransferencia}</div>
                                    )}
                                    {estadoBancoSim && (
                                        <div className="alert alert-info py-2 px-3 mt-3 mb-0" role="status">
                                            🏦 {estadoBancoSim}
                                        </div>
                                    )}
                                </div>
                            )}
                        </section>

                        <button type="submit" className="btn btn-naranja w-100 fw-bold py-3" disabled={enviando}>
                            {enviando ? "CONECTANDO CON TU BANCO..." : "CONFIRMAR PEDIDO"}
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