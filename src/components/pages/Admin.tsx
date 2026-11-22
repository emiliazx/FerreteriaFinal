import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { listarUsuariosBD, type UsuarioBD } from "../../api/auth"
import {
  listarMensajesContacto,
  enviarMensajeHilo,
  type MensajeContacto,
  type MensajeContactoHilo,
} from "../../api/contacto"
import { productos } from "../../data/productos"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"
import {
  listarTodasLasOrdenes,
  actualizarEstadoOrden,
  type OrdenResponse,
} from "../../api/pedidos"
import { listarTodosLosPagos, type PagoResponse } from "../../api/pagos"

const USUARIOS_DEMO: UsuarioBD[] = [
  { id: 1, nombre: "Administrador Principal", email: "admin@ferreteria.cl", rol: "ADMIN", activo: true },
  { id: 2, nombre: "Vendedor Tienda", email: "vendedor@ferreteria.cl", rol: "VENDEDOR", activo: true },
  { id: 3, nombre: "Cliente Registrado", email: "user@ferreteria.cl", rol: "USER", activo: true },
  { id: 4, nombre: "María González", email: "maria@maestro.cl", rol: "VENDEDOR", activo: true },
  { id: 5, nombre: "Juan Pérez", email: "juan@maestro.cl", rol: "USER", activo: true },
]

const ESTADOS_ORDEN = ["PENDIENTE", "PAGADO", "ENVIADO", "ENTREGADO", "CANCELADO"]

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

function Admin() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [usuarios, setUsuarios] = useState<UsuarioBD[]>(USUARIOS_DEMO)
  const [cargandoUsuarios, setCargandoUsuarios] = useState(true)

  const [mensajes, setMensajes] = useState<MensajeContacto[]>([])
  const [respuestasDraft, setRespuestasDraft] = useState<Record<number, string>>({})
  const [cargandoMensajes, setCargandoMensajes] = useState(true)
  const [enviandoId, setEnviandoId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null)

  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([])
  const [pagos, setPagos] = useState<PagoResponse[]>([])
  const [cargandoOps, setCargandoOps] = useState(true)
  const [actualizandoOrdenId, setActualizandoOrdenId] = useState<number | null>(null)
  const [feedbackOrdenes, setFeedbackOrdenes] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null)

  const [soloClientes, setSoloClientes] = useState(false)
  const [mostrarReporte, setMostrarReporte] = useState(false)

  const handleCerrarSesion = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const cargarUsuarios = async () => {
    setCargandoUsuarios(true)
    try {
      const data = await listarUsuariosBD()
      if (Array.isArray(data) && data.length > 0) {
        setUsuarios(data)
      }
    } catch {
      // Si el backend no responde, se mantiene USUARIOS_DEMO sin romper la vista
    } finally {
      setCargandoUsuarios(false)
    }
  }

  const cargarMensajes = async () => {
    setCargandoMensajes(true)
    try {
      const data = await listarMensajesContacto()
      setMensajes(data)
    } catch {
      setFeedback({
        tipo: "err",
        texto: "No se pudieron cargar los mensajes desde el servidor.",
      })
    } finally {
      setCargandoMensajes(false)
    }
  }

  const cargarOperaciones = async () => {
    setCargandoOps(true)
    setFeedbackOrdenes(null)
    try {
      const [ords, pags] = await Promise.all([
        listarTodasLasOrdenes(),
        listarTodosLosPagos(),
      ])
      setOrdenes(Array.isArray(ords) ? ords : [])
      setPagos(Array.isArray(pags) ? pags : [])
    } catch {
      setOrdenes([])
      setPagos([])
      setFeedbackOrdenes({
        tipo: "err",
        texto: "No se pudieron cargar las órdenes o pagos desde el servidor.",
      })
    } finally {
      setCargandoOps(false)
    }
  }

  useEffect(() => {
    void cargarUsuarios()
    void cargarMensajes()
    void cargarOperaciones()
  }, [])

  const handleCambiarEstadoOrden = async (ordenId: number, nuevoEstado: string) => {
    setFeedbackOrdenes(null)
    setActualizandoOrdenId(ordenId)
    try {
      const actualizada = await actualizarEstadoOrden(ordenId, nuevoEstado)
      setOrdenes(prev => prev.map(o => (o.id === ordenId ? actualizada : o)))
      setFeedbackOrdenes({
        tipo: "ok",
        texto: `Orden #${ordenId} actualizada a ${nuevoEstado}.`,
      })
    } catch (err: any) {
      setFeedbackOrdenes({
        tipo: "err",
        texto: err?.message || `No se pudo actualizar el estado de la orden #${ordenId}.`,
      })
    } finally {
      setActualizandoOrdenId(null)
    }
  }

  const handleResponder = async (id: number) => {
    const texto = (respuestasDraft[id] || "").trim()
    setFeedback(null)

    if (!texto) {
      setFeedback({ tipo: "err", texto: "Escribe una respuesta antes de enviar." })
      return
    }

    setEnviandoId(id)
    try {
      const actualizado = await enviarMensajeHilo(id, "ADMIN", texto)
      setMensajes(prev => prev.map(m => (m.id === id ? actualizado : m)))
      setRespuestasDraft(prev => ({ ...prev, [id]: "" }))
      setFeedback({
        tipo: "ok",
        texto: `Respuesta guardada en BD para ${actualizado.nombre} (${actualizado.email}).`,
      })
    } catch (err: any) {
      setFeedback({
        tipo: "err",
        texto: err?.message || "No se pudo guardar la respuesta.",
      })
    } finally {
      setEnviandoId(null)
    }
  }

  const usuariosActivosCount = usuarios.filter(u => u.activo !== false).length
  const pendientesCount = mensajes.filter(m => m.estado !== "RESPONDIDO").length
  const respondidosCount = mensajes.filter(m => m.estado === "RESPONDIDO").length

  const totalVentas = pagos
    .filter(p => p.estado === "APROBADO")
    .reduce((acc, p) => acc + Number(p.monto), 0)

  const pedidosActivos = ordenes.filter(
    o => o.estado !== "ENTREGADO" && o.estado !== "CANCELADO"
  ).length

  const usuariosFiltrados = soloClientes
    ? usuarios.filter(u => u.rol?.toUpperCase() === "USER")
    : usuarios

  return (
    <>
      <Panel
        titulo="Panel de administración"
        descripcion="Gestiona usuarios, inventario, pedidos, pagos y mensajes del sistema."
        onCerrarSesion={handleCerrarSesion}
        resumen={[
          { titulo: "Usuarios", valor: cargandoUsuarios ? "..." : usuarios.length },
          { titulo: "Pedidos activos", valor: cargandoOps ? "..." : pedidosActivos },
          { titulo: "Ventas aprobadas", valor: cargandoOps ? "..." : `$${totalVentas.toLocaleString("es-CL")}` },
        ]}
        tablaTitulo={soloClientes ? "Clientes registrados" : "Gestión de usuarios y roles"}
        columnas={["Usuario", "Correo", "Rol", "Estado"]}
        filas={usuariosFiltrados.map(u => [
          u.nombre || u.email,
          u.email,
          u.rol,
          <Estado key={u.id} texto={u.activo !== false ? "Activo" : "Inactivo"} />,
        ])}
        accionesTitulo="Acciones administrativas"
        acciones={[
          { texto: "Ver catálogo / inventario", to: "/productos" },
        ]}
      />

      <main className="container mb-5">
        <div className="dashboard">
          {/* Botones rápidos locales */}
          <section className="dashboard-section mb-4">
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => setSoloClientes(prev => !prev)}
              >
                {soloClientes ? "Ver todos los roles" : "Filtrar solo clientes"}
              </button>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => setMostrarReporte(prev => !prev)}
              >
                {mostrarReporte ? "Ocultar resumen" : "Ver resumen del sistema"}
              </button>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => void cargarUsuarios()}
                disabled={cargandoUsuarios}
              >
                {cargandoUsuarios ? "Actualizando usuarios..." : "Actualizar usuarios"}
              </button>
            </div>

            {mostrarReporte && (
              <div className="p-3 mt-3 rounded border bg-light small">
                <strong>Resumen actual del sistema:</strong>
                <ul className="mb-0 mt-2">
                  <li>Usuarios registrados: <strong>{usuarios.length}</strong> (activos: <strong>{usuariosActivosCount}</strong>)</li>
                  <li>Productos disponibles en catálogo: <strong>{productos.length}</strong></li>
                  <li>Órdenes registradas: <strong>{ordenes.length}</strong> | Pagos registrados: <strong>{pagos.length}</strong></li>
                  <li>Consultas totales recibidas: <strong>{mensajes.length}</strong></li>
                  <li>Consultas pendientes: <strong>{pendientesCount}</strong></li>
                  <li>Consultas respondidas: <strong>{respondidosCount}</strong></li>
                </ul>
              </div>
            )}
          </section>

          {/* Pedidos y despachos */}
          <section className="dashboard-section mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="m-0">Pedidos y despachos</h2>
              <button
                type="button"
                className="dashboard-button"
                onClick={() => void cargarOperaciones()}
                disabled={cargandoOps}
              >
                {cargandoOps ? "Cargando..." : "Actualizar"}
              </button>
            </div>

            {feedbackOrdenes && (
              <p
                className={
                  feedbackOrdenes.tipo === "ok"
                    ? "text-success small fw-semibold mb-3"
                    : "mensaje-error mb-3"
                }
              >
                {feedbackOrdenes.texto}
              </p>
            )}

            {cargandoOps && <p className="text-muted small">Cargando...</p>}

            {!cargandoOps && ordenes.length === 0 && (
              <p className="text-muted small">No hay pedidos registrados aún.</p>
            )}

            <div className="d-flex flex-column gap-2">
              {ordenes.map(o => (
                <div
                  key={o.id}
                  className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border rounded bg-white"
                >
                  <div>
                    <strong>#{o.id}</strong> — {o.nombreCliente}{" "}
                    <span className="text-muted small">
                      (${Number(o.total).toLocaleString("es-CL")}) • {o.email}
                    </span>
                  </div>
                  <select
                    className="form-select w-auto"
                    value={o.estado}
                    disabled={actualizandoOrdenId === o.id}
                    onChange={async e => {
                      await handleCambiarEstadoOrden(o.id, e.target.value)
                    }}
                  >
                    {ESTADOS_ORDEN.map(est => (
                      <option key={est} value={est}>
                        {est}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          {/* Historial de pagos */}
          <section className="dashboard-section mb-4">
            <h2 className="mb-3">Historial de pagos</h2>
            <div className="table-responsive">
              <table className="table table-sm align-middle">
                <thead>
                  <tr>
                    <th>Comprobante</th>
                    <th>Orden</th>
                    <th>Método</th>
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map(p => (
                    <tr key={p.id}>
                      <td className="font-monospace">{p.comprobante}</td>
                      <td>#{p.ordenId}</td>
                      <td>{p.metodo}</td>
                      <td>
                        <Estado texto={p.estado} />
                      </td>
                      <td>${Number(p.monto).toLocaleString("es-CL")}</td>
                      <td>{p.fecha ? new Date(p.fecha).toLocaleString("es-CL") : "—"}</td>
                    </tr>
                  ))}
                  {pagos.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-muted">
                        Sin pagos registrados
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Bandeja de mensajes reales desde MySQL */}
          <section className="dashboard-section">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="m-0">Mensajes</h2>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={() => void cargarMensajes()}
                disabled={cargandoMensajes}
              >
                {cargandoMensajes ? "Actualizando..." : "Actualizar mensajes"}
              </button>
            </div>

            {feedback && (
              <p
                className={
                  feedback.tipo === "ok"
                    ? "text-success small fw-semibold mb-3"
                    : "mensaje-error mb-3"
                }
              >
                {feedback.texto}
              </p>
            )}

            {cargandoMensajes ? (
              <p className="text-muted small">Cargando mensajes...</p>
            ) : mensajes.length === 0 ? (
              <p className="text-muted small">No hay mensajes de contacto registrados aún.</p>
            ) : (
              <div className="d-flex flex-column gap-3">
                {mensajes.map(m => {
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
                          const esAdmin = turno.remitente === "ADMIN"
                          return (
                            <div
                              key={turno.id ?? idx}
                              className={`p-2 rounded small ${
                                esAdmin
                                  ? "bg-light border-start border-3 border-success"
                                  : "bg-light border-start border-3 border-warning"
                              }`}
                            >
                              <strong>
                                {esAdmin ? "Ferretería Los Maestros" : m.nombre}:
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
                          onChange={e =>
                            setRespuestasDraft(prev => ({
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
        </div>
      </main>
    </>
  )
}

export default Admin