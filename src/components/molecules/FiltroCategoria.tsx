import { Link } from 'react-router-dom'

interface FiltroProps {
    categorias: { slug: string; nombreCorto: string }[];
    activa?: string;
}

function FiltroCategorias({ categorias, activa }: FiltroProps) {

    return (
        <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">

            <Link
                to="/productos"
                className={`btn btn-sm rounded-pill ${!activa ? 'btn-naranja' : 'btn-outline-dark'}`}
            >
                Todos
            </Link>

            {categorias.map(c => (
                <Link
                    key={c.slug}
                    to={`/categoria/${c.slug}`}
                    className={`btn btn-sm rounded-pill ${activa === c.slug ? 'btn-naranja' : 'btn-outline-dark'}`}
                >
                    {c.nombreCorto}
                </Link>
            ))}

        </div>
    )

}

export default FiltroCategorias
