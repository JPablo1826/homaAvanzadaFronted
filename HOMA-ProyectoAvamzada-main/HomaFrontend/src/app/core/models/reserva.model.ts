export interface Reserva {
  id: number
  alojamientoId: number
  alojamientoNombre: string
  usuarioId: number
  usuarioNombre: string
  fechaInicio: Date
  fechaFin: Date
  numHuespedes: number
  precioTotal: number
  estado: EstadoReserva
  fechaReserva: Date
}

export enum EstadoReserva {
  PENDIENTE = "PENDIENTE",
  CONFIRMADA = "CONFIRMADA",
  CANCELADA = "CANCELADA",
  COMPLETADA = "COMPLETADA",
}

export interface ReservaRequest {
  alojamientoId: number
  fechaInicio: string
  fechaFin: string
  numHuespedes: number
}
