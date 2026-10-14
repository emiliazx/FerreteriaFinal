import { useState } from 'react'

interface BotonAgregarProps {
    id: number;
    onAgregar: (id: number) => void;
    className?: string;
}

function BotonAgregar({ id, onAgregar, className = '' }: BotonAgregarProps) {

    const [agregado, setAgregado] = useState(false)

    const manejarClick = () => {
        onAgregar(id)
        setAgregado(true)
        setTimeout(() => setAgregado(false), 1200)
    }

    return (
        <button
            type='button'
            className={`btn btn-naranja btn-sm fw-bold ${className}`}
            onClick={manejarClick}
        >
            {agregado ? '✓ Añadido' : 'Añadir'}
        </button>
    )
}

export default BotonAgregar
