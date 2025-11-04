export interface Alojamiento {
  id: number
  nombre: string
  descripcion: string
  direccion: string
  ciudad: string
  precioPorNoche: number
  capacidadMaxima: number
  numHabitaciones: number
  numBanos: number
  imagenes: string[]
  servicios: Servicio[]
  calificacionPromedio: number
  estado: EstadoAlojamiento
  anfitrionId: number
  anfitrionNombre: string
}

export enum EstadoAlojamiento {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  ELIMINADO = "ELIMINADO",
}

export enum Servicio {
  WIFI = "WIFI",
  PISCINA = "PISCINA",
  ESTACIONAMIENTO = "ESTACIONAMIENTO",
  AIRE_ACONDICIONADO = "AIRE_ACONDICIONADO",
  COCINA = "COCINA",
  MASCOTAS = "MASCOTAS",
  TV = "TV",
  LAVADORA = "LAVADORA",
}

export interface AlojamientoRequest {
  nombre: string
  descripcion: string
  direccion: string
  ciudad: string
  precioPorNoche: number
  capacidadMaxima: number
  numHabitaciones: number
  numBanos: number
  servicios: Servicio[]
}

export interface BusquedaAlojamientoParams {
  ciudad?: string
  fechaInicio?: string
  fechaFin?: string
  precioMin?: number
  precioMax?: number
  capacidad?: number
  servicios?: Servicio[]
  page?: number
  size?: number
}
