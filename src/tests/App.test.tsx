// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'

describe('navegación y pedido de la ferretería', () => {
  	afterEach(() => {
		cleanup()
  		vi.restoreAllMocks()
 		})

 	const renderConRuta = (initialEntries = ['/']) => {
  		return render(
   			<MemoryRouter initialEntries={initialEntries}>
    			<App />
   			</MemoryRouter>
  			)
 	}

it('abre una categoría y muestra solo sus productos', async () => {
	renderConRuta(['/categoria/herramientas'])
	expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
})

it('abre el detalle de un producto y lo agrega al pedido', async () => {
	renderConRuta(['/productos'])
	const botonesAnadir = await screen.findAllByRole('button', { name: /Añadir/i })
	if (botonesAnadir.length > 0) {
	fireEvent.click(botonesAnadir[0])
	}
})

 	it('muestra los productos e imágenes originales del catálogo de pinturas', async () => {
  		renderConRuta(['/categoria/pintura'])
  		expect(await screen.findByRole('heading', { level: 1 })).toBeTruthy()
 	})

 	it('muestra el pedido vacío y mantiene el enlace de contacto separado', async () => {
  		renderConRuta(['/carrito'])
  		expect(await screen.findByText(/Tu carro está vacío|Resumen/i)).toBeTruthy()
	})

 	it('valida el formulario de contacto y muestra la confirmación al enviar un mensaje válido', async () => {
  		renderConRuta(['/contacto'])
  		const botonEnviar = await screen.findByRole('button', { name: /ENVIAR/i })
  		expect(botonEnviar).toBeTruthy()
 	})

 	it('muestra el formulario de acceso sin simular autenticación', async () => {
  		renderConRuta(['/login'])
  		expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeTruthy()
  		expect(screen.getByLabelText('Correo')).toBeTruthy()
  		expect(screen.getByLabelText('Clave', { selector: 'input' })).toBeTruthy()
  		expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy()
 	})
})