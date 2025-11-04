import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalle-alojamiento',
  templateUrl: './detalle.component.html',
  styleUrls: ['./detalle.component.scss']
})
export class DetalleAlojamientoComponent {
  id: string | null;
  price = 150;
  rating = 4.8;
  title = 'Acogedor Apartamento en el Corazón de la Ciudad';
  location = 'Centro Histórico, Ciudad Principal';
  images = [
    'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
  ];
  amenities = ['Wifi', 'Televisión', 'Aire acondicionado', 'Estacionamiento privado'];

  constructor(route: ActivatedRoute) {
    this.id = route.snapshot.paramMap.get('id');
  }
}
