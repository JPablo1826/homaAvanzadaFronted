import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { AlojamientoService } from '@core/services/alojamiento.service';
import { AuthService } from '@core/services/auth.service';
import { ReservaService } from '@core/services/reserva.service';
import { ResenaService } from '@core/services/resena.service';
import { Alojamiento, AlojamientoRequest, Servicio } from '@core/models/alojamiento.model';
import { ReservaRequest } from '@core/models/reserva.model';
import { Resena, ResenaRequest } from '@core/models/resena.model';

@Component({
  selector: 'app-detalle-alojamiento',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleAlojamientoComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  alojamiento?: Alojamiento;
  alojamientoForm: FormGroup;
  reservaForm: FormGroup;
  resenaForm: FormGroup;
  isEditing = false;
  isLoading = false;
  isSubmitting = false;
  isReservando = false;
  error?: string;
  successMessage?: string;
  errorReserva?: string;
  minDate: string;

  // Reseñas
  resenas: Resena[] = [];
  isLoadingResenas = false;
  isSubmittingResena = false;
  errorResena?: string;
  successResena?: string;
  mostrarFormularioResena = false;

  serviciosDisponibles = [
    { key: Servicio.WIFI, label: 'WiFi' },
    { key: Servicio.PISCINA, label: 'Piscina' },
    { key: Servicio.ESTACIONAMIENTO, label: 'Estacionamiento' },
    { key: Servicio.AIRE_ACONDICIONADO, label: 'Aire acondicionado' },
    { key: Servicio.COCINA, label: 'Cocina' },
    { key: Servicio.MASCOTAS, label: 'Mascotas permitidas' },
    { key: Servicio.TV, label: 'Televisión' },
    { key: Servicio.LAVADORA, label: 'Lavadora' }
  ];

  estadosDisponibles = [
    { key: 'PENDIENTE', label: 'Pendiente', description: 'En revisión' },
    { key: 'ACTIVO', label: 'Activo', description: 'Visible para huéspedes' },
    { key: 'INACTIVO', label: 'Inactivo', description: 'No visible' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private alojamientoService: AlojamientoService,
    private authService: AuthService,
    private reservaService: ReservaService,
    private resenaService: ResenaService
  ) {
    // Establecer fecha mínima como hoy
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.alojamientoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(150)]],
      descripcion: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(2000)]],
      ciudad: ['', Validators.required],
      direccion: ['', Validators.required],
      latitud: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitud: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      precioPorNoche: [null, [Validators.required, Validators.min(0.01)]],
      maxHuespedes: [1, [Validators.required, Validators.min(1)]],
      imagenes: this.fb.array([], [Validators.required, Validators.minLength(1)]),
      servicios: [[]],
      estado: ['PENDIENTE', Validators.required]
    });

    this.reservaForm = this.fb.group({
      fechaEntrada: ['', Validators.required],
      fechaSalida: ['', Validators.required],
      cantidadHuespedes: [1, [Validators.required, Validators.min(1)]]
    });

    this.resenaForm = this.fb.group({
      calificacion: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comentario: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAlojamiento(+id);
      this.loadResenas(+id);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAlojamiento(id: number): void {
    this.isLoading = true;
    this.error = undefined;

    this.alojamientoService
      .obtenerPorId(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (alojamiento) => {
          this.alojamiento = alojamiento;
          this.populateForm();
        },
        error: (err) => {
          this.error = err.error?.message || 'No se pudo cargar el alojamiento';
        }
      });
  }

  populateForm(): void {
    if (!this.alojamiento) return;

    this.alojamientoForm.patchValue({
      titulo: this.alojamiento.titulo,
      descripcion: this.alojamiento.descripcion,
      ciudad: this.alojamiento.ciudad,
      direccion: this.alojamiento.direccion,
      latitud: this.alojamiento.latitud,
      longitud: this.alojamiento.longitud,
      precioPorNoche: this.alojamiento.precioPorNoche,
      maxHuespedes: this.alojamiento.maxHuespedes,
      servicios: this.alojamiento.servicios,
      estado: this.alojamiento.estado
    });

    // Limpiar imagenes array y agregar las existentes
    this.imagenesArray.clear();
    this.alojamiento.imagenes.forEach(img => {
      this.imagenesArray.push(this.fb.control(img, Validators.required));
    });
  }

  get imagenesArray(): FormArray {
    return this.alojamientoForm.get('imagenes') as FormArray;
  }

  get canEdit(): boolean {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !this.alojamiento) return false;

    return currentUser.id.toString() === this.alojamiento.anfitrionId ||
           currentUser.rol?.toString().toUpperCase() === 'ADMIN';
  }

  toggleEditMode(): void {
    if (!this.canEdit) return;

    this.isEditing = !this.isEditing;
    this.error = undefined;
    this.successMessage = undefined;

    if (!this.isEditing) {
      // Si cancelamos, restauramos los valores originales
      this.populateForm();
    }
  }

  addImagen(): void {
    if (this.imagenesArray.length < 10) {
      this.imagenesArray.push(this.fb.control('', Validators.required));
    }
  }

  removeImagen(index: number): void {
    if (this.imagenesArray.length > 1) {
      this.imagenesArray.removeAt(index);
    }
  }

  toggleServicio(servicio: Servicio): void {
    const servicios = this.alojamientoForm.get('servicios')?.value || [];
    const index = servicios.indexOf(servicio);

    if (index > -1) {
      servicios.splice(index, 1);
    } else {
      servicios.push(servicio);
    }

    this.alojamientoForm.patchValue({ servicios });
  }

  isServicioSelected(servicio: Servicio): boolean {
    const servicios = this.alojamientoForm.get('servicios')?.value || [];
    return servicios.includes(servicio);
  }

  onSubmit(): void {
    if (this.alojamientoForm.invalid || !this.alojamiento) {
      Object.keys(this.alojamientoForm.controls).forEach(key => {
        const control = this.alojamientoForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.error = 'Por favor completa todos los campos requeridos correctamente';
      return;
    }

    this.isSubmitting = true;
    this.error = undefined;
    this.successMessage = undefined;

    const formData: AlojamientoRequest = this.alojamientoForm.value;

    this.alojamientoService
      .actualizar(this.alojamiento.id, formData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (alojamientoActualizado) => {
          this.alojamiento = alojamientoActualizado;
          this.isEditing = false;
          this.successMessage = 'Alojamiento actualizado exitosamente';

          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.successMessage = undefined;
          }, 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'No se pudo actualizar el alojamiento';
        }
      });
  }

  getServicioLabel(servicio: Servicio): string {
    const found = this.serviciosDisponibles.find(s => s.key === servicio);
    return found ? found.label : servicio;
  }

  getHuespedesOptions(): number[] {
    if (!this.alojamiento) return [1];
    return Array.from({ length: this.alojamiento.maxHuespedes }, (_, i) => i + 1);
  }

  calcularNoches(): number {
    const entrada = this.reservaForm.get('fechaEntrada')?.value;
    const salida = this.reservaForm.get('fechaSalida')?.value;

    if (!entrada || !salida) return 0;

    const fechaEntrada = new Date(entrada);
    const fechaSalida = new Date(salida);
    const diff = fechaSalida.getTime() - fechaEntrada.getTime();
    const noches = Math.ceil(diff / (1000 * 60 * 60 * 24));

    return noches > 0 ? noches : 0;
  }

  calcularPrecioTotal(): number {
    if (!this.alojamiento) return 0;
    const noches = this.calcularNoches();
    return noches * this.alojamiento.precioPorNoche;
  }

  onReservar(): void {
    if (this.reservaForm.invalid || !this.alojamiento) {
      Object.keys(this.reservaForm.controls).forEach(key => {
        const control = this.reservaForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.errorReserva = 'Por favor completa todos los campos';
      return;
    }

    // Validar que la fecha de salida sea después de la entrada
    const entrada = new Date(this.reservaForm.get('fechaEntrada')?.value);
    const salida = new Date(this.reservaForm.get('fechaSalida')?.value);

    if (salida <= entrada) {
      this.errorReserva = 'La fecha de salida debe ser posterior a la fecha de entrada';
      return;
    }

    this.isReservando = true;
    this.errorReserva = undefined;

    const reservaRequest: ReservaRequest = {
      alojamientoId: this.alojamiento.id,
      cantidadHuespedes: this.reservaForm.get('cantidadHuespedes')?.value,
      fechaEntrada: this.reservaForm.get('fechaEntrada')?.value,
      fechaSalida: this.reservaForm.get('fechaSalida')?.value
    };

    this.reservaService
      .crear(reservaRequest)
      .pipe(
        finalize(() => {
          this.isReservando = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (reserva) => {
          // Redirigir a la página de reservas o mostrar confirmación
          alert('¡Reserva creada exitosamente!');
          this.router.navigate(['/perfil'], { queryParams: { section: 'misReservas' } });
        },
        error: (err) => {
          this.errorReserva = err.error?.message || 'No se pudo crear la reserva. Intenta nuevamente.';
        }
      });
  }

  // Métodos para reseñas
  loadResenas(alojamientoId: number): void {
    this.isLoadingResenas = true;

    this.resenaService
      .obtenerPorAlojamiento(alojamientoId)
      .pipe(
        finalize(() => {
          this.isLoadingResenas = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (resenas) => {
          this.resenas = resenas;
        },
        error: (err) => {
          console.error('Error cargando reseñas:', err);
        }
      });
  }

  toggleFormularioResena(): void {
    this.mostrarFormularioResena = !this.mostrarFormularioResena;
    if (!this.mostrarFormularioResena) {
      this.resenaForm.reset({ calificacion: 5, comentario: '' });
      this.errorResena = undefined;
      this.successResena = undefined;
    }
  }

  get isUserAuthenticated(): boolean {
    return !!this.authService.currentUserValue;
  }

  onSubmitResena(): void {
    if (this.resenaForm.invalid || !this.alojamiento) {
      Object.keys(this.resenaForm.controls).forEach(key => {
        const control = this.resenaForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      this.errorResena = 'Por favor completa todos los campos correctamente';
      return;
    }

    this.isSubmittingResena = true;
    this.errorResena = undefined;
    this.successResena = undefined;

    const resenaRequest: ResenaRequest = {
      alojamientoId: this.alojamiento.id,
      calificacion: this.resenaForm.get('calificacion')?.value,
      comentario: this.resenaForm.get('comentario')?.value
    };

    this.resenaService
      .crear(resenaRequest)
      .pipe(
        finalize(() => {
          this.isSubmittingResena = false;
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (resena) => {
          this.successResena = '¡Reseña creada exitosamente!';
          this.resenas.unshift(resena);
          this.resenaForm.reset({ calificacion: 5, comentario: '' });
          this.mostrarFormularioResena = false;

          // Limpiar mensaje después de 3 segundos
          setTimeout(() => {
            this.successResena = undefined;
          }, 3000);

          // Recargar el alojamiento para actualizar la calificación promedio
          if (this.alojamiento) {
            this.loadAlojamiento(this.alojamiento.id);
          }
        },
        error: (err) => {
          this.errorResena = err.error?.message || 'No se pudo crear la reseña. Intenta nuevamente.';
        }
      });
  }

  getStars(calificacion: number): number[] {
    return Array(5).fill(0).map((_, i) => i < calificacion ? 1 : 0);
  }

  getTimeAgo(fecha: string): string {
    const now = new Date();
    const createdAt = new Date(fecha);
    const diffInMs = now.getTime() - createdAt.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Hoy';
    if (diffInDays === 1) return 'Ayer';
    if (diffInDays < 7) return `Hace ${diffInDays} días`;
    if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
    if (diffInDays < 365) return `Hace ${Math.floor(diffInDays / 30)} meses`;
    return `Hace ${Math.floor(diffInDays / 365)} años`;
  }
}
