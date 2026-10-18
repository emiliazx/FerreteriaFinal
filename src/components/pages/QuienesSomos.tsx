import React from 'react';

// Definimos una interfaz opcional para mantener buenas prácticas en TypeScript
interface ValorEmpresa {
    titulo: string;
    descripcion: string;
    icono: string; // Clases de Bootstrap Icons o FontAwesome
}

const valores: ValorEmpresa[] = [
    {
        titulo: "Compromiso",
        descripcion: "Estamos contigo en cada etapa de tu proyecto de construcción o remodelación.",
        icono: "bi-shield-check"
    },
    {
        titulo: "Calidad Garantizada",
        descripcion: "Trabajamos solo con las marcas líderes del mercado para asegurar durabilidad.",
        icono: "bi-star-fill"
    },
    {
        titulo: "Atención Experta",
        descripcion: "Asesoría personalizada brindada por maestros y expertos en el área.",
        icono: "bi-people-fill"
    }
];

const QuienesSomos: React.FC = () => {
    return (
        <main className="container my-5">
            {/* Encabezado Principal */}
            <section className="text-center mb-5">
                <h1 className="fw-bold text-dark display-5">¿Quiénes Somos?</h1>
                <p className="text-secondary fs-4 mt-3 col-lg-8 mx-auto">
                    Somos <strong className="text-dark">Ferretería Los Maestros</strong>, ubicados en La Serena, Región de Coquimbo. 
                    Tu aliado estratégico en construcción y ferretería desde <span className="text-warning fw-bold">2004</span>.
                </p>
            </section>

            {/* Misión y Visión */}
            <section className="row g-4 mb-5">
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100 p-4 border-start border-warning border-4">
                        <h3 className="fw-bold text-dark mb-3">Nuestra Misión</h3>
                        <p className="text-secondary mb-0">
                            Proveer soluciones integrales en materiales de construcción, herramientas y ferretería, 
                            ofreciendo un servicio cercano, confiable y con productos de la más alta calidad para profesionales y hogares.
                        </p>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card border-0 shadow-sm h-100 p-4 border-start border-dark border-4">
                        <h3 className="fw-bold text-dark mb-3">Nuestra Visión</h3>
                        <p className="text-secondary mb-0">
                            Ser la ferretería líder y referente indiscutida en la Región de Coquimbo, reconocida por nuestra 
                            trayectoria, innovación constante y el compromiso inquebrantable con el éxito de nuestros clientes.
                        </p>
                    </div>
                </div>
            </section>

            {/* Sección de Valores */}
            <section className="mb-5">
                <h2 className="text-center fw-bold mb-4">¿Por qué elegirnos?</h2>
                <div className="row g-4">
                    {valores.map((valor, index) => (
                        <div className="col-md-4" key={index}>
                            <div className="card text-center border-0 shadow-sm h-100 p-4">
                                <div className="card-body">
                                    <div className="fs-1 text-warning mb-3">
                                        <i className={`bi ${valor.icono}`}></i>
                                    </div>
                                    <h4 className="fw-bold mb-3">{valor.titulo}</h4>
                                    <p className="text-secondary">{valor.descripcion}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default QuienesSomos;