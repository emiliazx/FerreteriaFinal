interface EstadoProps {
    texto: string
    tipo?: 'cargando' | 'error' | 'exito' // El "?" lo hace opcional para no romper otros lugares donde ya uses <Estado texto="..." />
}

function Estado({ texto, tipo }: EstadoProps) {
    return (
        <span className={`status ${tipo ?? ''}`}>
            {texto}
        </span>
    )
}

export default Estado