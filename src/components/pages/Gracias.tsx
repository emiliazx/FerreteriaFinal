import { Link } from "react-router-dom";

function Gracias(){

    return(
        <main className="container my-auto py-5 text-center">
            <div className="row justify-content-center">
                <div className="col-12 col-md-6">

                    <div className="bg-white p-5 border rounded shadow-sm">

                        <div className="fs-1 mb-3">✅</div>

                        <h1 className="fw-bold mb-3 fs-2 titulo-seccion">¡Gracias por contactarte!</h1>

                        <p className="text-secondary mb-4">
                            Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y nos pondremos en contacto contigo lo más pronto posible.
                        </p>

                        <Link to="/" className="btn btn-dark px-5 py-2 fw-bold">
                            VOLVER AL INICIO
                        </Link>

                    </div>

                </div>
            </div>
        </main>
    )
}
export default Gracias
