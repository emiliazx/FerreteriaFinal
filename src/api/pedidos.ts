import { apiFetch } from './client'

export interface OrdenItemRequest {
  productoId: number
  titulo: string
  precioUnitario: number
  cantidad: number
  imagen?: string
}

export interface CrearOrdenRequest {
  userId?: number | null
  email: string
  nombreCliente: string
  telefono?: string
  direccion: string
  comuna?: string
  region?: string
  referencia?: string
  transportista?: string
  costoDespacho: number
  metodoPago?: string
  items: OrdenItemRequest[]
}

export interface OrdenItemResponse {
  id: number
  productoId: number
  titulo: string
  precioUnitario: number
  cantidad: number
  imagen?: string
  subtotal: number
}

export interface OrdenResponse {
  id: number
  userId?: number
  email: string
  nombreCliente: string
  telefono?: string
  direccion: string
  comuna?: string
  region?: string
  referencia?: string
  transportista?: string
  costoDespacho: number
  subtotal: number
  total: number
  estado: string
  metodoPago?: string
  createdAt: string
  items: OrdenItemResponse[]
}

export async function crearOrden(data: CrearOrdenRequest): Promise<OrdenResponse> {
  return apiFetch<OrdenResponse>('/api/ordenes', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function obtenerOrden(id: number): Promise<OrdenResponse> {
  return apiFetch<OrdenResponse>(`/api/ordenes/${id}`)
}

export async function listarTodasLasOrdenes(estado?: string): Promise<OrdenResponse[]> {
  const q = estado ? `?estado=${encodeURIComponent(estado)}` : ''
  return apiFetch<OrdenResponse[]>(`/api/ordenes${q}`)
}

export async function listarOrdenesPorUsuario(userId: number): Promise<OrdenResponse[]> {
  return apiFetch<OrdenResponse[]>(`/api/ordenes/usuario/${userId}`)
}

export async function listarOrdenesPorEmail(email: string): Promise<OrdenResponse[]> {
  return apiFetch<OrdenResponse[]>(`/api/ordenes/email/${encodeURIComponent(email)}`)
}

export async function actualizarEstadoOrden(
  id: number,
  estado: string,
): Promise<OrdenResponse> {
  return apiFetch<OrdenResponse>(`/api/ordenes/${id}/estado`, {
    method: 'PUT',
    body: JSON.stringify({ estado }),
  })
}