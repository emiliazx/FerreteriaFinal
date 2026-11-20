import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { crearNotificacion } from "../../api/notificaciones";
import { crearOrden, type OrdenResponse } from "../../api/pedidos";
import { procesarPago, type PagoResponse } from "../../api/pagos";

type Campo =
  | "nombre"
  | "email"
  | "telefono"
  | "direccion"
  | "comuna"
  | "region"
  | "transportista"
  | "metodoPago"
  | "numeroTarjeta"
  | "titular"
  | "vencimiento"
  | "cvv";

const transportistas = {
  chilexpress: { nombre: "Chilexpress", plazo: "3-4 días hábiles", precio: 4990 },
  starken: { nombre: "Starken", plazo: "6-7 días hábiles", precio: 2990 },
} as const;

const validadores: Record<Campo, (valor: string, metodo?: string) => boolean> = {
  nombre: (valor) => /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]{3,}$/.test(valor.trim()),
  email: (valor) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim()),
  telefono: (valor) => valor.replace(/\D/g, "").length >= 8,
  direccion: (valor) => valor.trim().length >= 5,
  comuna: (valor) => valor.trim().length > 0,
  region: (valor) => valor.trim().length > 0,
  transportista: (valor) => valor === "chilexpress" || valor === "starken",
  metodoPago: (valor) => valor === "tarjeta" || valor === "transferencia",
  numeroTarjeta: (valor, metodo) =>
    metodo !== "tarjeta" || valor.replace(/\D/g, "").length >= 13,
  titular: (valor, metodo) => metodo !== "tarjeta" || valor.trim().length >= 3,
  vencimiento: (valor, metodo) =>
    metodo !== "tarjeta" || /^\d{2}\/\d{2}$/.test(valor.trim()),
  cvv: (valor, metodo) => metodo !== "tarjeta" || /^\d{3,4}$/.test(valor.trim()),
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
  numeroTarjeta: "Ingresa un número de tarjeta válido (13-19 dígitos).",
  titular: "Ingresa el nombre del titular de la tarjeta.",
  vencimiento: "Formato de vencimiento inválido (MM/YY).",
  cvv: "CVV inválido (3 o 4 dígitos).",
};

function Checkout() {
  const { items, subtotal, vaciar } = useCart();
  const { user } = useAuth();
  const [pedidoRealizado, setPedidoRealizado] = useState(false);
  const [ordenCreada, setOrdenCreada] = useState<OrdenResponse | null>(null);
  const [pagoResultado, setPagoResultado] = useState<PagoResponse | null>(null);
  const [transportista, setTransportista] = useState<keyof typeof transportistas | "">("");
  const [metodoPago, setMetodoPago] = useState("");
  const [errores, setErrores] = useState<Partial<Record<Campo, boolean>>>({});
  const [intentado, setIntentado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const costoDespacho = transportista ? transportistas[transportista].precio : 0;

  const cambiarCampo = (campo: Campo, valor: string) => {
    if (campo === "metodoPago") setMetodoPago(valor);
    if (intentado) {
      setErrores((actuales) => ({
        ...actuales,
        [campo]: !validadores[campo](valor, metodoPago || valor),
      }));
    }
  };

  const enviarPedido = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIntentado(true);
    setErrorMsg(null);
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
      numeroTarjeta: String(datos.get("numeroTarjeta") ?? ""),
      titular: String(datos.get("titular") ?? ""),
      vencimiento: String(datos.get("vencimiento") ?? ""),
      cvv: String(datos.get("cvv") ?? ""),
    };
    const metodo = valores.metodoPago;
    const nuevosErrores: Partial<Record<Campo, boolean>> = {};
    for (const campo of Object.keys(validadores) as Campo[]) {
      nuevosErrores[campo] = !validadores[campo](valores[campo], metodo);
    }
    setErrores(nuevosErrores);
    if (Object.values(nuevosErrores).some(Boolean)) return;
    if (items.length === 0) {
      setErrorMsg("El carrito está vacío.");
      return;
    }

    setEnviando(true);
    try {
      const total = subtotal + costoDespacho;

      // 1. Crear orden (snapshot de productos del carrito)
      const orden = await crearOrden({
        userId: user?.userId,
        email: valores.email.trim(),
        nombreCliente: valores.nombre.trim(),
        telefono: valores.telefono.trim(),
        direccion: valores.direccion.trim(),
        comuna: valores.comuna.trim(),
        region: valores.region.trim(),
        referencia: String(datos.get("referencia") ?? "") || undefined,
        transportista: valores.transportista,
        costoDespacho,
        metodoPago: metodo === "tarjeta" ? "TARJETA" : "TRANSFERENCIA",
        items: items.map((item) => ({
          productoId: item.id,
          titulo: item.titulo,
          precioUnitario: item.precio,
          cantidad: item.cantidad,
          imagen: item.imagen,
        })),
      });
      setOrdenCreada(orden);

      // 2. Procesar pago simulado
      const pago = await procesarPago({
        ordenId: orden.id,
        monto: total,
        metodo: metodo === "tarjeta" ? "TARJETA" : "TRANSFERENCIA",
        numeroTarjeta: metodo === "tarjeta" ? valores.numeroTarjeta : undefined,
        titular: metodo === "tarjeta" ? valores.titular : valores.nombre,
        vencimiento: metodo === "tarjeta" ? valores.vencimiento : undefined,
        cvv: metodo === "tarjeta" ? valores.cvv : undefined,
      });
      setPagoResultado(pago);

      // 3. Notificación
      try {
        await crearNotificacion({
          userId: user?.userId,
          email: user?.email ?? valores.email.trim(),
          tipo: "PEDIDO",
          titulo: pago.estado === "APROBADO" ? "Pedido y pago confirmados" : "Pedido recibido – pago no aprobado",
          mensaje: `Pedido #${orden.id}. Total: $${total.toLocaleString("es-CL")}. ` +
            `Comprobante: ${pago.comprobante}. Estado pago: ${pago.estado}. ` +
            `Dirección: ${valores.direccion}, ${valores.comuna}.`,
        });
      } catch {
        /* no bloquear si falla la notificación */
      }

      if (pago.estado === "APROBADO") {
        vaciar();
      }
      setPedidoRealizado(true);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? String((err as { message: string }).message)
          : "Error al confirmar el pedido. Intenta de nuevo.";
      setErrorMsg(msg);
    } finally {
      setEnviando(false);
    }
  };

  if (pedidoRealizado && ordenCreada && pagoResultado) {
    const aprobado = pagoResultado.estado === "APROBADO";
    return (
      <main className="container my-5">
        <div className="checkout-card checkout-confirmacion text-center mx-auto">
          <div className="fs-1 mb-3" aria-hidden="true">
            {aprobado ? "✅" : "⚠️"}
          </div>
          <h1 className="fw-bold mb-3 titulo-seccion">
            {aprobado ? "¡Pedido y pago confirmados!" : "Pedido registrado – pago rechazado"}
          </h1>
          <p className="text-secondary mb-2" role="status">
            Orden <strong>#{ordenCreada.id}</strong> · Estado: <strong>{ordenCreada.estado}</strong>
          </p>
          <p className="mb-2">
            Comprobante de pago: <code className="fw-bold">{pagoResultado.comprobante}</code>
          </p>
          <p className="text-secondary mb-2">
            {pagoResultado.mensaje}
            {pagoResultado.tarjetaMask && (
              <> · Tarjeta {pagoResultado.tarjetaMask}</>
            )}
          </p>
          <p className="text-secondary mb-4">
            Total: <strong>${Number(ordenCreada.total).toLocaleString("es-CL")}</strong>
          </p>
          {!aprobado && (
            <p className="text-danger small mb-3">
              Tip de simulación: usa una tarjeta que no termine en 0000 y un CVV distinto de 000.
            </p>
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
      <main className="container my-5 text-center">
        <h1 className="titulo-seccion">Checkout</h1>
        <p className="text-secondary">Tu carrito está vacío.</p>
        <Link to="/productos" className="btn btn-naranja">
          Ver productos
        </Link>
      </main>
    );
  }

  return (
    <main className="container my-5">
      <h1 className="titulo-seccion mb-4">Finalizar compra</h1>
      {errorMsg && (
        <div className="alert alert-danger" role="alert">
          {errorMsg}
        </div>
      )}
      <div className="row g-4">
        <div className="col-12 col-lg-7">
          <form className="checkout-card" onSubmit={enviarPedido} noValidate>
            <section className="mb-4" aria-labelledby="checkout-datos">
              <h2 id="checkout-datos" className="contacto-subtitulo">
                Datos de contacto
              </h2>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-nombre">
                    Nombre completo
                  </label>
                  <input
                    className={`form-control contacto-input${errores.nombre ? " is-invalid" : ""}`}
                    id="checkout-nombre"
                    name="nombre"
                    defaultValue={user?.nombre ?? ""}
                    autoComplete="name"
                    onChange={(e) => cambiarCampo("nombre", e.target.value)}
                  />
                  {errores.nombre && <div className="invalid-feedback">{mensajesError.nombre}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-email">
                    Correo
                  </label>
                  <input
                    className={`form-control contacto-input${errores.email ? " is-invalid" : ""}`}
                    id="checkout-email"
                    name="email"
                    type="email"
                    defaultValue={user?.email ?? ""}
                    autoComplete="email"
                    onChange={(e) => cambiarCampo("email", e.target.value)}
                  />
                  {errores.email && <div className="invalid-feedback">{mensajesError.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-telefono">
                    Teléfono
                  </label>
                  <input
                    className={`form-control contacto-input${errores.telefono ? " is-invalid" : ""}`}
                    id="checkout-telefono"
                    name="telefono"
                    autoComplete="tel"
                    onChange={(e) => cambiarCampo("telefono", e.target.value)}
                  />
                  {errores.telefono && <div className="invalid-feedback">{mensajesError.telefono}</div>}
                </div>
              </div>
            </section>

            <section className="mb-4" aria-labelledby="checkout-despacho">
              <h2 id="checkout-despacho" className="contacto-subtitulo">
                Dirección de despacho
              </h2>
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="checkout-direccion">
                    Dirección
                  </label>
                  <input
                    className={`form-control contacto-input${errores.direccion ? " is-invalid" : ""}`}
                    id="checkout-direccion"
                    name="direccion"
                    autoComplete="street-address"
                    onChange={(e) => cambiarCampo("direccion", e.target.value)}
                  />
                  {errores.direccion && <div className="invalid-feedback">{mensajesError.direccion}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-comuna">
                    Comuna
                  </label>
                  <input
                    className={`form-control contacto-input${errores.comuna ? " is-invalid" : ""}`}
                    id="checkout-comuna"
                    name="comuna"
                    onChange={(e) => cambiarCampo("comuna", e.target.value)}
                  />
                  {errores.comuna && <div className="invalid-feedback">{mensajesError.comuna}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label" htmlFor="checkout-region">
                    Región
                  </label>
                  <input
                    className={`form-control contacto-input${errores.region ? " is-invalid" : ""}`}
                    id="checkout-region"
                    name="region"
                    onChange={(e) => cambiarCampo("region", e.target.value)}
                  />
                  {errores.region && <div className="invalid-feedback">{mensajesError.region}</div>}
                </div>
                <div className="col-12">
                  <label className="form-label" htmlFor="checkout-referencia">
                    Referencia (opcional)
                  </label>
                  <input
                    className="form-control contacto-input"
                    id="checkout-referencia"
                    name="referencia"
                    placeholder="Casa, departamento, indicaciones para llegar"
                  />
                </div>
              </div>
            </section>

            <fieldset className="mb-4">
              <legend className="contacto-subtitulo">Transportista</legend>
              <div className="d-flex flex-column gap-2">
                {(Object.keys(transportistas) as Array<keyof typeof transportistas>).map((id) => {
                  const opcion = transportistas[id];
                  return (
                    <div key={id} className="form-check checkout-carrier">
                      <label className="form-check-label d-flex align-items-center gap-3 w-100">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="transportista"
                          value={id}
                          checked={transportista === id}
                          onChange={() => {
                            setTransportista(id);
                            cambiarCampo("transportista", id);
                          }}
                        />
                        <span className="checkout-carrier-details">
                          <span className="fw-bold">{opcion.nombre}</span>
                          <span className="text-secondary">{opcion.plazo}</span>
                          <span className="fw-semibold">${opcion.precio.toLocaleString("es-CL")}</span>
                        </span>
                      </label>
                    </div>
                  );
                })}
              </div>
              {errores.transportista && (
                <div className="text-danger small mt-2">{mensajesError.transportista}</div>
              )}
            </fieldset>

            <section className="mb-4" aria-labelledby="checkout-pago">
              <h2 id="checkout-pago" className="contacto-subtitulo">
                Método de pago
              </h2>
              <select
                className={`form-select contacto-input${errores.metodoPago ? " is-invalid" : ""}`}
                id="checkout-metodo"
                name="metodoPago"
                value={metodoPago}
                onChange={(e) => cambiarCampo("metodoPago", e.target.value)}
              >
                <option value="" disabled>
                  Selecciona un método
                </option>
                <option value="tarjeta">Tarjeta de crédito o débito</option>
                <option value="transferencia">Transferencia bancaria</option>
              </select>
              {errores.metodoPago && (
                <div className="invalid-feedback">{mensajesError.metodoPago}</div>
              )}

              {metodoPago === "tarjeta" && (
                <div className="row g-3 mt-2 border rounded p-3 bg-light">
                  <div className="col-12">
                    <label className="form-label" htmlFor="checkout-tarjeta">
                      Número de tarjeta
                    </label>
                    <input
                      className={`form-control contacto-input${errores.numeroTarjeta ? " is-invalid" : ""}`}
                      id="checkout-tarjeta"
                      name="numeroTarjeta"
                      placeholder="4242 4242 4242 4242"
                      autoComplete="cc-number"
                      onChange={(e) => cambiarCampo("numeroTarjeta", e.target.value)}
                    />
                    {errores.numeroTarjeta && (
                      <div className="invalid-feedback">{mensajesError.numeroTarjeta}</div>
                    )}
                    <p className="form-text mb-0">
                      Simulación: cualquier número válido (no termine en 0000). CVV ≠ 000.
                    </p>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label" htmlFor="checkout-titular">
                      Titular
                    </label>
                    <input
                      className={`form-control contacto-input${errores.titular ? " is-invalid" : ""}`}
                      id="checkout-titular"
                      name="titular"
                      autoComplete="cc-name"
                      onChange={(e) => cambiarCampo("titular", e.target.value)}
                    />
                    {errores.titular && (
                      <div className="invalid-feedback">{mensajesError.titular}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="checkout-venc">
                      Vencimiento
                    </label>
                    <input
                      className={`form-control contacto-input${errores.vencimiento ? " is-invalid" : ""}`}
                      id="checkout-venc"
                      name="vencimiento"
                      placeholder="MM/YY"
                      autoComplete="cc-exp"
                      onChange={(e) => cambiarCampo("vencimiento", e.target.value)}
                    />
                    {errores.vencimiento && (
                      <div className="invalid-feedback">{mensajesError.vencimiento}</div>
                    )}
                  </div>
                  <div className="col-md-3">
                    <label className="form-label" htmlFor="checkout-cvv">
                      CVV
                    </label>
                    <input
                      className={`form-control contacto-input${errores.cvv ? " is-invalid" : ""}`}
                      id="checkout-cvv"
                      name="cvv"
                      placeholder="123"
                      autoComplete="cc-csc"
                      onChange={(e) => cambiarCampo("cvv", e.target.value)}
                    />
                    {errores.cvv && <div className="invalid-feedback">{mensajesError.cvv}</div>}
                  </div>
                </div>
              )}
            </section>

            <button type="submit" className="btn btn-naranja w-100 fw-bold py-3" disabled={enviando}>
              {enviando ? "PROCESANDO..." : "CONFIRMAR PEDIDO Y PAGAR"}
            </button>
          </form>
        </div>

        <aside className="col-12 col-lg-5" aria-labelledby="checkout-resumen">
          <div className="checkout-card checkout-resumen">
            <h2 id="checkout-resumen" className="contacto-subtitulo">
              Resumen de tu pedido
            </h2>
            <ul className="list-unstyled mb-3">
              {items.map((item) => (
                <li key={item.id} className="d-flex justify-content-between gap-3 py-2 border-bottom">
                  <span>
                    {item.titulo} <span className="text-secondary">× {item.cantidad}</span>
                  </span>
                  <span className="text-nowrap">
                    ${(item.precio * item.cantidad).toLocaleString("es-CL")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="d-flex justify-content-between text-secondary mb-2">
              <span>
                Despacho{transportista ? ` (${transportistas[transportista].nombre})` : ""}
              </span>
              <span>
                {transportista
                  ? `$${costoDespacho.toLocaleString("es-CL")}`
                  : "Selecciona un transportista"}
              </span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total a pagar</span>
              <span className="total-orden">
                ${(subtotal + costoDespacho).toLocaleString("es-CL")}
              </span>
            </div>
          </div>
          <Link to="/carrito" className="btn btn-outline-dark w-100 mt-3">
            Volver al carrito
          </Link>
        </aside>
      </div>
    </main>
  );
}

export default Checkout;
