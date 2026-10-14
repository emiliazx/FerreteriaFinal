import Boton from '../atoms/Boton'
import BotonAgregar from '../atoms/BotonAgregar'

interface CardProps {
    id: number;
    titulo: string;
    descripcion: string;
    precio: number;
    imagen: string;
    onAgregar: (id: number) => void;
}

function CardProducto({ id, titulo, descripcion, precio, imagen, onAgregar }: CardProps) {

    return (
        <div className="card h-100 shadow-sm border-0 card-producto">

            <img
                src={imagen}
                className="card-img-top"
                alt={titulo}
            />

            <div className="card-body d-flex flex-column">

                <h5 className="card-title fw-bold text-dark">
                    {titulo}
                </h5>

                <p className="card-text text-muted small flex-grow-1">
                    {descripcion}
                </p>

                <div className="mt-3">

                    <span className="fs-5 fw-bold text-dark d-block mb-2">
                        ${precio.toLocaleString('es-CL')}
                    </span>

                    <div className="d-flex gap-2">
                        <Boton id={id} />
                        <BotonAgregar id={id} onAgregar={onAgregar} className="flex-fill" />
                    </div>

                </div>

            </div>

        </div>
    )

}

export default CardProducto
