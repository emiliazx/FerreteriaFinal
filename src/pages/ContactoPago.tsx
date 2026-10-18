import { Footer } from '../components/organisms/Footer'
import { ContactForm } from '../components/organisms/ContactForm'
import { Navbar } from '../components/organisms/Navbar'

export function ContactPage({ cartCount }: { cartCount: number }) {
  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main className="section contact-page">
        <div className="container contact-layout">
          <section className="contact-info">
            <span className="eyebrow">Estamos para ayudarte</span><h1>Contáctanos</h1>
            <p>Escríbenos para consultas, cotizaciones o información sobre nuestros productos. Te ayudamos con lo que necesitas para tu obra o tu hogar.</p>
            <p><strong>Correo:</strong> contactoFerreteria@LosMaestros</p>
            <p><strong>Teléfono:</strong> (+56 9) 2450003</p>
            <p><strong>Dirección:</strong> Calle Universidad de Chile 1, La Serena, Región de Coquimbo</p>
            <p><strong>Experiencia:</strong> Tu aliado en construcción desde 2004</p>
          </section>
          <ContactForm onSuccess={() => { window.location.hash = '#/gracias' }} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
