import { useParams } from "react-router-dom";
import CardProducto from "../molecules/CardProducto";
import FiltroCategorias from "../molecules/FiltroCategoria";
import NoEncontrado from "./NoEncontrado";

interface ProductosProps {
    productos: {
        id: number;
        categoria: string;
        titulo: string;
        descripcion: string;
        precio: number;
        imagen: string;
    }[];
    categorias: { slug: string; nombre: string; nombreCorto: string }[];
    onAgregar: (id: number) => void;
}

function Productos({ productos, categorias, onAgregar }: ProductosProps) {

    // /productos → todo el catálogo   |   /categoria/:slug → solo esa categoría
    const { slug } = useParams()
    const categoria = categorias.find(c => c.slug === slug)

    if (slug && !categoria) {
        return <NoEncontrado />
    }

    const lista = slug
        ? productos.filter(p => p.categoria === slug)
        : productos

    return (
        <section className="container my-5">

            <h1 className="text-center mb-4 fw-bold titulo-seccion">
                {categoria ? categoria.nombre : 'Catálogo de Productos'}
            </h1>

            <FiltroCategorias categorias={categorias} activa={slug} />

            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">

                {lista.map(p => (
                    <div className="col" key={p.id}>
                        <CardProducto
                            id={p.id}
                            titulo={p.titulo}
                            descripcion={p.descripcion}
                            precio={p.precio}
                            imagen={p.imagen}
                            onAgregar={onAgregar}
                        />
                    </div>
                ))}

            </div>

        </section>
    )
}

export default Productos
