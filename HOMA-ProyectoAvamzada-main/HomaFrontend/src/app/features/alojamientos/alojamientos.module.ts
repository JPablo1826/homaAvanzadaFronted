import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AlojamientosRoutingModule } from './alojamientos-routing.module';
import { AlojamientosComponent } from './alojamientos.component';
import { DetalleAlojamientoComponent } from './pages/detalle/detalle.component';


@NgModule({
  declarations: [
    AlojamientosComponent,
    DetalleAlojamientoComponent
  ],
  imports: [
    CommonModule,
    AlojamientosRoutingModule
  ]
})
export class AlojamientosModule { }
