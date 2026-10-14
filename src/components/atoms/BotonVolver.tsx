import { Link } from 'react-router-dom'

interface BotonVolverProps {
    to?: string;
}

function BotonVolver({ to = '/productos' }: BotonVolverProps) {

    return (
        <Link
            to={to}
            className='btn btn-secondary'
        >
            Volver
        </Link>
    )
}

export default BotonVolver
