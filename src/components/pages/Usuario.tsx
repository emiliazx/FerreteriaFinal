import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"
import {
  listarOrdenesPorUsuario,
  listarOrdenesPorEmail,
  type OrdenResponse,
} from "../../api/pedidos"
import { listarPagosPorOrden, type PagoResponse } from "../../api/pagos"
import {
  listarMensajesContacto,
  enviarMensajeHilo,
  type MensajeContacto,
  type MensajeContactoHilo,
} from "../../api/contacto"

interface CotizacionCliente {
  id: string
  detalle: string
  montoEstimado: number
  fecha: string
  estado: "Pendiente" | "Cotizada"
}

const COTIZACIONES_BASE: CotizacionCliente[] = [
  {
    id: "#COT-201",
    detalle: "Cemento especial 25 kg (20 sacos) y fierro estriado 12 mm",
    montoEstimado: 194500,
    fecha: "05/09/2026",
    estado: "Cotizada",
  },
  {
    id: "#COT-202",
    detalle: "Pintura látex interior 4 galones + rodillos y brochas",
    montoEstimado: 89900,
    fecha: "01/09/2026",
    estado: "Cotizada",
  },
  {
    id: "#COT-203",
    detalle: "Tornillería estructural, fijaciones y discos de corte",
    montoEstimado: 47200,
    fecha: "27/08/2026",
    estado: "Pendiente",
  },
]

function obtenerTurnosDesdeBD(m: MensajeContacto): MensajeContactoHilo[] {
  if (Array.isArray(m.hilo) && m.hilo.length > 0) {
    return m.hilo
  }
  const fallback: MensajeContactoHilo[] = [
    {
      id: 1,
      remitente: "CLIENTE",
      texto: m.mensaje,
      createdAt: m.createdAt,
    },
  ]
  if (m.respuesta) {
    fallback.push({
      id: 2,
      remitente: "ADMIN",
      texto: m.respuesta,
      createdAt: m.respondidoAt ?? undefined,
    })
  }
  return fallback
}

function getStorageKey(identificador?: string | null): string {
  const limpio = (identificador || "sesion").trim().toLowerCase()
  return `ferreteria_cotizaciones_${limpio}`
}

function leerCotizacionesUsuario(identificador?: string | null): CotizacionCliente[] {
  const key = getStorageKey(identificador)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(COTIZACIONES_BASE))
      return COTIZACIONES_BASE
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : COTIZACIONES_BASE
  } catch {
    return COTIZACIONES_BASE
  }
}

function formatCLP(valor: number): string {
  return `$${Number(valor).toLocaleString("es-CL")}`
}

function formatFecha(iso?: string): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function etiquetaEstado(estado: string): string {
  const map: Record<string, string> = {
    PENDIENTE: "Pendiente",
    PAGADO: "Pagado",
    ENVIADO: "En despacho",
    ENTREGADO: "Entregado",
    CANCELADO: "Cancelado",
  }
  return map[estado?.toUpperCase()] ?? estado
}

function Usuario() {
  const navigate = useNavigate()
  const { logout, user } = useAuth()
  const usuarioKey = user?.email || user?.nombre || "sesion"

  const [cotizaciones, setCotizaciones] = useState<CotizacionCliente[]>(() =>
    leerCotizacionesUsuario(usuarioKey),
  )
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [detalle, setDetalle] = useState("")
  const [montoTexto, setMontoTexto] = useState("")
  const [mensajeOk, setMensajeOk] = useState<string | null>(null)
  const [errorForm, setErrorForm] = useState<string | null>(null)

  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([])
  const [pagosPorOrden, setPagosPorOrden] = useState<Record<number, PagoResponse[]>>({})
  const [cargandoOrdenes, setCargandoOrdenes] = useState(false)
  const [errorOrdenes, setErrorOrdenes] = useState<string | null>(null)

  const [mensajesUsuario, setMensajesUsuario] = useState<MensajeContacto[]>([])
  const [cargandoMensajes, setCargandoMensajes] = useState(false)
  const [enviandoHiloId, setEnviandoHiloId] = useState<number | null>(null)
  const [errorMensajes, setErrorMensajes] = useState<string | null>(null)
  const [respuestasUsuarioDraft, setRespuestasUsuarioDraft] = useState<Record<number, string>>({})

  useEffect(() => {
    setCotizaciones(leerCotizacionesUsuario(usuarioKey))
    setMensajeOk(null)
    setErrorForm(null)
  }, [usuarioKey])

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(usuarioKey), JSON.stringify(cotizaciones))
    } catch {
      /* ignore */
    }
  }, [cotizaciones, usuarioKey])

  const cargarMensajesUsuario = async () => {
    const emailCuenta = user?.email?.trim().toLowerCase()
    if (!emailCuenta) {
      setMensajesUsuario([])
      return
    }
    setCargandoMensajes(true)
    setErrorMensajes(null)
    try {
      const todos = await listarMensajesContacto()
      const propios = (Array.isArray(todos) ? todos : []).filter(
        (m) => m.email?.trim().toLowerCase() === emailCuenta,
      )
      setMensajesUsuario(propios)
    } catch {
      setMensajesUsuario([])
    } finally {
      setCargandoMensajes(false)
    }
  }

  const handleEnviarSeguimientoUsuario = async (consultaId: number) => {
    const texto = (respuestasUsuarioDraft[consultaId] || "").trim()
    if (!texto) return

    setEnviandoHiloId(consultaId)
    setErrorMensajes(null)
    try {
      const actualizado = await enviarMensajeHilo(consultaId, "CLIENTE", texto)
      setMensajesUsuario((prev) =>
        prev.map((item) => (item.id === consultaId ? actualizado : item)),
      )
      setRespuestasUsuarioDraft((prev) => ({ ...prev, [consultaId]: "" }))
    } catch (err) {
      setErrorMensajes(
        err instanceof Error ? err.message : "No se pudo guardar el mensaje en la base de datos.",
      )
    } finally {
      setEnviandoHiloId(null)
    }
  }

  useEffect(() => {
    void cargarMensajesUsuario()
  }, [user?.email])

  useEffect(() => {
    if (!user) {
      setOrdenes([])
      return
    }
    let cancelado = false
    setCargandoOrdenes(true)
    setErrorOrdenes(null)

    ;(async () => {
      try {
        let lista: OrdenResponse[] = []
        if (user.userId) lista = await listarOrdenesPorUsuario(user.userId)
        if ((!lista || lista.length === 0) && user.email) {
          lista = await listarOrdenesPorEmail(user.email)
        }
        if (cancelado) return
        setOrdenes(lista ?? [])

        const mapa: Record<number, PagoResponse[]> = {}
        await Promise.all(
          (lista ?? []).map(async (o) => {
            try {
              mapa[o.id] = await listarPagosPorOrden(o.id)
            } catch {
              mapa[o.id] = []
            }
          }),
        )
        if (!cancelado) setPagosPorOrden(mapa)
      } catch (err) {
        if (!cancelado) {
          setErrorOrdenes(err instanceof Error ? err.message : "No se pudieron cargar los pedidos")
          setOrdenes([])
        }
      } finally {
        if (!cancelado) setCargandoOrdenes(false)
      }
    })()

    return () => {
      cancelado = true
    }
  }, [user])

  const handleCerrarSesion = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const handleCrearCotizacion = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorForm(null)
    setMensajeOk(null)
    const detalleLimpio = detalle.trim()
    const montoNum = Number(montoTexto.replace(/\D/g, "")) || 50000
    if (detalleLimpio.length < 5) {
      setErrorForm("Describe brevemente qué materiales o productos necesitas cotizar.")
      return
    }
    const nueva: CotizacionCliente = {
      id: `#COT-${200 + cotizaciones.length + 1}`,
      detalle: detalleLimpio,
      montoEstimado: montoNum,
      fecha: new Date().toLocaleDateString("es-CL"),
      estado: "Pendiente",
    }
    setCotizaciones((prev) => [nueva, ...prev])
    setDetalle("")
    setMontoTexto("")
    setMostrarFormulario(false)
    setMensajeOk(`Cotización ${nueva.id} guardada.`)
  }

  const nombreVisible = user?.nombre?.trim() || user?.email || "Cliente registrado"

  const filasPedidos =
    ordenes.length > 0
      ? ordenes.map((o) => [
          `#${o.id}`,
          formatFecha(o.createdAt),
          formatCLP(Number(o.total)),
          <Estado key={o.id} texto={etiquetaEstado(o.estado)} />,
        ])
      : [
          [
            cargandoOrdenes ? "Cargando..." : "Sin pedidos aún",
            "—",
            "—",
            <Estado key="empty" texto={cargandoOrdenes ? "..." : "—"} />,
          ],
        ]

  return (
    <>
      <Panel
        titulo={`Área de cliente — ${nombreVisible}`}
        descripcion={
          user?.email
            ? `Cuenta activa: ${user.email}. Pedidos, pagos, mensajes y cotizaciones.`
            : "Consulta tus pedidos, pagos, mensajes y cotizaciones."
        }
        onCerrarSesion={handleCerrarSesion}
        resumen={[
          { titulo: "Pedidos realizados", valor: ordenes.length },
          { titulo: "Cotizaciones", valor: cotizaciones.length },
          {
            titulo: "Último total",
            valor: ordenes[0] ? formatCLP(Number(ordenes[0].total)) : "$0",
          },
        ]}
        tablaTitulo="Historial de pedidos"
        columnas={["Pedido", "Fecha", "Total", "Estado"]}
        filas={filasPedidos}
        accionesTitulo="Acciones rápidas"
        acciones={[
          { texto: "Ver catálogo", to: "/productos" },
          { texto: "Revisar carrito", to: "/carrito" },
          { texto: "Enviar consulta", to: "/contacto" },
        ]}
      />

      {errorOrdenes && (
        <div className="container">
          <p className="text-danger small">{errorOrdenes}</p>
        </div>
      )}

      {ordenes.length > 0 && (
        <main className="container mb-4">
          <div className="dashboard">
            <section className="dashboard-section">
              <h2 className="mb-3">Detalle de pedidos y pagos</h2>
              <div className="d-flex flex-column gap-3">
                {ordenes.map((o) => {
                  const pagos = pagosPorOrden[o.id] ?? []
                  return (
                    <div
                      key={o.id}
                      className="p-3 border rounded bg-white"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                        <div>
                          <strong>Pedido #{o.id}</strong>
                          <div className="text-muted small">
                            {formatFecha(o.createdAt)} · {o.metodoPago ?? "—"} ·{" "}
                            {o.transportista ?? "Sin despacho"}
                          </div>
                        </div>
                        <Estado texto={etiquetaEstado(o.estado)} />
                      </div>

                      <ul className="list-unstyled small mb-2">
                        {o.items?.map((it) => (
                          <li key={it.id} className="d-flex justify-content-between gap-2">
                            <span>
                              {it.titulo} × {it.cantidad}
                            </span>
                            <span className="text-nowrap">
                              {formatCLP(Number(it.subtotal ?? it.precioUnitario * it.cantidad))}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="d-flex justify-content-between fw-semibold mb-2">
                        <span>Total</span>
                        <span>{formatCLP(Number(o.total))}</span>
                      </div>

                      {pagos.length > 0 && (
                        <div className="border-top pt-2 mt-2">
                          <div className="small fw-semibold mb-1">Pagos</div>
                          {pagos.map((p) => (
                            <div
                              key={p.id}
                              className="d-flex flex-wrap justify-content-between small gap-2"
                            >
                              <span>
                                {p.comprobante} · {p.metodo} · {p.estado}
                              </span>
                              <span>{formatCLP(Number(p.monto))}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="text-muted small mt-2">
                        {o.direccion}
                        {o.comuna ? `, ${o.comuna}` : ""}
                        {o.region ? `, ${o.region}` : ""}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>
        </main>
      )}

      {/* Mis mensajes y consultas enviadas desde Contacto */}
      <main className="container mb-4">
        <div className="dashboard">
          <section className="dashboard-section">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="m-0">Mis mensajes ({mensajesUsuario.length})</h2>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => void cargarMensajesUsuario()}
                disabled={cargandoMensajes}
              >
                {cargandoMensajes ? "Actualizando..." : "Actualizar mensajes"}
              </button>
            </div>

            {errorMensajes && <p className="text-danger small mb-2">{errorMensajes}</p>}

            {cargandoMensajes ? (
              <p className="text-muted small">Cargando mensajes...</p>
            ) : mensajesUsuario.length === 0 ? (
              <p className="text-muted small mb-0">
                No tienes mensajes registrados con {user?.email || "tu cuenta"}. Puedes enviarnos una consulta desde{" "}
                <strong>Contacto</strong>.
              </p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {mensajesUsuario.map((m) => {
                  const respondido = m.estado === "RESPONDIDO"
                  const hilo = obtenerTurnosDesdeBD(m)
                  const enviandoEste = enviandoHiloId === m.id
                  return (
                    <div
                      key={m.id}
                      className="p-3 border rounded bg-white"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <strong>Consulta #{m.id}</strong>
                          {m.createdAt && (
                            <div className="text-muted small">
                              Enviado: {new Date(m.createdAt).toLocaleString("es-CL")}
                            </div>
                          )}
                        </div>
                        <Estado texto={respondido ? "Respondido" : "Pendiente"} />
                      </div>

                      <div className="d-flex flex-column gap-2 mb-3">
                        {hilo.map((turno, idx) => {
                          const esTienda = turno.remitente === "ADMIN"
                          return (
                            <div
                              key={turno.id ?? idx}
                              className={`p-2 rounded small ${
                                esTienda
                                  ? "bg-light border-start border-3 border-success"
                                  : "bg-light border-start border-3 border-warning"
                              }`}
                            >
                              <strong>
                                {esTienda ? "Ferretería Los Maestros" : "Tú"}:
                              </strong>{" "}
                              {turno.texto}
                              {turno.createdAt && (
                                <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                                  {new Date(turno.createdAt).toLocaleString("es-CL")}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>

                      <div className="d-flex flex-column flex-md-row gap-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escribe un mensaje de seguimiento..."
                          value={respuestasUsuarioDraft[m.id] ?? ""}
                          disabled={enviandoEste}
                          onChange={(e) =>
                            setRespuestasUsuarioDraft((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="dashboard-button"
                          disabled={enviandoEste}
                          onClick={() => void handleEnviarSeguimientoUsuario(m.id)}
                        >
                          {enviandoEste ? "Enviando..." : "Responder"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>

      <main className="container mb-5">
        <div className="dashboard">
          <section className="dashboard-section">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="m-0">Mis cotizaciones ({cotizaciones.length})</h2>
              <button
                type="button"
                className="dashboard-button"
                onClick={() => {
                  setErrorForm(null)
                  setMensajeOk(null)
                  setMostrarFormulario((prev) => !prev)
                }}
              >
                {mostrarFormulario ? "Cancelar" : "Solicitar cotización"}
              </button>
            </div>

            {mensajeOk && <p className="text-success small fw-semibold mb-3">{mensajeOk}</p>}

            {mostrarFormulario && (
              <form onSubmit={handleCrearCotizacion} className="p-3 mb-3 border rounded bg-light">
                <div className="mb-2">
                  <label htmlFor="detalleCotizacion" className="form-label small fw-semibold">
                    Materiales o productos a cotizar
                  </label>
                  <input
                    id="detalleCotizacion"
                    type="text"
                    className="form-control"
                    value={detalle}
                    onChange={(e) => setDetalle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="montoCotizacion" className="form-label small fw-semibold">
                    Presupuesto estimado (opcional, CLP)
                  </label>
                  <input
                    id="montoCotizacion"
                    type="text"
                    className="form-control"
                    value={montoTexto}
                    onChange={(e) => setMontoTexto(e.target.value)}
                  />
                </div>
                {errorForm && <p className="mensaje-error mb-2">{errorForm}</p>}
                <button type="submit" className="dashboard-button">
                  Guardar cotización
                </button>
              </form>
            )}

            <div className="d-flex flex-column gap-2">
              {cotizaciones.map((c) => (
                <div
                  key={c.id}
                  className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border rounded bg-white"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div>
                    <strong>{c.id}</strong> — {c.detalle}
                    <div className="text-muted small">
                      Fecha: {c.fecha} • Estimado: {formatCLP(c.montoEstimado)}
                    </div>
                  </div>
                  <Estado texto={c.estado} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default Usuario