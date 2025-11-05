import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { finalize } from "rxjs/operators";

import { AuthService } from "../../../../core/services/auth.service";

@Component({
  selector: "app-login-page",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginPageComponent {
  form: FormGroup;
  error?: string;
  isLoading = false;
  readonly demoUser = { username: "demo@correo.com", password: "123456" };

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      username: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required, Validators.minLength(6)]],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.value as { username: string; password: string };

    // Demo local: si son credenciales demo, no llamar backend
    if (username === this.demoUser.username && password === this.demoUser.password) {
      this.auth.mockLogin();
      this.error = undefined;
      this.router.navigate(["/"]);
      return;
    }

    // Flujo real contra backend
    this.isLoading = true;
    this.error = undefined;
    this.auth
      .login({ email: username, contrasena: password })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.error = undefined;
          this.router.navigate(["/"]);
        },
        error: (err) => {
          const message =
            err?.error?.message ?? err?.message ?? "Usuario o contrasena incorrectos. Vuelve a intentarlo.";
          this.error = message;
        },
      });
  }

  onForgotPassword(): void {
    // TODO: navegacion a recuperacion
  }

  createDemoUser(): void {
    // Setea sesion mock y precarga el formulario con las credenciales demo
    this.auth.mockLogin();
    this.form.patchValue(this.demoUser);
    // Opcional: podrias navegar automaticamente al home si quieres
    // this.router.navigate(["/"]);
  }
}
