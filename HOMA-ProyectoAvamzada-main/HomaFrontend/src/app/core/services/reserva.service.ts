import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "@environments/environment"
import  { Reserva, ReservaRequest } from "../models/reserva.model"

@Injectable({
  providedIn: "root",
})
export class ReservaService {
  private apiUrl = `${environment.apiUrl}/reservas`

  constructor(private http: HttpClient) {}

  crear(reserva: ReservaRequest): Observable<Reserva> {
    return this.http.post<Reserva>(this.apiUrl, reserva)
  }

  obtenerMisReservas(): Observable<Reserva[]> {
    return this.http.get<Reserva[]>(`${this.apiUrl}/mis-reservas`)
  }

  obtenerPorId(id: number): Observable<Reserva> {
    return this.http.get<Reserva>(`${this.apiUrl}/${id}`)
  }

  cancelar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
  }

  verificarDisponibilidad(alojamientoId: number, fechaInicio: string, fechaFin: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/disponibilidad/${alojamientoId}`, {
      params: { fechaInicio, fechaFin },
    })
  }
}