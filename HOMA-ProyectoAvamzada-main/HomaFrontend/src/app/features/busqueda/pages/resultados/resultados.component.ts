import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

export interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviewCount: number;
  image: string;
  isFavorite: boolean;
  amenities: string[];
  type: string;
  beds: number;
  dates: string;
}

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.component.html',
  styleUrls: ['./resultados.component.scss']
})
export class ResultadosComponent {
  private router = inject(Router);
  showFilters = false;
  properties: Property[] = [
    {
      id: 1,
      title: 'Acogedor apartamento en el centro',
      location: 'Barcelona, España',
      price: 85,
      rating: 4.8,
      reviewCount: 128,
      isFavorite: false,
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1600&auto=format&fit=crop',
      amenities: ['Wifi', 'Cocina', 'Aire acondicionado', 'Lavadora'],
      type: 'Apartamento entero',
      beds: 2,
      dates: '15-20 nov.'
    },
    {
      id: 2,
      title: 'Moderno loft con vistas al mar',
      location: 'Valencia, España',
      price: 95,
      rating: 4.9,
      reviewCount: 76,
      isFavorite: true,
      image: 'https://images.unsplash.com/photo-1475855581690-80accde3ae2b?q=80&w=1600&auto=format&fit=crop',
      amenities: ['Wifi', 'Piscina', 'Estacionamiento gratuito', 'Terraza'],
      type: 'Loft',
      beds: 1,
      dates: '10-15 dic.'
    },
    {
      id: 3,
      title: 'Casa rural con jardín',
      location: 'Segovia, España',
      price: 120,
      rating: 4.7,
      reviewCount: 92,
      isFavorite: false,
      image: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?q=80&w=1600&auto=format&fit=crop',
      amenities: ['Cocina', 'Jardín', 'Chimenea', 'Mascotas permitidas'],
      type: 'Casa completa',
      beds: 3,
      dates: '5-12 ene.'
    },
    {
      id: 4,
      title: 'Estudio céntrico con terraza',
      location: 'Madrid, España',
      price: 65,
      rating: 4.5,
      reviewCount: 203,
      isFavorite: false,
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1600&auto=format&fit=crop',
      amenities: ['Wifi', 'Terraza', 'Aire acondicionado', 'Ascensor'],
      type: 'Estudio',
      beds: 1,
      dates: '20-25 feb.'
    }
  ];

  filteredProperties: Property[] = [];
  selectedSort = 'recomendados';
  priceRange = [0, 200];
  selectedAmenities: string[] = [];
  selectedTypes: string[] = [];

  constructor() {
    this.filteredProperties = [...this.properties];
  }

  toggleFavorite(property: Property, event: Event) {
    event.stopPropagation();
    property.isFavorite = !property.isFavorite;
  }

  applyFilters() {
    this.filteredProperties = this.properties.filter(property => {
      // Filtrar por rango de precios
      const priceInRange = property.price >= this.priceRange[0] && property.price <= this.priceRange[1];
      
      // Filtrar por comodidades seleccionadas
      const hasAmenities = this.selectedAmenities.length === 0 || 
        this.selectedAmenities.every(amenity => property.amenities.includes(amenity));
      
      // Filtrar por tipo de propiedad
      const matchesType = this.selectedTypes.length === 0 || 
        this.selectedTypes.includes(property.type);
      
      return priceInRange && hasAmenities && matchesType;
    });
    
    this.sortProperties();
    this.showFilters = false;
  }

  sortProperties() {
    switch(this.selectedSort) {
      case 'precio-asc':
        this.filteredProperties.sort((a, b) => a.price - b.price);
        break;
      case 'precio-desc':
        this.filteredProperties.sort((a, b) => b.price - a.price);
        break;
      case 'mejor-valorados':
        this.filteredProperties.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Orden por defecto (recomendados)
        break;
    }
  }

  getUniqueAmenities(): string[] {
    const amenities = new Set<string>();
    this.properties.forEach(property => {
      property.amenities.forEach(amenity => amenities.add(amenity));
    });
    return Array.from(amenities);
  }

  getUniqueTypes(): string[] {
    const types = new Set<string>();
    this.properties.forEach(property => types.add(property.type));
    return Array.from(types);
  }

  toggleAmenity(amenity: string) {
    const index = this.selectedAmenities.indexOf(amenity);
    if (index === -1) {
      this.selectedAmenities.push(amenity);
    } else {
      this.selectedAmenities.splice(index, 1);
    }
  }

  toggleType(type: string) {
    const index = this.selectedTypes.indexOf(type);
    if (index === -1) {
      this.selectedTypes.push(type);
    } else {
      this.selectedTypes.splice(index, 1);
    }
  }
}
