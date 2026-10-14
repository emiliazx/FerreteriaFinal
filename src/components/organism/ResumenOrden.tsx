import { Link } from "react-router-dom";

interface ResumenOrdenProps {
    subtotal: number;
    hayItems: boolean;
}

function ResumenOrden({ subtotal, hayItems }: ResumenOrdenProps) {

    return (
        <div className="card shadow-sm p-4 border-0 resumen-orden">

            <h4 className="fw-bold mb-4">Resumen de la Orden</h4>

            <div className="d-flex justify-content-between mb-2 text-secondary">
                <span>Subtotal productos</span>
                <span>${subtotal.toLocaleString('es-CL')}</span>
            </div>

            <div className="d-flex justify-content-between mb-3 text-secondary">
                <span>Despacho</span>
                <span>Por calcular</span>
            </div>

            <hr className="text-muted" />

            <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Total a Pagar</span>
                <span className="fw-bold fs-5 total-orden">${subtotal.toLocaleString('es-CL')}</span>
            </div>

            <button
                type="button"
                className="btn btn-naranja w-100 fw-bold py-2 mb-2"
                disabled={!hayItems}
            >
                Ir a Pagar
            </button>

            <Link to="/productos" className="btn btn-outline-dark w-100 py-2">
                Seguir Comprando
            </Link>

        </div>
    )

}

export default ResumenOrden
