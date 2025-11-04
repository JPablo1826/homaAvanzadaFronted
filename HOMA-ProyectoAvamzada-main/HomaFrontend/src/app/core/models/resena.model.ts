export interface Resena {
  id: number
  alojamientoId: number
  usuarioId: number
  usuarioNombre: string
  reservaId: number
  calificacion: number
  comentario: string
  respuestaAnfitrion?: string
  fechaCreacion: Date
  fechaRespuesta?: Date
}

export interface ResenaRequest {
  reservaId: number
  calificacion: number
  comentario: string
}

export interface ResponderResenaRequest {
  respuesta: string
}
