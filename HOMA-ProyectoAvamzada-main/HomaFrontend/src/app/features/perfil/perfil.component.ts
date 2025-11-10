import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

import { AuthService } from "../../core/services/auth.service";
import { UsuarioService } from "../../core/services/usuario.service";
import { Usuario } from "../../core/models/usuario.model";

@Component({
  selector: "app-perfil",
  templateUrl: "./perfil.component.html",
  styleUrls: ["./perfil.component.scss"],
})
export class PerfilComponent implements OnInit, OnDestroy {
  personalForm: FormGroup;
  preferenciasForm: FormGroup;
  notificacionesForm: FormGroup;
  isLoading = false;
  error?: string;

  readonly idiomas = [
    { id: "es", label: "Espanol" },
    { id: "en", label: "English" },
    { id: "pt", label: "Portugues" },
  ];

  readonly monedas = [
    { id: "COP", label: "COP - Peso colombiano" },
    { id: "USD", label: "USD - Dolar estadounidense" },
    { id: "EUR", label: "EUR - Euro" },
  ];

  readonly zonasHorarias = [
    { id: "America/Bogota", label: "Bogota, Lima, Quito (UTC-5)" },
    { id: "America/New_York", label: "Nueva York (UTC-4)" },
    { id: "Europe/Madrid", label: "Madrid (UTC+2)" },
  ];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private usuarioService: UsuarioService,
  ) {
    this.personalForm = this.fb.group({
      nombre: [""],
      apellido: [""],
      email: [""],
      telefono: [""],
      direccion: [""],
    });

    this.preferenciasForm = this.fb.group({
      idiomaPreferido: [""],
      monedaPreferida: [""],
      zonaHoraria: [""],
    });

    this.notificacionesForm = this.fb.group({
      notificacionesEmail: [false],
      notificacionesPush: [false],
      recibirOfertas: [false],
    });
  }

  ngOnInit(): void {
    const cachedUser = this.authService.currentUserValue;
    if (cachedUser) {
      this.patchForms(cachedUser);
    }

    this.authService.currentUser.pipe(takeUntil(this.destroy$)).subscribe((usuario) => {
      if (usuario) {
        this.patchForms(usuario);
      }
    });

    this.loadProfile();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayName(): string {
    const { nombre, apellido } = this.personalForm.value;
    const parts = [nombre, apellido].filter((value) => !!value && value.trim().length > 0);
    return parts.join(" ") || nombre || "";
  }

  get displayEmail(): string {
    return this.personalForm.get("email")?.value ?? "";
  }

  loadProfile(): void {
    this.isLoading = true;
    this.error = undefined;

    this.usuarioService
      .obtenerPerfil()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (usuario) => {
          this.patchForms(usuario);
          this.authService.updateCurrentUser(usuario);
        },
        error: () => {
          this.error = "No se pudo cargar la informacion del perfil. Intenta nuevamente.";
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }

  private patchForms(usuario: Usuario): void {
    this.personalForm.patchValue({
      nombre: usuario.nombre ?? "",
      apellido: usuario.apellido ?? "",
      email: usuario.email ?? "",
      telefono: usuario.telefono ?? "",
      direccion: usuario.direccion ?? "",
    });

    this.preferenciasForm.patchValue({
      idiomaPreferido: usuario.idiomaPreferido ?? "",
      monedaPreferida: usuario.monedaPreferida ?? "",
      zonaHoraria: usuario.zonaHoraria ?? "",
    });

    this.notificacionesForm.patchValue({
      notificacionesEmail: usuario.notificacionesEmail ?? false,
      notificacionesPush: usuario.notificacionesPush ?? false,
      recibirOfertas: usuario.recibirOfertas ?? false,
    });
  }
}
