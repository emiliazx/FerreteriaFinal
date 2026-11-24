import { apiFetch } from './client'

export interface ItemCarrito {
  productoId: number
  titulo: string
  precioUnitario: number
  imagen: string | null
  cantidad: number
  subtotal: number
}

export interface CarritoResponse {
  clienteId: string
  items: ItemCarrito[]
  totalUnidades: number
  subtotal: number
}

export async function obtenerCarrito(clienteId: string): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(`/api/carritos/${encodeURIComponent(clienteId)}`)
}

export async function agregarAlCarrito(
  clienteId: string,
  productoId: number,
  cantidad: number = 1,
): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(`/api/carritos/${encodeURIComponent(clienteId)}/items`, {
    method: 'POST',
    body: JSON.stringify({ productoId, cantidad }),
  })
}

export async function actualizarCantidadCarrito(
  clienteId: string,
  productoId: number,
  cantidad: number,
): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(
    `/api/carritos/${encodeURIComponent(clienteId)}/items/${productoId}`,
    {
      method: 'PUT',
      body: JSON.stringify({ cantidad }),
    },
  )
}

export async function eliminarItemCarrito(
  clienteId: string,
  productoId: number,
): Promise<CarritoResponse> {
  return apiFetch<CarritoResponse>(
    `/api/carritos/${encodeURIComponent(clienteId)}/items/${productoId}`,
    { method: 'DELETE' },
  )
}

export async function vaciarCarrito(clienteId: string): Promise<void> {
  return apiFetch<void>(`/api/carritos/${encodeURIComponent(clienteId)}`, {
    method: 'DELETE',
  })
}
