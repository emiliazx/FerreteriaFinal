const marcas = [
    { nombre: 'Makita',   imagen: '/img/makita.jpg' },
    { nombre: 'Stanley',  imagen: '/img/stanley.jpg' },
    { nombre: 'Polpaico', imagen: '/img/polpaico.jpg' },
    { nombre: 'Bticino',  imagen: '/img/bticino.jpg' },
    { nombre: '3M',       imagen: '/img/3m.jpg' },
    { nombre: 'Philips',  imagen: '/img/philip.jpg' },
]

function Footer() {

    return (
        <footer className="bg-dark text-light py-4 mt-auto">

            <section className="container my-3 pb-4">

                <div className="text-center mb-4">
                    <h3 className="fw-bold text-white">Marcas Más Vendidas</h3>
                    <p className="text-secondary mb-0">Calidad garantizada para tus proyectos</p>
                </div>

                <div className="row row-cols-2 row-cols-md-4 row-cols-lg-6 g-3 justify-content-center">

                    {marcas.map(marca => (
                        <div className="col" key={marca.nombre}>
                            <div className="bg-white border rounded p-2 shadow-sm d-flex justify-content-center align-items-center marca-logo">
                                <img src={marca.imagen} alt={marca.nombre} className="img-fluid" />
                            </div>
                        </div>
                    ))}

                </div>

            </section>

            <div className="container text-center">
                <h5 className="fw-bold mb-3">Ferretería Los Maestros</h5>
                <p className="mb-0 text-secondary">La Serena, Región de Coquimbo. Tu aliado en construcción desde 2004.</p>
                <p className="mt-3 mb-0 text-secondary small">© 2026 Todos los derechos reservados.</p>
            </div>

        </footer>
    )

}

export default Footer
