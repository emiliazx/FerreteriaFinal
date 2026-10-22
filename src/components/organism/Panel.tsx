import { Link } from "react-router-dom";
import TarjetaResumen from "../molecules/TarjetaResumen";

interface PanelProps {
    titulo: string;
    descripcion: string;
    resumen: { titulo: string; valor: string | number }[];
    tablaTitulo: string;
    columnas: string[];
    filas: React.ReactNode[][];
    accionesTitulo: string;
    acciones: { texto: string; to: string; secundaria?: boolean }[];
}


function Panel({ titulo, descripcion, resumen, tablaTitulo, columnas, filas, accionesTitulo, acciones }: PanelProps) {

    return (
        <main className="container my-5">

            <div className="dashboard">

                <header className="dashboard-header">

                    <div>
                        <div className="dashboard-brand">
                            <img src="/img/logo1.jpg" alt="Logo de Ferretería Los Maestros" />
                            <span>Ferretería Los Maestros</span>
                        </div>
                        <h1>{titulo}</h1>
                        <p>{descripcion}</p>
                    </div>

                    <Link className="dashboard-link" to="/login">
                        Cerrar sesión
                    </Link>

                </header>

                <section className="dashboard-grid">
                    {resumen.map(r => (
                        <TarjetaResumen key={r.titulo} titulo={r.titulo} valor={r.valor} />
                    ))}
                </section>

                <section className="dashboard-section">

                    <h2>{tablaTitulo}</h2>

                    <div className="table-responsive">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    {columnas.map(c => <th key={c}>{c}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {filas.map((fila, i) => (
                                    <tr key={i}>
                                        {fila.map((celda, j) => <td key={j}>{celda}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </section>

                <section className="dashboard-section">

                    <h2>{accionesTitulo}</h2>

                    <div className="dashboard-actions">
                        {acciones.map(a => (
                            <Link
                                key={a.texto}
                                className={`dashboard-button${a.secundaria ? ' secondary' : ''}`}
                                to={a.to}
                            >
                                {a.texto}
                            </Link>
                        ))}
                    </div>

                </section>

            </div>

        </main>
    )

}

export default Panel
