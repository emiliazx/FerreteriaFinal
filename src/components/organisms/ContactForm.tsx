import type { FormEvent } from 'react'
import { Button } from '../atom/Button'
import { Input } from '../atom/Input'
import { FormField } from '../molecules/FormField'

export function ContactForm({ onSuccess }: { onSuccess: () => void }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') ?? '').trim()
    const email = String(form.get('email') ?? '').trim()
    const message = String(form.get('message') ?? '').trim()
    if (!name) return window.alert('Debe ingresar su nombre')
    if (!email) return window.alert('Debe ingresar su correo electrónico')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return window.alert('Ingrese un correo válido')
    if (!message) return window.alert('Debe ingresar un mensaje')
    onSuccess()
  }

  return (
    <form className="contact-form" onSubmit={submit} noValidate>
      <FormField id="contact-name" label="Nombre completo">
        <Input id="contact-name" name="name" type="text" autoComplete="name" />
      </FormField>
      <FormField id="contact-phone" label="Teléfono">
        <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
      </FormField>
      <FormField id="contact-email" label="Correo electrónico">
        <Input id="contact-email" name="email" type="email" autoComplete="email" />
      </FormField>
      <FormField id="contact-message" label="Mensaje">
        <textarea className="form-input" id="contact-message" name="message" rows={5} />
      </FormField>
      <Button type="submit">Enviar mensaje</Button>
    </form>
  )
}
