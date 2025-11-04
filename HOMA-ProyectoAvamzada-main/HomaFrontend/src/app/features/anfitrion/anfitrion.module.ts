import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AnfitrionRoutingModule } from './anfitrion-routing.module';
import { AnfitrionComponent } from './anfitrion.component';


@NgModule({
  declarations: [
    AnfitrionComponent
  ],
  imports: [
    CommonModule,
    AnfitrionRoutingModule
  ]
})
export class AnfitrionModule { }
