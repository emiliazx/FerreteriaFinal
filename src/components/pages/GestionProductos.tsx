import { useEffect, useState } from 'react'
import {
  listarProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  type Producto,
  type ProductoRequest,
} from '../../api/productos'
import { useCatalog } from '../../context/CatalogContext'
import { categorias } from '../../data/productos'
import Estado from '../atoms/Estado'

const EMPTY: ProductoRequest = {
  categoria: categorias[0]?.slug ?? 'construccion',
  titulo: '',
  descripcion: '',
  precio: 0,
  imagen: '',
}

export default function GestionProductos() {
  const { recargar } = useCatalog()
  const [productos, setProductos] = useState<Producto[]>([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState<ProductoRequest>(EMPTY)
  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'err'; texto: string } | null>(null)

  const cargar = async () => {
    setCargando(true)
    try {
      const data = await listarProductos()
      setProductos(data)
    } catch {
      setFeedback({ tipo: 'err', texto: 'No se pudieron cargar los productos' })
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    void cargar()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)
    try {
      if (editandoId) {
        await actualizarProducto(editandoId, form)
        setFeedback({ tipo: 'ok', texto: 'Producto actualizado' })
      } else {
        await crearProducto(form)
        setFeedback({ tipo: 'ok', texto: 'Producto creado' })
      }
      setForm(EMPTY)
      setEditandoId(null)
      await cargar()
      await recargar()
    } catch (err) {
      setFeedback({
        tipo: 'err',
        texto: err instanceof Error ? err.message : 'Error al guardar',
      })
    }
  }

  const handleEditar = (p: Producto) => {
    setEditandoId(p.id)
    setForm({
      categoria: p.categoria,
      titulo: p.titulo,
      descripcion: p.descripcion,
      precio: p.precio,
      imagen: p.imagen ?? '',
    })
  }

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Eliminar este producto?')) return
    try {
      await eliminarProducto(id)
      setFeedback({ tipo: 'ok', texto: 'Producto eliminado' })
      await cargar()
      await recargar()
    } catch {
      setFeedback({ tipo: 'err', texto: 'No se pudo eliminar' })
    }
  }

  const cancelar = () => {
    setEditandoId(null)
    setForm(EMPTY)
  }

  return (
    <div className="mt-4">
      <h4 className="fw-bold mb-3">Gestión de Productos</h4>

      {feedback && (
        <div className={`alert alert-${feedback.tipo === 'ok' ? 'success' : 'danger'} py-2`}>
          {feedback.texto}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card p-3 mb-4">
        <h5>{editandoId ? `Editar #${editandoId}` : 'Nuevo producto'}</h5>
        <div className="row g-2">
          <div className="col-md-6">
            <input
              className="form-control"
              placeholder="Título"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <select
              className="form-select"
              value={form.categoria}
              onChange={(e) => setForm({ ...form, categoria: e.target.value })}
            >
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="number"
              className="form-control"
              placeholder="Precio"
              value={form.precio || ''}
              onChange={(e) => setForm({ ...form, precio: Number(e.target.value) })}
              min={1}
              required
            />
          </div>
          <div className="col-12">
            <textarea
              className="form-control"
              placeholder="Descripción"
              rows={2}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              required
            />
          </div>
          <div className="col-md-8">
            <input
              className="form-control"
              placeholder="URL de imagen (ej: /img/contr1.jpg)"
              value={form.imagen ?? ''}
              onChange={(e) => setForm({ ...form, imagen: e.target.value })}
            />
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button type="submit" className="btn btn-dark flex-fill">
              {editandoId ? 'Actualizar' : 'Crear'}
            </button>
            {editandoId && (
              <button type="button" className="btn btn-outline-secondary" onClick={cancelar}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </form>

      {cargando ? (
        <Estado tipo="cargando" texto="Cargando productos..." />
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover">
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.titulo}</td>
                  <td>{p.categoria}</td>
                  <td>${p.precio.toLocaleString('es-CL')}</td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary me-1"
                      onClick={() => handleEditar(p)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => void handleEliminar(p.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {productos.length === 0 && (
            <p className="text-muted text-center">No hay productos. Crea el primero arriba.</p>
          )}
        </div>
      )}
    </div>
  )
}