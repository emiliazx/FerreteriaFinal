import { useParams } from 'react-router-dom'
import BotonVolver from '../atoms/BotonVolver';
import BotonAgregar from '../atoms/BotonAgregar';
import NoEncontrado from './NoEncontrado';

interface DetalleProps {
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

function Detalleproducto({ productos, categorias, onAgregar }: DetalleProps) {

    const { id } = useParams()

    const producto = productos.find(
        producto => producto.id === Number(id)
    )

    if (!producto) {
        return <NoEncontrado />
    }

    const categoria = categorias.find(c => c.slug === producto.categoria)

    return (
        <main className="container my-5">

            <section className="bg-white p-4 p-md-5 shadow-sm rounded">

                <div className="row g-5 align-items-center">

                    <div className="col-12 col-md-5 text-center">
                        <img
                            src={producto.imagen}
                            alt={producto.titulo}
                            className="img-fluid detalle-img"
                        />
                    </div>

                    <div className="col-12 col-md-7">

                        {categoria && (
                            <span className="badge badge-categoria mb-3">
                                {categoria.nombre}
                            </span>
                        )}

                        <h1 className="fw-bold text-dark">{producto.titulo}</h1>

                        <p className="text-muted fs-5">{producto.descripcion}</p>

                        <p className="fs-2 fw-bold text-dark">${producto.precio.toLocaleString('es-CL')}</p>

                        <div className="d-flex gap-2 mt-4">
                            <BotonVolver to={categoria ? `/categoria/${categoria.slug}` : '/productos'} />
                            <BotonAgregar id={producto.id} onAgregar={onAgregar} />
                        </div>

                    </div>

                </div>

            </section>

        </main>
    );
}

export default Detalleproducto;
