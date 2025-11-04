import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { Observable } from "rxjs"
import { environment } from "@environments/environment"
import { Resena, ResenaRequest, ResponderResenaRequest } from "../models/resena.model"

@Injectable({
  providedIn: "root",
})
export class ResenaService {
  private apiUrl = `${environment.apiUrl}/resenas`

  constructor(private http: HttpClient) {}

  crear(resena: ResenaRequest): Observable<Resena> {
    return this.http.post<Resena>(this.apiUrl, resena)
  }

  obtenerPorAlojamiento(alojamientoId: number): Observable<Resena[]> {
    return this.http.get<Resena[]>(`${this.apiUrl}/alojamiento/${alojamientoId}`)
  }

  responder(resenaId: number, respuesta: ResponderResenaRequest): Observable<Resena> {
    return this.http.post<Resena>(`${this.apiUrl}/${resenaId}/responder`, respuesta)
  }
}