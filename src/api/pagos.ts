import { apiFetch } from './client'

export type MetodoPago = 'TARJETA' | 'TRANSFERENCIA' | 'WEBPAY'

export interface ProcesarPagoRequest {
  ordenId: number
  monto: number
  metodo: MetodoPago
  numeroTarjeta?: string
  titular?: string
  vencimiento?: string
  cvv?: string
}

export interface PagoResponse {
  id: number
  ordenId: number
  monto: number
  metodo: string
  estado: string
  tarjetaMask?: string
  titular?: string
  comprobante: string
  mensaje: string
  fecha: string
}

export async function procesarPago(data: ProcesarPagoRequest): Promise<PagoResponse> {
  return apiFetch<PagoResponse>('/api/pagos', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function obtenerPago(id: number): Promise<PagoResponse> {
  return apiFetch<PagoResponse>(`/api/pagos/${id}`)
}

export async function listarTodosLosPagos(): Promise<PagoResponse[]> {
  return apiFetch<PagoResponse[]>('/api/pagos')
}

export async function listarPagosPorOrden(ordenId: number): Promise<PagoResponse[]> {
  return apiFetch<PagoResponse[]>(`/api/pagos/orden/${ordenId}`)
}

export async function buscarPorComprobante(codigo: string): Promise<PagoResponse> {
  return apiFetch<PagoResponse>(`/api/pagos/comprobante/${encodeURIComponent(codigo)}`)
}