import HeroCarousel from "../organism/HeroCarousel";
import CarruselCategorias from "../organism/CarruselCategoria";
import CardBeneficio from "../molecules/CardBeneficio";

const beneficios = [
    {
        icono: '📦',
        titulo: 'Stock en Tiempo Real',
        texto: 'Antes había que llamar y esperar a que alguien fuera a revisar la bodega. Hoy consultas la disponibilidad real de más de 800 productos desde tu celular, antes de subirte al auto rumbo a la tienda. Menos viajes en falso, más horas de trabajo en tu obra.',
    },
    {
        icono: '💳',
        titulo: 'Todo tipo de pago',
        texto: 'Recibimos efectivo, débito, crédito y transferencia. Si eres maestro o contratista registrado, además puedes comprar durante todo el mes con cuenta corriente y pagar todo junto a fin de mes, sin frenar la obra por falta de caja.',
    },
    {
        icono: '🚚',
        titulo: 'Despacho a obras',
        texto: 'Cuando la faena no puede esperar, coordinamos el despacho de cemento, herramientas o pinturas directo en la dirección de tu obra dentro de La Serena y alrededores, para que sigas trabajando sin perder tiempo yendo y viniendo del local.',
    },
    {
        icono: '🧾',
        titulo: 'Cotización sin compromiso',
        texto: 'Antes de comprar puedes armar tu pedido en la web, revisar precios actualizados y guardarlo como cotización para mostrarla al cliente o al jefe de obra, sin necesidad de pagar hasta confirmar que todo está correcto.',
        accion: { texto: 'Cotiza aquí', to: '/contacto' },
    },
]

function Inicio(){

    return(
        <>
            <HeroCarousel />

            <section className="inicio-beneficios">
                <div className="container">
                    <div className="inicio-seccion-titulo">
                        <span className="inicio-etiqueta">COMPRA CON CONFIANZA</span>
                        <h2 className="fw-bold titulo-seccion">Todo lo que tu proyecto necesita</h2>
                        <p className="text-secondary mb-0">
                            Soluciones prácticas para que avances en cada etapa de tu trabajo.
                        </p>
                    </div>

                    <div className="row g-4">

                        {beneficios.map(b => (
                            <div className="col-12 col-md-6" key={b.titulo}>
                                <CardBeneficio {...b} />
                            </div>
                        ))}

                    </div>
                </div>
            </section>

            <CarruselCategorias />
        </>
    )
}
export default Inicio
