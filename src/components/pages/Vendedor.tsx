import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"
import {
  listarTodasLasOrdenes,
  actualizarEstadoOrden,
  type OrdenResponse,
} from "../../api/pedidos"

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

function Vendedor() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [ordenes, setOrdenes] = useState<OrdenResponse[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [actualizandoId, setActualizandoId] = useState<number | null>(null)

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

  useEffect(() => {
    void cargar()
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
        descripcion="Gestiona pedidos reales y el estado de despacho."
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
          { texto: "Contactar cliente", to: "/contacto", secundaria: true },
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

          <section className="dashboard-section">
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
        </div>
      </main>
    </>
  )
}

export default Vendedor