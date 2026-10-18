import { Footer } from '../components/organisms/Footer'
import { Navbar } from '../components/organisms/Navbar'

export function ThankYouPage({ cartCount }: { cartCount: number }) {
  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main className="section thank-you-page">
        <div className="container thank-you-card">
          <h1>¡Gracias por contactarte!</h1>
          <p>Hemos recibido tu mensaje correctamente. Nuestro equipo lo revisará y se pondrá en contacto contigo lo más pronto posible.</p>
          <a className="button-link" href="#/">Volver al inicio</a>
        </div>
      </main>
      <Footer />
    </div>
  )
}
