import { Component } from '@angular/core';

@Component({
  selector: 'app-alojamientos',
  templateUrl: './alojamientos.component.html',
  styleUrls: ['./alojamientos.component.scss']
})
export class AlojamientosComponent {
  listings = [
    { id: 1, title: 'Apartamento Moderno en Malasaña', city: 'Centro de Madrid', price: 120, rating: 4.6, image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1200&auto=format&fit=crop' },
    { id: 2, title: 'Casa con Piscina y Jardín', city: 'Aravaca, Madrid', price: 250, rating: 4.8, image: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1200&auto=format&fit=crop' },
    { id: 3, title: 'Villa con Vistas', city: 'Las Rozas, Madrid', price: 380, rating: 4.9, image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop' },
    { id: 4, title: 'Loft Minimalista', city: 'Chamberí, Madrid', price: 160, rating: 4.5, image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1200&auto=format&fit=crop' },
  ];
}
