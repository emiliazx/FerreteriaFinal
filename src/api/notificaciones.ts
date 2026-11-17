import { apiFetch } from './client'

export interface Notificacion {
  id: number
  userId?: number
  email?: string
  tipo: string
  titulo: string
  mensaje: string
  leida: boolean
  createdAt: string
}

export interface NotificacionRequest {
  userId?: number
  email?: string
  tipo: string
  titulo: string
  mensaje: string
}

export async function crearNotificacion(data: NotificacionRequest): Promise<Notificacion> {
  return apiFetch<Notificacion>('/api/notificaciones', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function listarPorUsuario(userId: number): Promise<Notificacion[]> {
  return apiFetch<Notificacion[]>(`/api/notificaciones/usuario/${userId}`)
}

export async function listarPorEmail(email: string): Promise<Notificacion[]> {
  return apiFetch<Notificacion[]>(`/api/notificaciones/email/${email}`)
}

export async function marcarLeida(id: number): Promise<Notificacion> {
  return apiFetch<Notificacion>(`/api/notificaciones/${id}/leida`, {
    method: 'PUT',
  })
}