import { Footer } from '../components/organisms/Footer'
import { LoginForm } from '../components/organisms/LoginForm'
import { Navbar } from '../components/organisms/Navbar'

export function LoginPage({ cartCount }: { cartCount: number }) {
  return (
    <div className="store-app">
      <Navbar cartCount={cartCount} />
      <main className="section login-page">
        <div className="login-card">
          <span className="eyebrow">Ferretería Los Maestros</span>
          <h1>Iniciar sesión</h1>
          <p>Accede a tu cuenta para continuar.</p>
          <LoginForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
