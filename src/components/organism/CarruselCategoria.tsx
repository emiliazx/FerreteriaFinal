import CardCategoria from "../molecules/CardCategoria";
import { useEffect, useState } from "react";

const POR_PAGINA = 3

// Orden, título e imagen con que aparecen las categorías en la portada
const ordenCarrusel = [
    { slug: 'herramientas', titulo: 'Herramientas', imagen: '/img/manuales.jpg' },
    { slug: 'electricidad', titulo: 'Eléctricas',   imagen: '/img/electricas.jpg' },
    { slug: 'pintura',      titulo: 'Pinturas',     imagen: '/img/pintura.jpg' },
    { slug: 'seguridad',    titulo: 'Seguridad',    imagen: '/img/seguridad.jpg' },
    { slug: 'tornillos',    titulo: 'Tornillos',    imagen: '/img/tornillos.jpg' },
    { slug: 'jardin',       titulo: 'Jardín',       imagen: '/img/jardin.jpg' },
    { slug: 'construccion', titulo: 'Construcción', imagen: '/img/construccion.jpg' },
    { slug: 'madera',       titulo: 'Madera',       imagen: '/img/madera.jpg' },
    { slug: 'gasfiteria',   titulo: 'Gasfitería',   imagen: '/img/gasfiteria.jpg' },
]

// Agrupa las categorías de 3 en 3 (una página del carrusel)
const paginas = Array.from(
    { length: Math.ceil(ordenCarrusel.length / POR_PAGINA) },
    (_, i) => ordenCarrusel.slice(i * POR_PAGINA, (i + 1) * POR_PAGINA)
)

function CarruselCategorias() {

    const [indice, setIndice] = useState(0)

    // Avanza solo cada 6 s y se reinicia al cambiar de página a mano
    useEffect(() => {
        const temporizador = setInterval(
            () => setIndice(i => (i + 1) % paginas.length),
            6000
        )
        return () => clearInterval(temporizador)
    }, [indice])

    const siguiente = () => setIndice(i => (i + 1) % paginas.length)
    const anterior = () => setIndice(i => (i - 1 + paginas.length) % paginas.length)
    const irA = (i: number) => setIndice(i)

    return (
        <section className="container seccion-categorias">

            <div className="text-center mb-4 pb-3">
                <h2 className="fw-bold titulo-seccion">Categorías Principales</h2>
                <p className="text-secondary">Explora nuestro catálogo con stock en tiempo real</p>
            </div>

            <div className="d-flex align-items-center gap-2">

                <button
                    type="button"
                    className="btn btn-dark btn-flecha"
                    onClick={anterior}
                    aria-label="Anterior"
                >
                    ‹
                </button>

                <div className="row g-4 flex-grow-1">
                    {paginas[indice].map(item => (
                        <div className="col-12 col-md-4" key={item.slug}>
                            <CardCategoria
                                slug={item.slug}
                                titulo={item.titulo}
                                imagen={item.imagen}
                            />
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    className="btn btn-dark btn-flecha"
                    onClick={siguiente}
                    aria-label="Siguiente"
                >
                    ›
                </button>

            </div>

            <div className="d-flex justify-content-center gap-2 mt-4">
                {paginas.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        className={`indicador${i === indice ? ' activo' : ''}`}
                        onClick={() => irA(i)}
                        aria-label={`Ir a la página ${i + 1}`}
                    />
                ))}
            </div>

        </section>
    )

}

export default CarruselCategorias
