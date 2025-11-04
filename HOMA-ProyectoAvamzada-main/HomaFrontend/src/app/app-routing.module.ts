import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./core/guards/auth.guard";
import { RoleGuard } from "./core/guards/role.guard";

const routes: Routes = [
  {
    path: "",
    loadChildren: () =>
      import("./features/home/home.module").then((m) => m.HomeModule),
  },
  {
    path: "auth",
    loadChildren: () =>
      import("./features/auth/auth.module").then((m) => m.AuthModule),
  },
  {
    path: "alojamientos",
    loadChildren: () =>
      import("./features/alojamientos/alojamientos.module").then(
        (m) => m.AlojamientosModule
      ),
  },
  {
    path: "reservas",
    loadChildren: () =>
      import("./features/reservas/reservas.module").then(
        (m) => m.ReservasModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: "perfil",
    loadChildren: () =>
      import("./features/perfil/perfil.module").then((m) => m.PerfilModule),
    canActivate: [AuthGuard],
  },
  {
    path: "anfitrion",
    loadChildren: () =>
      import("./features/anfitrion/anfitrion.module").then(
        (m) => m.AnfitrionModule
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ["ANFITRION", "ADMIN"] },
  },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
