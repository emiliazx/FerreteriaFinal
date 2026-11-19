import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"

type EstadoPedido = "Por preparar" | "En despacho" | "Listo para retirar" | "Entregado"

interface PedidoVendedor {
  id: string
  cliente: string
  monto: number
  estado: EstadoPedido
}

const STORAGE_PEDIDOS_KEY = "ferreteria_pedidos_vendedor"

const PEDIDOS_INICIALES: PedidoVendedor[] = [
  { id: "#FM-1051", cliente: "Constructora Norte", monto: 156900, estado: "Por preparar" },
  { id: "#FM-1048", cliente: "Juan Pérez", monto: 85990, estado: "En despacho" },
  { id: "#FM-1044", cliente: "Obras La Serena", monto: 213700, estado: "Listo para retirar" },
]

function leerPedidosLocales(): PedidoVendedor[] {
  try {
    const raw = localStorage.getItem(STORAGE_PEDIDOS_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_PEDIDOS_KEY, JSON.stringify(PEDIDOS_INICIALES))
      return PEDIDOS_INICIALES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : PEDIDOS_INICIALES
  } catch {
    return PEDIDOS_INICIALES
  }
}

function formatCLP(valor: number): string {
  return `$${valor.toLocaleString("es-CL")}`
}

function Vendedor() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  const [pedidos, setPedidos] = useState<PedidoVendedor[]>(() => leerPedidosLocales())
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PEDIDOS_KEY, JSON.stringify(pedidos))
    } catch {
      /* ignorar */
    }
  }, [pedidos])

  const handleCerrarSesion = () => {
    logout()
    navigate("/login", { replace: true })
  }

  const cambiarEstadoPedido = (id: string, nuevoEstado: EstadoPedido) => {
    setPedidos(prev =>
      prev.map(p => (p.id === id ? { ...p, estado: nuevoEstado } : p)),
    )
    setAviso(`Pedido ${id} actualizado a "${nuevoEstado}".`)
  }

  const pedidosPendientes = pedidos.filter(p => p.estado !== "Entregado").length
  const totalVentas = pedidos.reduce((acc, p) => acc + p.monto, 0)

  return (
    <>
      <Panel
        titulo="Panel de vendedor / empleado"
        descripcion="Actualiza el inventario y controla el estado de los pedidos."
        onCerrarSesion={handleCerrarSesion}
        resumen={[
          { titulo: "Pedidos pendientes", valor: pedidosPendientes },
          { titulo: "Productos con bajo stock", valor: 14 },
          { titulo: "Ventas del día", valor: formatCLP(totalVentas) },
        ]}
        tablaTitulo="Pedidos por gestionar"
        columnas={["Pedido", "Cliente", "Total", "Estado"]}
        filas={pedidos.map(p => [
          p.id,
          p.cliente,
          formatCLP(p.monto),
          <Estado key={p.id} texto={p.estado} />,
        ])}
        accionesTitulo="Acciones de vendedor"
        acciones={[
          { texto: "Actualizar inventario", to: "/productos" },
          { texto: "Revisar pedidos", to: "/vendedor" },
          { texto: "Contactar cliente", to: "/contacto", secundaria: true },
        ]}
      />

      <main className="container mb-5">
        <div className="dashboard">
          <section className="dashboard-section">
            <h2 className="mb-3">Gestionar estado de pedidos</h2>

            {aviso && (
              <p className="text-success small fw-semibold mb-3">{aviso}</p>
            )}

            <div className="d-flex flex-column gap-2">
              {pedidos.map(p => (
                <div
                  key={p.id}
                  className="d-flex flex-wrap justify-content-between align-items-center gap-2 p-3 border rounded bg-white"
                  style={{ borderColor: "#e5e7eb" }}
                >
                  <div>
                    <strong>{p.id}</strong> — {p.cliente}{" "}
                    <span className="text-muted small">({formatCLP(p.monto)})</span>
                  </div>

                  <select
                    aria-label={`Estado del pedido ${p.id}`}
                    className="form-select w-auto"
                    value={p.estado}
                    onChange={e =>
                      cambiarEstadoPedido(p.id, e.target.value as EstadoPedido)
                    }
                  >
                    <option value="Por preparar">Por preparar</option>
                    <option value="En despacho">En despacho</option>
                    <option value="Listo para retirar">Listo para retirar</option>
                    <option value="Entregado">Entregado</option>
                  </select>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

export default Vendedor