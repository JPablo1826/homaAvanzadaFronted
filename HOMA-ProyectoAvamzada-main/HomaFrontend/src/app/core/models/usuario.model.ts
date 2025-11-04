export interface Usuario {
  id: number
  nombre: string
  email: string
  telefono?: string
  rol: RolUsuario
  estado: EstadoUsuario
  fechaRegistro: Date
}

export enum RolUsuario {
  USUARIO = "USUARIO",
  ANFITRION = "ANFITRION",
  ADMIN = "ADMIN",
}

export enum EstadoUsuario {
  ACTIVO = "ACTIVO",
  INACTIVO = "INACTIVO",
  PENDIENTE_ACTIVACION = "PENDIENTE_ACTIVACION",
}

export interface RegistroUsuarioRequest {
  nombre: string
  email: string
  password: string
  telefono?: string
  rol: RolUsuario
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  usuario: Usuario
}
