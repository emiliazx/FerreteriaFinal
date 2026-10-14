interface TarjetaResumenProps {
    titulo: string;
    valor: string | number;
}

function TarjetaResumen({ titulo, valor }: TarjetaResumenProps) {

    return (
        <article className="dashboard-card">
            <span>{titulo}</span>
            <strong>{valor}</strong>
        </article>
    )

}

export default TarjetaResumen
