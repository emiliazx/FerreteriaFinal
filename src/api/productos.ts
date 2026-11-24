import { apiFetch } from './client'

export interface Producto {
  id: number
  categoria: string
  titulo: string
  descripcion: string
  precio: number
  imagen: string | null
}

export interface ProductoRequest {
  categoria: string
  titulo: string
  descripcion: string
  precio: number
  imagen?: string | null
}

export async function listarProductos(categoria?: string): Promise<Producto[]> {
  const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''
  return apiFetch<Producto[]>(`/api/productos${query}`)
}

export async function obtenerProducto(id: number): Promise<Producto> {
  return apiFetch<Producto>(`/api/productos/${id}`)
}

export async function crearProducto(data: ProductoRequest): Promise<Producto> {
  return apiFetch<Producto>('/api/productos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function actualizarProducto(id: number, data: ProductoRequest): Promise<Producto> {
  return apiFetch<Producto>(`/api/productos/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function eliminarProducto(id: number): Promise<void> {
  return apiFetch<void>(`/api/productos/${id}`, {
    method: 'DELETE',
  })
}
