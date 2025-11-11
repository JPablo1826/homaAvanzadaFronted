import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";

import { AuthService } from "../../core/services/auth.service";
import { UsuarioService } from "../../core/services/usuario.service";
import { AlojamientoService, PageResponse } from "../../core/services/alojamiento.service";
import { ReservaService } from "../../core/services/reserva.service";
import { Usuario } from "../../core/models/usuario.model";
import { Alojamiento } from "../../core/models/alojamiento.model";
import { Reserva } from "../../core/models/reserva.model";

interface Booking {
  id: number;
  title: string;
  location: string;
  dateRange: string;
  price: string;
  image: string;
}

interface Activity {
  id: number;
  icon: string;
  title: string;
  date: string;
  price?: string;
}

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
  isEditMode = false;
  isSaving = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

  activeSection: string = "myProfile";

  // Datos de alojamientos reales
  misAlojamientos: Alojamiento[] = [];
  isLoadingAlojamientos = false;
  totalAlojamientos = 0;

  // Datos de reservas reales
  misReservas: Reserva[] = [];
  isLoadingReservas = false;

  upcomingBookings: Booking[] = [
    {
      id: 1,
      title: "Cozy Cabin Retreat",
      location: "Mountain View, CA",
      dateRange: "May 15 - May 20",
      price: "$350",
      image: "assets/images/cabin.jpg",
    },
  ];

  recentActivities: Activity[] = [
    {
      id: 1,
      icon: "fa-plane",
      title: "Booked Cozy Cabin Retreat",
      date: "May 10",
      price: "$350",
    },
    {
      id: 2,
      icon: "fa-heart",
      title: "Added Cozy Cabin Retreat to Favorites",
      date: "April 25",
    },
    {
      id: 3,
      icon: "fa-map-marker-alt",
      title: "Explored Mountain View, CA",
      date: "April 15",
    },
  ];

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
    private alojamientoService: AlojamientoService,
    private reservaService: ReservaService,
  ) {
    this.personalForm = this.fb.group({
      nombre: [""],
      email: [""],
      telefono: [""],
      contrasena: [""],
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

  get isAnfitrion(): boolean {
    const user = this.authService.currentUserValue;
    if (!user || !user.rol) {
      return false;
    }
    return user.rol.toString().toUpperCase() === 'ANFITRION' ||
           user.rol.toString().toUpperCase() === 'ADMIN';
  }

  get currentUser(): Usuario | null {
    return this.authService.currentUserValue;
  }

  getSectionTitle(): string {
    const titles: { [key: string]: string } = {
      myProfile: 'Mi Perfil',
      misAlojamientos: 'Panel de Anfitrión',
      myBookings: 'Mis Reservas',
      favorites: 'Favoritos',
      history: 'Historial',
      settings: 'Configuración',
      messages: 'Mensajes'
    };
    return titles[this.activeSection] || 'Mi Perfil';
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

  loadMisAlojamientos(page: number = 0, size: number = 10): void {
    this.isLoadingAlojamientos = true;
    this.error = undefined;

    this.alojamientoService
      .obtenerMisAlojamientos(page, size)
      .pipe(
        finalize(() => {
          this.isLoadingAlojamientos = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (response: PageResponse<Alojamiento>) => {
          this.misAlojamientos = response.content;
          this.totalAlojamientos = response.totalElements;
        },
        error: () => {
          this.error = "No se pudieron cargar tus alojamientos. Intenta nuevamente.";
        },
      });
  }

  logout(): void {
    this.authService.logout();
  }

  setActiveSection(section: string): void {
    this.activeSection = section;

    // Cargar alojamientos cuando se selecciona la sección de Mis Alojamientos
    if (section === 'misAlojamientos' && this.isAnfitrion) {
      this.loadMisAlojamientos();
    }

    // Cargar reservas cuando se selecciona la sección de Mis Reservas
    if (section === 'misReservas') {
      this.loadMisReservas();
    }
  }

  loadMisReservas(): void {
    this.isLoadingReservas = true;
    this.error = undefined;

    this.reservaService
      .obtenerMisReservas()
      .pipe(
        finalize(() => {
          this.isLoadingReservas = false;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (reservas: Reserva[]) => {
          this.misReservas = reservas;
        },
        error: () => {
          this.error = "No se pudieron cargar tus reservas. Intenta nuevamente.";
        },
      });
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Si cancela, recargar los datos originales
      const cachedUser = this.authService.currentUserValue;
      if (cachedUser) {
        this.patchForms(cachedUser);
      }
      // Limpiar foto seleccionada
      this.selectedFile = null;
      this.previewUrl = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        this.error = 'Por favor selecciona un archivo de imagen válido';
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.error = 'La imagen no debe superar los 5MB';
        return;
      }

      this.selectedFile = file;
      this.error = undefined;

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  saveProfile(): void {
    if (this.personalForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.error = undefined;

    // Si hay una foto seleccionada, usar FormData
    if (this.selectedFile) {
      const formData = new FormData();
      formData.append('foto', this.selectedFile);
      formData.append('nombre', this.personalForm.value.nombre);
      formData.append('email', this.personalForm.value.email);
      formData.append('telefono', this.personalForm.value.telefono || '');

      // Solo incluir contraseña si el usuario la ingresó
      if (this.personalForm.value.contrasena && this.personalForm.value.contrasena.trim() !== '') {
        formData.append('contrasena', this.personalForm.value.contrasena);
      }

      this.usuarioService
        .actualizarPerfilConFoto(formData)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (usuario) => {
            this.patchForms(usuario);
            this.authService.updateCurrentUser(usuario);
            this.isEditMode = false;
            this.selectedFile = null;
            this.previewUrl = null;
          },
          error: () => {
            this.error = "No se pudieron guardar los cambios. Intenta nuevamente.";
          },
        });
    } else {
      // Sin foto, enviar JSON normal
      const updatedData: any = {
        nombre: this.personalForm.value.nombre,
        email: this.personalForm.value.email,
        telefono: this.personalForm.value.telefono,
      };

      // Solo incluir contraseña si el usuario la ingresó
      if (this.personalForm.value.contrasena && this.personalForm.value.contrasena.trim() !== '') {
        updatedData.contrasena = this.personalForm.value.contrasena;
      }

      this.usuarioService
        .actualizarPerfil(updatedData)
        .pipe(
          finalize(() => {
            this.isSaving = false;
          }),
          takeUntil(this.destroy$),
        )
        .subscribe({
          next: (usuario) => {
            this.patchForms(usuario);
            this.authService.updateCurrentUser(usuario);
            this.isEditMode = false;
          },
          error: () => {
            this.error = "No se pudieron guardar los cambios. Intenta nuevamente.";
          },
        });
    }
  }

  private patchForms(usuario: Usuario): void {
    this.personalForm.patchValue({
      nombre: usuario.nombre ?? "",
      email: usuario.email ?? "",
      telefono: usuario.telefono ?? "",
      contrasena: "", // Nunca mostrar la contraseña
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
