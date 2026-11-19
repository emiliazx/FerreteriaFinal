import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import Estado from "../atoms/Estado"
import Panel from "../organism/Panel"

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
  return `$${valor.toLocaleString("es-CL")}`
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

  // Si cambia el usuario que inicia sesión, carga las cotizaciones de esa cuenta
  useEffect(() => {
    setCotizaciones(leerCotizacionesUsuario(usuarioKey))
    setMensajeOk(null)
    setErrorForm(null)
  }, [usuarioKey])

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(usuarioKey), JSON.stringify(cotizaciones))
    } catch {
      /* ignorar */
    }
  }, [cotizaciones, usuarioKey])

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

    setCotizaciones(prev => [nueva, ...prev])
    setDetalle("")
    setMontoTexto("")
    setMostrarFormulario(false)
    setMensajeOk(`Cotización ${nueva.id} guardada para ${user?.email || "tu cuenta"}.`)
  }

  const nombreVisible = user?.nombre?.trim() || user?.email || "Cliente registrado"

  return (
    <>
      <Panel
        titulo={`Área de cliente — ${nombreVisible}`}
        descripcion={
          user?.email
            ? `Cuenta activa: ${user.email}. Consulta tus pedidos, cotizaciones y cuenta corriente.`
            : "Consulta tus pedidos, cotizaciones y cuenta corriente."
        }
        onCerrarSesion={handleCerrarSesion}
        resumen={[
          { titulo: "Pedidos realizados", valor: 12 },
          { titulo: "Cotizaciones guardadas", valor: cotizaciones.length },
          { titulo: "Saldo pendiente", valor: "$0" },
        ]}
        tablaTitulo="Historial de pedidos"
        columnas={["Pedido", "Fecha", "Total", "Estado"]}
        filas={[
          ["#FM-1048", "06/09/2026", "$85.990", <Estado key="1048" texto="En despacho" />],
          ["#FM-1029", "28/08/2026", "$42.500", <Estado key="1029" texto="Entregado" />],
        ]}
        accionesTitulo="Acciones rápidas"
        acciones={[
          { texto: "Ver catálogo", to: "/productos" },
          { texto: "Revisar carrito", to: "/carrito" },
        ]}
      />

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
                  setMostrarFormulario(prev => !prev)
                }}
              >
                {mostrarFormulario ? "Cancelar" : "Solicitar cotización"}
              </button>
            </div>

            {mensajeOk && (
              <p className="text-success small fw-semibold mb-3">{mensajeOk}</p>
            )}

            {mostrarFormulario && (
              <form
                onSubmit={handleCrearCotizacion}
                className="p-3 mb-3 border rounded bg-light"
              >
                <div className="mb-2">
                  <label htmlFor="detalleCotizacion" className="form-label small fw-semibold">
                    Materiales o productos a cotizar
                  </label>
                  <input
                    id="detalleCotizacion"
                    type="text"
                    className="form-control"
                    placeholder="Ej: 15 sacos de cemento, clavos y perfil metálico"
                    value={detalle}
                    onChange={e => setDetalle(e.target.value)}
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
                    placeholder="Ej: 120000"
                    value={montoTexto}
                    onChange={e => setMontoTexto(e.target.value)}
                  />
                </div>
                {errorForm && (
                  <p className="mensaje-error mb-2">{errorForm}</p>
                )}
                <button type="submit" className="dashboard-button">
                  Guardar cotización
                </button>
              </form>
            )}

            <div className="d-flex flex-column gap-2">
              {cotizaciones.map(c => (
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