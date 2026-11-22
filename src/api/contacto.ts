import { apiFetch } from './client'

export interface MensajeContactoHilo {
  id: number
  remitente: 'CLIENTE' | 'ADMIN' | string
  texto: string
  createdAt?: string
}

export interface MensajeContacto {
  id: number
  nombre: string
  telefono?: string | null
  email: string
  mensaje: string
  respuesta?: string | null
  estado: 'PENDIENTE' | 'RESPONDIDO' | string
  createdAt?: string
  respondidoAt?: string | null
  hilo?: MensajeContactoHilo[]
}

export interface CrearContactoPayload {
  nombre: string
  telefono: string
  email: string
  mensaje: string
}

const STORAGE_KEY = 'ferreteria_mensajes_contacto'

const MENSAJES_INICIALES: MensajeContacto[] = [
  {
    id: 1,
    nombre: 'Camila Rojas',
    telefono: '+56 9 8412 3301',
    email: 'camila.rojas@correo.cl',
    mensaje: 'Hola, ¿tienen disponibilidad de taladro percutor inalámbrico y brocas para hormigón?',
    respuesta: null,
    estado: 'PENDIENTE',
    createdAt: new Date().toISOString(),
    hilo: [
      {
        id: 1,
        remitente: 'CLIENTE',
        texto: 'Hola, ¿tienen disponibilidad de taladro percutor inalámbrico y brocas para hormigón?',
        createdAt: new Date().toISOString(),
      },
    ],
  },
]

function leerLocal(): MensajeContacto[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MENSAJES_INICIALES))
      return MENSAJES_INICIALES
    }
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : MENSAJES_INICIALES
  } catch {
    return MENSAJES_INICIALES
  }
}

function guardarLocal(lista: MensajeContacto[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lista))
  } catch {
    /* ignorar */
  }
}

export async function enviarMensajeContacto(
  payload: CrearContactoPayload,
): Promise<MensajeContacto> {
  try {
    const creado = await apiFetch<MensajeContacto>('/api/notificaciones/contacto', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    const actual = leerLocal()
    guardarLocal([creado, ...actual.filter(m => m.id !== creado.id)])
    return creado
  } catch {
    const ahora = new Date().toISOString()
    const actual = leerLocal()
    const nuevo: MensajeContacto = {
      id: Date.now(),
      nombre: payload.nombre,
      telefono: payload.telefono,
      email: payload.email,
      mensaje: payload.mensaje,
      respuesta: null,
      estado: 'PENDIENTE',
      createdAt: ahora,
      hilo: [{ id: Date.now() + 1, remitente: 'CLIENTE', texto: payload.mensaje, createdAt: ahora }],
    }
    guardarLocal([nuevo, ...actual])
    return nuevo
  }
}

export async function listarMensajesContacto(): Promise<MensajeContacto[]> {
  try {
    const data = await apiFetch<MensajeContacto[]>('/api/notificaciones/contacto')
    if (Array.isArray(data) && data.length > 0) {
      guardarLocal(data)
      return data
    }
    return leerLocal()
  } catch {
    return leerLocal()
  }
}

export async function responderMensajeContacto(
  id: number,
  respuesta: string,
): Promise<MensajeContacto> {
  try {
    const actualizado = await apiFetch<MensajeContacto>(
      `/api/notificaciones/contacto/${id}/responder`,
      {
        method: 'PUT',
        body: JSON.stringify({ respuesta }),
      },
    )
    const lista = leerLocal().map(m => (m.id === id ? actualizado : m))
    guardarLocal(lista)
    return actualizado
  } catch {
    const ahora = new Date().toISOString()
    let actualizado: MensajeContacto | null = null
    const lista = leerLocal().map(m => {
      if (m.id === id) {
        const hiloPrevio = m.hilo ?? []
        actualizado = {
          ...m,
          respuesta,
          estado: 'RESPONDIDO',
          respondidoAt: ahora,
          hilo: [...hiloPrevio, { id: Date.now(), remitente: 'ADMIN', texto: respuesta, createdAt: ahora }],
        }
        return actualizado
      }
      return m
    })
    guardarLocal(lista)
    if (!actualizado) {
      throw new Error('Mensaje no encontrado')
    }
    return actualizado
  }
}

export async function enviarMensajeHilo(
  id: number,
  remitente: 'CLIENTE' | 'ADMIN',
  texto: string,
): Promise<MensajeContacto> {
  try {
    const actualizado = await apiFetch<MensajeContacto>(
      `/api/notificaciones/contacto/${id}/mensajes`,
      {
        method: 'POST',
        body: JSON.stringify({ remitente, texto }),
      },
    )
    const lista = leerLocal().map(m => (m.id === id ? actualizado : m))
    guardarLocal(lista)
    return actualizado
  } catch {
    const ahora = new Date().toISOString()
    let actualizado: MensajeContacto | null = null
    const lista = leerLocal().map(m => {
      if (m.id === id) {
        const hiloPrevio = m.hilo ?? []
        actualizado = {
          ...m,
          respuesta: remitente === 'ADMIN' ? texto : m.respuesta,
          estado: remitente === 'ADMIN' ? 'RESPONDIDO' : 'PENDIENTE',
          respondidoAt: remitente === 'ADMIN' ? ahora : m.respondidoAt,
          hilo: [...hiloPrevio, { id: Date.now(), remitente, texto, createdAt: ahora }],
        }
        return actualizado
      }
      return m
    })
    guardarLocal(lista)
    if (!actualizado) {
      throw new Error('Mensaje no encontrado')
    }
    return actualizado
  }
}