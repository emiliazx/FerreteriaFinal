import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"
import GestionProductos from "./GestionProductos"
import {
  listarTodasLasOrdenes,
  actualizarEstadoOrden,
  type OrdenResponse,
} from "../../api/pedidos"
import {
  listarMensajesContacto,
  enviarMensajeHilo,
  type MensajeContacto,
  type MensajeContactoHilo,
} from "../../api/contacto"

const ESTADOS = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"] as const

function formatCLP(valor: number): string {
  return `$${Number(valor).toLocaleString("es-CL")}`
}

function formatFecha(iso?: string): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("es-CL")
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

function Vendedor() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [actualizandoId, setActualizandoId] = useState<number | null>(null)

  const [mensajes, setMensajes] = useState<MensajeContacto[]>([])
  const [respuestasDraft, setRespuestasDraft] = useState<Record<number, string>>({})
  const [cargandoMensajes, setCargandoMensajes] = useState(true)
  const [enviandoId, setEnviandoId] = useState<number | null>(null)
  const [feedbackMensajes, setFeedbackMensajes] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const data = await listarTodasLasOrdenes()
      setOrdenes(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pedidos")
      setOrdenes([])
    } finally {
      setCargando(false)
    }
  }

  const cargarMensajes = async () => {
    setCargandoMensajes(true)
    try {
      const data = await listarMensajesContacto()
      setMensajes(data)
    } catch {
      setFeedbackMensajes({
        tipo: "err",
        texto: "No se pudieron cargar los mensajes desde el servidor.",
      })
    } finally {
      setCargandoMensajes(false)
    }
  }

  useEffect(() => {
    void cargar()
    void cargarMensajes()
  }, [])

  const handleCerrarSesion = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const cambiarEstado = async (id: number, estado: string) => {
    setActualizandoId(id)
    setAviso(null)
    try {
      const actualizada = await actualizarEstadoOrden(id, estado)
      setOrdenes((prev) => prev.map((o) => (o.id === id ? actualizada : o)))
      setAviso(`Pedido #${id} actualizado a "${etiquetaEstado(estado)}".`)
    } catch (err) {
      setAviso(err instanceof Error ? err.message : "Error al actualizar estado")
    } finally {
      setActualizandoId(null)
    }
  }

  const handleResponder = async (id: number) => {
    const texto = (respuestasDraft[id] || "").trim()
    setFeedbackMensajes(null)

    if (!texto) {
      setFeedbackMensajes({ tipo: "err", texto: "Escribe una respuesta antes de enviar." })
      return
    }

    setEnviandoId(id)
    try {
      const actualizado = await enviarMensajeHilo(id, "ADMIN", texto)
      setMensajes((prev) => prev.map((m) => (m.id === id ? actualizado : m)))
      setRespuestasDraft((prev) => ({ ...prev, [id]: "" }))
      setFeedbackMensajes({
        tipo: "ok",
        texto: `Respuesta enviada a ${actualizado.nombre} (${actualizado.email}).`,
      })
    } catch (err: any) {
      setFeedbackMensajes({
        tipo: "err",
        texto: err?.message || "No se pudo guardar la respuesta.",
      })
    } finally {
      setEnviandoId(null)
    }
  }

  const pendientes = ordenes.filter((o) => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO").length
  const ventas = useMemo(
    () =>
      ordenes
        .filter((o) => ["PAGADO", "ENVIADO", "ENTREGADO"].includes(o.estado))
        .reduce((acc, o) => acc + Number(o.total), 0),
    [ordenes],
  )

  const topProductos = useMemo(() => {
    const map = new Map<string, number>()
    for (const o of ordenes) {
      for (const it of o.items ?? []) {
        map.set(it.titulo, (map.get(it.titulo) ?? 0) + it.cantidad)
      }
    }
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [ordenes])

  return (
    <>
      <Panel
        titulo="Panel de vendedor / empleado"
        descripcion="Gestiona pedidos reales, atención a clientes y el catálogo de productos."
        onCerrarSesion={handleCerrarSesion}
        resumen={[
          { titulo: "Pedidos activos", valor: pendientes },
          { titulo: "Total pedidos", valor: ordenes.length },
          { titulo: "Ventas (pagadas+)", valor: formatCLP(ventas) },
        ]}
        tablaTitulo="Pedidos por gestionar"
        columnas={["Pedido", "Cliente", "Total", "Estado"]}
        filas={
          ordenes.length > 0
            ? ordenes.map((o) => [
                `#${o.id}`,
                o.nombreCliente,
                formatCLP(Number(o.total)),
                <Estado key={o.id} texto={etiquetaEstado(o.estado)} />,
              ])
            : [[cargando ? "Cargando..." : "Sin pedidos", "—", "—", <Estado key="e" texto="—" />]]
        }
        accionesTitulo="Acciones de vendedor"
        acciones={[
          { texto: "Ver catálogo", to: "/productos" },
        ]}
      />

      <main className="container mb-5">
        <div className="dashboard">
          {error && <p className="text-danger small">{error}</p>}
          {aviso && <p className="text-success small fw-semibold">{aviso}</p>}

          <section className="dashboard-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="m-0">Gestionar estado de pedidos</h2>
              <button type="button" className="dashboard-button" onClick={() => void cargar()}>
                Actualizar
              </button>
            </div>

            <div className="d-flex flex-column gap-2">
              {ordenes.map((o) => (
                <div
                  key={o.id}
                  className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border rounded bg-white"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div>
                    <strong>#{o.id}</strong> — {o.nombreCliente}{" "}
                    <span className="text-muted small">
                      ({formatCLP(Number(o.total))} · {formatFecha(o.createdAt)})
                    </span>
                    <div className="text-muted small">
                      {o.direccion}
                      {o.comuna ? `, ${o.comuna}` : ""}
                    </div>
                  </div>

                  <select
                    className="form-select w-auto"
                    value={o.estado}
                    disabled={actualizandoId === o.id}
                    onChange={(e) => void cambiarEstado(o.id, e.target.value)}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {etiquetaEstado(e)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {!cargando && ordenes.length === 0 && (
                <p className="text-muted">No hay pedidos todavía.</p>
              )}
            </div>
          </section>

          <section className="dashboard-section mb-4">
            <h2 className="mb-3">Productos más vendidos (desde órdenes)</h2>
            {topProductos.length === 0 ? (
              <p className="text-muted">Aún no hay ventas registradas.</p>
            ) : (
              <ul className="list-group">
                {topProductos.map(([titulo, cant]) => (
                  <li
                    key={titulo}
                    className="list-group-item d-flex justify-content-between"
                  >
                    <span>{titulo}</span>
                    <strong>{cant} uds.</strong>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Bandeja de atención a clientes */}
          <section id="mensajes-clientes" className="dashboard-section mb-4">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="m-0">Mensajes de clientes</h2>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => void cargarMensajes()}
                disabled={cargandoMensajes}
              >
                {cargandoMensajes ? "Actualizando..." : "Actualizar mensajes"}
              </button>
            </div>

            {feedbackMensajes && (
              <p
                className={
                  feedbackMensajes.tipo === "ok"
                    ? "text-success small fw-semibold mb-3"
                    : "mensaje-error mb-3"
                }
              >
                {feedbackMensajes.texto}
              </p>
            )}

            {cargandoMensajes ? (
              <p className="text-muted small">Cargando mensajes...</p>
            ) : mensajes.length === 0 ? (
              <p className="text-muted small">No hay mensajes de contacto registrados aún.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {mensajes.map((m) => {
                  const esPendiente = m.estado !== "RESPONDIDO"
                  const hilo = obtenerTurnosDesdeBD(m)
                  return (
                    <div
                      key={m.id}
                      className="p-3 border rounded bg-white"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <strong>#{m.id} · {m.nombre}</strong>{" "}
                          <span className="text-muted small">
                            — {m.email}
                            {m.telefono ? ` • Tel: ${m.telefono}` : ""}
                          </span>
                          {m.createdAt && (
                            <div className="text-muted small">
                              Recibido: {new Date(m.createdAt).toLocaleString("es-CL")}
                            </div>
                          )}
                        </div>
                        <Estado texto={esPendiente ? "Pendiente" : "Respondido"} />
                      </div>

                      <div className="d-flex flex-column gap-2 mb-3">
                        {hilo.map((turno, idx) => {
                          const esStaff = turno.remitente === "ADMIN"
                          return (
                            <div
                              key={turno.id ?? idx}
                              className={`p-2 rounded small ${
                                esStaff
                                  ? "bg-light border-start border-3 border-success"
                                  : "bg-light border-start border-3 border-warning"
                              }`}
                            >
                              <strong>
                                {esStaff ? "Ferretería Los Maestros" : m.nombre}:
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

                      <div className="d-flex flex-column flex-md-row gap-2 mt-2">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Escribe tu respuesta para el cliente..."
                          value={respuestasDraft[m.id] ?? ""}
                          onChange={(e) =>
                            setRespuestasDraft((prev) => ({
                              ...prev,
                              [m.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="dashboard-button"
                          disabled={enviandoId === m.id}
                          onClick={() => void handleResponder(m.id)}
                        >
                          {enviandoId === m.id
                            ? "Guardando..."
                            : esPendiente
                            ? "Responder"
                            : "Enviar mensaje"}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <GestionProductos />
          </section>
        </div>
      </main>
    </>
  )
}

export default Vendedor