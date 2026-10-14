import { Link } from 'react-router-dom'

interface CardCategoriaProps {
    slug: string;
    titulo: string;
    imagen: string;
}

function CardCategoria({ slug, titulo, imagen }: CardCategoriaProps) {

    return (
        <div className="category-card position-relative overflow-hidden rounded text-center">

            <img
                src={imagen}
                className="position-absolute top-0 start-0 w-100 h-100"
                alt={titulo}
            />

            <div className="category-overlay position-absolute top-0 start-0 w-100 h-100"></div>

            <div className="category-content position-relative d-flex flex-column justify-content-center align-items-center h-100 p-4">

                <h3 className="text-white mb-3">
                    {titulo}
                </h3>

                <Link
                    to={`/categoria/${slug}`}
                    className="btn btn-light rounded-pill px-4 fw-bold"
                >
                    Ver Categoría
                </Link>

            </div>

        </div>
    )

}

export default CardCategoria
