import { Link } from "react-router-dom";
import ItemCarrito from "../molecules/ItemCarrito";
import ResumenOrden from "../organism/ResumenOrden";

interface CarritoProps {
    items: {
        id: number;
        titulo: string;
        precio: number;
        imagen: string;
        cantidad: number;
    }[];
    subtotal: number;
    onCambiarCantidad: (id: number, cantidad: number) => void;
    onEliminar: (id: number) => void;
}

function Carrito({ items, subtotal, onCambiarCantidad, onEliminar }: CarritoProps) {

    return (
        <main className="container my-5">

            <h1 className="fw-bold mb-4 titulo-carrito">Tu Carro de Compras</h1>

            <div className="row g-4">

                <div className="col-12 col-lg-8">

                    {items.length === 0 ? (
                        <div className="text-center py-5">
                            <p className="fs-5 text-muted">Tu carro está vacío.</p>
                            <Link to="/productos" className="btn btn-outline-dark">
                                Ver catálogo
                            </Link>
                        </div>
                    ) : (
                        items.map(item => (
                            <ItemCarrito
                                key={item.id}
                                item={item}
                                onCambiarCantidad={onCambiarCantidad}
                                onEliminar={onEliminar}
                            />
                        ))
                    )}

                </div>

                <div className="col-12 col-lg-4">
                    <ResumenOrden subtotal={subtotal} hayItems={items.length > 0} />
                </div>

            </div>

        </main>
    )
}

export default Carrito
