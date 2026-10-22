import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const slides = [
    { imagen: '/img/logo.jpg',  alt: 'Ferretería Los Maestros' },
    { imagen: '/img/index.jpg', alt: 'Herramientas' },
]

function HeroCarousel() {

    const [indice, setIndice] = useState(0)

    
    useEffect(() => {
        const temporizador = setInterval(
            () => setIndice(i => (i + 1) % slides.length),
            4500
        )
        return () => clearInterval(temporizador)
    }, [indice])

    const siguiente = () => setIndice(i => (i + 1) % slides.length)
    const anterior = () => setIndice(i => (i - 1 + slides.length) % slides.length)

    return (
        <header className="hero-carousel carousel" aria-label="Presentación de Ferretería Los Maestros">

            {slides.map((slide, i) => (
                <img
                    key={slide.imagen}
                    src={slide.imagen}
                    alt={slide.alt}
                    className={`slide-img${i === indice ? ' activo' : ''}`}
                />
            ))}

            <div className="hero-copy">
                <span className="hero-eyebrow">FERRETERÍA LOS MAESTROS</span>
                <h1>Todo para construir y reparar</h1>
                <p>Encuentra materiales, herramientas y asesoría para llevar adelante tu próximo proyecto.</p>
                <Link to="/productos" className="btn btn-naranja hero-cta">
                    Explorar productos
                </Link>
            </div>

            <button className="carousel-control-prev" type="button" onClick={anterior}>
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
            </button>

            <button className="carousel-control-next" type="button" onClick={siguiente}>
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Siguiente</span>
            </button>

        </header>
    )

}

export default HeroCarousel
