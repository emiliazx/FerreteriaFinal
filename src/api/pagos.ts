import { apiFetch } from './client'

export interface ProcesarPagoRequest {
  ordenId: number
  monto: number
  metodo: 'TARJETA' | 'TRANSFERENCIA' | 'WEBPAY' | string
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
  estado: 'APROBADO' | 'RECHAZADO' | 'PENDIENTE' | string
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

export async function pagosPorOrden(ordenId: number): Promise<PagoResponse[]> {
  return apiFetch<PagoResponse[]>(`/api/pagos/orden/${ordenId}`)
}

export async function pagoPorComprobante(codigo: string): Promise<PagoResponse> {
  return apiFetch<PagoResponse>(`/api/pagos/comprobante/${codigo}`)
}
