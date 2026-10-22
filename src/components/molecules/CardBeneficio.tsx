import { Link } from 'react-router-dom'

interface CardBeneficioProps {
    icono: string;
    titulo: string;
    texto: string;
    accion?: { texto: string; to: string };
}

function CardBeneficio({ icono, titulo, texto, accion }: CardBeneficioProps) {

    return (
        <div className="card card-beneficio h-100 shadow-sm border-0 p-3 d-flex flex-column">

            <div className="fs-1 mb-3 icono-beneficio">
                {icono}
            </div>

            <h5 className="fw-bold titulo-beneficio">
                {titulo}
            </h5>

            <p className="text-secondary mb-3 texto-beneficio">
                {texto}
            </p>

            {accion && (
                <Link
                    to={accion.to}
                    className="btn btn-naranja mt-auto fw-bold"
                >
                    {accion.texto}
                </Link>
            )}

        </div>
    )

}

export default CardBeneficio
