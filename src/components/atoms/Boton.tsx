import { Link } from 'react-router-dom'

interface BotonProps {
    id: number;
}

function Boton({ id }: BotonProps) {

    return (
        <Link
            to={`/productos/${id}`}
            className='btn btn-outline-dark btn-sm flex-fill fw-bold'
        >
            Ver detalle
        </Link>
    )
}

export default Boton
