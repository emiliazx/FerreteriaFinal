import { useParams } from 'react-router-dom'
import CardProducto from '../molecules/CardProducto'
import FiltroCategorias from '../molecules/FiltroCategoria'
import NoEncontrado from './NoEncontrado'
import { useCatalog } from '../../context/CatalogContext'
import { useCart } from '../../context/CartContext'
import Estado from '../atoms/Estado'

function Productos() {
  const { slug } = useParams()
  const { agregar } = useCart()
  const { productos, categorias, cargando, error } = useCatalog()

  const categoria = categorias.find((c) => c.slug === slug)

  if (slug && !categoria) {
    return <NoEncontrado />
  }

  if (cargando) {
    return (
      <section className="container my-5 text-center">
        <Estado tipo="cargando" texto="Cargando productos..." />
      </section>
    )
  }

  if (error) {
    return (
      <section className="container my-5 text-center">
        <Estado tipo="error" texto={error} />
      </section>
    )
  }

  const lista = slug
    ? productos.filter((p) => p.categoria === slug)
    : productos

  return (
    <section className="container my-5">
      <h1 className="text-center mb-4 fw-bold titulo-seccion">
        {categoria ? categoria.nombre : 'Catálogo de Productos'}
      </h1>

      <FiltroCategorias categorias={categorias} activa={slug} />

      {lista.length === 0 ? (
        <p className="text-center text-muted mt-4">No hay productos en esta categoría.</p>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
          {lista.map((p) => (
            <div className="col" key={p.id}>
              <CardProducto
                id={p.id}
                titulo={p.titulo}
                descripcion={p.descripcion}
                precio={p.precio}
                imagen={p.imagen ?? ''}
                onAgregar={agregar}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default Productos
