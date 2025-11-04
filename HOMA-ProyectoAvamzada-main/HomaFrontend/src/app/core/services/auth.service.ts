import { Injectable } from "@angular/core"
import { HttpClient } from "@angular/common/http"
import { BehaviorSubject, type Observable, tap } from "rxjs"
import { Router } from "@angular/router"
import { environment } from "@environments/environment"
import { LoginRequest, LoginResponse, RegistroUsuarioRequest, Usuario } from "../models/usuario.model"

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<Usuario | null>
  public currentUser: Observable<Usuario | null>
  private apiUrl = `${environment.apiUrl}/auth`

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const storedUser = localStorage.getItem("currentUser")
    this.currentUserSubject = new BehaviorSubject<Usuario | null>(storedUser ? JSON.parse(storedUser) : null)
    this.currentUser = this.currentUserSubject.asObservable()
  }

  public get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value
  }

  public get isAuthenticated(): boolean {
    return !!this.getToken()
  }

  public get isAnfitrion(): boolean {
    const user = this.currentUserValue
    return user?.rol === "ANFITRION" || user?.rol === "ADMIN"
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        this.setSession(response)
      }),
    )
  }

  register(data: RegistroUsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.apiUrl}/register`, data)
  }

  logout(): void {
    localStorage.removeItem(environment.jwtTokenKey)
    localStorage.removeItem(environment.jwtRefreshTokenKey)
    localStorage.removeItem("currentUser")
    this.currentUserSubject.next(null)
    this.router.navigate(["/auth/login"])
  }

  refreshToken(): Observable<LoginResponse> {
    const refreshToken = localStorage.getItem(environment.jwtRefreshTokenKey)
    return this.http.post<LoginResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap((response) => {
        this.setSession(response)
      }),
    )
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtTokenKey)
  }

  private setSession(authResult: LoginResponse): void {
    localStorage.setItem(environment.jwtTokenKey, authResult.token)
    localStorage.setItem(environment.jwtRefreshTokenKey, authResult.refreshToken)
    localStorage.setItem("currentUser", JSON.stringify(authResult.usuario))
    this.currentUserSubject.next(authResult.usuario)
  }
}
