import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

describe('navegación y pedido de la ferretería', () => {
  beforeEach(() => { window.history.replaceState({}, '', '#/') })
  afterEach(() => { cleanup(); vi.restoreAllMocks() })

  it('abre una categoría y muestra solo sus productos', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Herramientas' }))
    expect(await screen.findByRole('heading', { name: 'Herramientas', level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Set de Alicates Manuales 3 Piezas', level: 3 })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Pintura mate interior' })).toBeNull()
  })

  it('abre el detalle de un producto y lo agrega al pedido', async () => {
    window.history.replaceState({}, '', '#/producto/set-de-alicates-manuales-3-piezas')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Set de Alicates Manuales 3 Piezas', level: 1 })).toBeTruthy()
    expect(screen.getByText(/mangos ergonómicos antideslizantes/)).toBeTruthy()
    expect(screen.getByText('$11.990')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Agregar al pedido' }))
    fireEvent.click(screen.getByRole('link', { name: 'Mi pedido (1)' }))
    expect(await screen.findByRole('heading', { name: 'Mi pedido', level: 1 })).toBeTruthy()
    expect(screen.getByText('Set de Alicates Manuales 3 Piezas')).toBeTruthy()
  })

  it('muestra los productos e imágenes originales del catálogo de pinturas', async () => {
    window.history.replaceState({}, '', '#/catalogo/pinturas')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Pinturas', level: 1 })).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Impermeabilizante para Muros y Techos', level: 3 })).toBeTruthy()
    expect(screen.getByRole('img', { name: 'Impermeabilizante para Muros y Techos' }).getAttribute('src')).toBe('/img/pint2.jpg')
  })

  it('muestra el pedido vacío y mantiene el enlace de contacto separado', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Mi pedido' }))
    expect(await screen.findByText('Tu pedido está vacío')).toBeTruthy()
    expect(screen.getAllByRole('link', { name: 'Contáctanos' })).toHaveLength(1)
  })

  it('valida el formulario de contacto y muestra la confirmación al enviar un mensaje válido', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    render(<App />)
    fireEvent.click(screen.getByRole('link', { name: 'Contáctanos' }))
    fireEvent.click(await screen.findByRole('button', { name: 'Enviar mensaje' }))
    expect(alert).toHaveBeenLastCalledWith('Debe ingresar su nombre')
    fireEvent.change(screen.getByLabelText('Nombre completo'), { target: { value: 'Cristian' } })
    fireEvent.change(screen.getByLabelText('Teléfono'), { target: { value: '56912345678' } })
    fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'cristian@example.com' } })
    fireEvent.change(screen.getByLabelText('Mensaje'), { target: { value: 'Necesito una cotización' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar mensaje' }))
    expect(await screen.findByRole('heading', { name: '¡Gracias por contactarte!' })).toBeTruthy()
    expect(alert).toHaveBeenCalledTimes(1)
  })

  it('muestra el formulario de acceso sin simular autenticación', async () => {
    window.history.replaceState({}, '', '#/login')
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
    expect(screen.getByLabelText('Correo electrónico')).toBeTruthy()
    expect(screen.getByLabelText('Contraseña')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Iniciar sesión' }).hasAttribute('disabled')).toBe(true)
    expect(screen.getByRole('status').textContent).toMatch(/no tiene un sistema de cuentas conectado/)
  })
})
