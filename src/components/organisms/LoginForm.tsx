import { Button } from '../atom/Button'
import { Input } from '../atom/Input'
import { FormField } from '../molecules/FormField'

export function LoginForm() {
  return (
    <form className="login-form">
      <FormField id="login-email" label="Correo electrónico">
        <Input id="login-email" name="email" type="email" autoComplete="email" />
      </FormField>
      <FormField id="login-password" label="Contraseña">
        <Input id="login-password" name="password" type="password" autoComplete="current-password" />
      </FormField>
      <p className="login-notice" role="status">
        El acceso todavía no está habilitado porque este sitio no tiene un sistema de cuentas conectado.
      </p>
      <Button className="login-submit" type="button" disabled>Iniciar sesión</Button>
    </form>
  )
}
