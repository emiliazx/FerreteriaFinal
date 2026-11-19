import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { listarUsuariosBD, type UsuarioBD } from "../../api/auth"
import {
  listarMensajesContacto,
  responderMensajeContacto,
  type MensajeContacto,
} from "../../api/contacto"
import { productos } from "../../data/productos"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"

const USUARIOS_DEMO: UsuarioBD[] = [
  { id: 1, nombre: "Administrador Principal", email: "admin@ferreteria.cl", rol: "ADMIN", activo: true },
  { id: 2, nombre: "Vendedor Tienda", email: "vendedor@ferreteria.cl", rol: "VENDEDOR", activo: true },
  { id: 3, nombre: "Cliente Registrado", email: "user@ferreteria.cl", rol: "USER", activo: true },
  { id: 4, nombre: "María González", email: "maria@maestro.cl", rol: "VENDEDOR", activo: true },
  { id: 5, nombre: "Juan Pérez", email: "juan@maestro.cl", rol: "USER", activo: true },
]

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

  // Controles locales simples para acciones rápidas
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

      const iniciales: Record<number, string> = {}
      for (const m of data) {
        if (m.respuesta) iniciales[m.id] = m.respuesta
      }
      setRespuestasDraft(prev => ({ ...iniciales, ...prev }))
    } catch {
      setFeedback({
        tipo: "err",
        texto: "No se pudieron cargar los mensajes desde el servidor.",
      })
    } finally {
      setCargandoMensajes(false)
    }
  }

  useEffect(() => {
    cargarUsuarios()
    cargarMensajes()
  }, [])

  const handleResponder = async (id: number) => {
    const texto = (respuestasDraft[id] || "").trim()
    setFeedback(null)

    if (!texto) {
      setFeedback({ tipo: "err", texto: "Escribe una respuesta antes de enviar." })
      return
    }

    setEnviandoId(id)
    try {
      const actualizado = await responderMensajeContacto(id, texto)
      setMensajes(prev => prev.map(m => (m.id === id ? actualizado : m)))
      setFeedback({
        tipo: "ok",
        texto: `Respuesta guardada para ${actualizado.nombre} (${actualizado.email}).`,
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

  const usuariosFiltrados = soloClientes
    ? usuarios.filter(u => u.rol?.toUpperCase() === "USER")
    : usuarios

  return (
    <>
      <Panel
        titulo="Panel de administración"
        descripcion="Gestiona usuarios, inventario y mensajes del sistema."
        onCerrarSesion={handleCerrarSesion}
        resumen={[
          { titulo: "Usuarios activos", valor: cargandoUsuarios ? "..." : usuariosActivosCount },
          { titulo: "Productos publicados", valor: productos.length },
          { titulo: "Mensajes pendientes", valor: cargandoMensajes ? "..." : pendientesCount },
        ]}
        tablaTitulo={soloClientes ? "Clientes registrados" : "Gestión de usuarios y roles"}
        columnas={["Usuario", "Correo", "Rol", "Estado"]}
        filas={usuariosFiltrados.map(u => [
          u.nombre || u.email,
          u.email,
          u.rol,
          <Estado texto={u.activo !== false ? "Activo" : "Inactivo"} />,
        ])}
        accionesTitulo="Acciones administrativas"
        acciones={[
          { texto: "Ver catálogo / inventario", to: "/productos" },
        ]}
      />

      <main className="container mb-5">
        <div className="dashboard">
          {/* Botones rápidos locales */}
          <section className="dashboard-section">
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
                onClick={cargarUsuarios}
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
                  <li>Consultas totales recibidas: <strong>{mensajes.length}</strong></li>
                  <li>Consultas pendientes: <strong>{pendientesCount}</strong></li>
                  <li>Consultas respondidas: <strong>{respondidosCount}</strong></li>
                </ul>
              </div>
            )}
          </section>

          {/* Bandeja de mensajes reales desde MySQL (notificaciones) */}
          <section className="dashboard-section">
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
              <h2 className="m-0">Mensajes</h2>
              <button
                type="button"
                className="dashboard-button secondary"
                onClick={cargarMensajes}
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
                  return (
                    <div
                      key={m.id}
                      className="p-3 border rounded bg-white"
                      style={{ borderColor: "#e5e7eb" }}
                    >
                      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-2">
                        <div>
                          <strong>{m.nombre}</strong>{" "}
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

                      <p className="mb-2">
                        <strong>Mensaje:</strong> {m.mensaje}
                      </p>

                      {m.respuesta && (
                        <div className="p-2 mb-2 rounded bg-light small">
                          <strong>Respuesta guardada:</strong> {m.respuesta}
                          {m.respondidoAt && (
                            <div className="text-muted">
                              Respondido: {new Date(m.respondidoAt).toLocaleString("es-CL")}
                            </div>
                          )}
                        </div>
                      )}

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
                          onClick={() => handleResponder(m.id)}
                        >
                          {enviandoId === m.id
                            ? "Guardando..."
                            : esPendiente
                            ? "Responder"
                            : "Actualizar respuesta"}
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