import { Link } from "react-router-dom";

function NoEncontrado(){

    return(
        <main className="container my-5 text-center">

            <h1 className="fw-bold titulo-seccion">No encontramos lo que buscas</h1>

            <p className="text-secondary mt-3">
                La página o el producto que intentas abrir no existe.
            </p>

            <Link to="/productos" className="btn btn-naranja fw-bold">
                Ver catálogo
            </Link>

        </main>
    )
}
export default NoEncontrado
