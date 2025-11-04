import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPageComponent {
  form: FormGroup;
  error?: string;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      const { username, password } = this.form.value as { username: string; password: string };

      // Demo local: si son las credenciales demo, no llamar backend
      if (username === 'demo@correo.com' && password === '123456') {
        this.auth.mockLogin();
        this.error = undefined;
        this.router.navigate(['/']);
        return;
      }

      // Flujo real (backend)
      this.auth.login({ email: username, password }).subscribe({
        next: () => {
          this.error = undefined;
          this.router.navigate(['/']);
        },
        error: () => this.error = 'Usuario o contraseña incorrectos'
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  onForgotPassword() {
    // TODO: navegación a recuperación
  }

  createDemoUser() {
    // setea sesión mock y precarga el formulario con las credenciales demo
    this.auth.mockLogin();
    this.form.patchValue({ username: 'demo@correo.com', password: '123456' });
    // Opcional: podrías navegar automáticamente al home si quieres
    // this.router.navigate(['/']);
  }
}
