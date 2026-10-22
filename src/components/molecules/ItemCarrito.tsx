import { Link } from 'react-router-dom'
interface ItemCarritoProps {
    item: {
        id: number;
        titulo: string;
        precio: number;
        imagen: string;
        cantidad: number;
    };
    onCambiarCantidad: (id: number, cantidad: number) => void;
    onEliminar: (id: number) => void;
}

function ItemCarrito({ item, onCambiarCantidad, onEliminar }: ItemCarritoProps) {

    return (
        <div className="card shadow-sm border-0 mb-3">

            <div className="card-body d-flex flex-column flex-md-row align-items-center justify-content-between p-3 gap-3">

                <div className="d-flex align-items-center gap-3 w-100">

                    <div className="bg-light border rounded d-flex justify-content-center align-items-center item-carrito-img">
                        <img
                            src={item.imagen}
                            alt={item.titulo}
                        />
                    </div>

                    <div>
                        <h5 className="mb-1 fw-bold">
                            <Link to={`/productos/${item.id}`} className="text-dark text-decoration-none">
                                {item.titulo}
                            </Link>
                        </h5>
                        <small className="text-muted">
                            ${item.precio.toLocaleString('es-CL')} c/u
                        </small>
                    </div>

                </div>

                <div className="d-flex align-items-center justify-content-between w-100 gap-3">

                    <input
                        type="number"
                        className="form-control text-center input-cantidad"
                        value={item.cantidad}
                        min={1}
                        onChange={e => onCambiarCantidad(item.id, e.target.valueAsNumber)}
                        aria-label={`Cantidad de ${item.titulo}`}
                    />

                    <span className="fw-bold fs-5 text-nowrap">
                        ${(item.precio * item.cantidad).toLocaleString('es-CL')}
                    </span>

                    <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        title="Eliminar producto"
                        onClick={() => onEliminar(item.id)}
                    >
                        🗑️
                    </button>

                </div>

            </div>

        </div>
    )

}

export default ItemCarrito
