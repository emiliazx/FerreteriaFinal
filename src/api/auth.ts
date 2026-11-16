import { apiFetch } from './client'

export type AuthUser = {
  userId: number
  email: string
  nombre: string
  rol: string
  token: string
}

type AuthResponse = {
  token: string
  tipo: string
  userId: number
  email: string
  nombre: string
  rol: string
}

export async function login(email: string, password: string): Promise<AuthUser> {
  const data = await apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  return {
    token: data.token,
    userId: data.userId,
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
  }
}

export async function register(payload: {
  nombre: string
  email: string
  password: string
}): Promise<AuthUser> {
  const data = await apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return {
    token: data.token,
    userId: data.userId,
    email: data.email,
    nombre: data.nombre,
    rol: data.rol,
  }
}
