import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../shared/buyer-footer/buyer-footer.component';

interface Origin {
  id: string;
  name: string;
  description: string;
  flagUrl: string;
}

interface Grade {
  id: string;
  name: string;
  description: string;
  class: string;
  image: string;
}

interface Category {
  id: string;
  name: string;
  route: string;
  queryParams?: { [key: string]: string };
  colorClass: string;
  image: string;
}

@Component({
  selector: 'app-buyer-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    BuyerHeaderComponent,
    BuyerFooterComponent
  ],
  templateUrl: './buyer-home.component.html',
  styleUrls: ['./buyer-home.component.css']
})
export class BuyerHomeComponent {
  
  origins: Origin[] = [
    { id: 'Iran', name: 'Persian', description: 'Deep Aroma', flagUrl: '🇮🇷' },
    { id: 'India', name: 'Kashmiri', description: 'Silk Road Heritage', flagUrl: '🇮🇳' },
    { id: 'Spain', name: 'Spanish', description: 'La Mancha Select', flagUrl: '🇪🇸' }
  ];

  grades: Grade[] = [
    { id: 'premium', name: 'Premium', description: 'Highest quality with maximum safranal content', class: 'premium', image: 'assets/images/g1.jpeg' },
    { id: 'first', name: 'Grade I', description: 'Premium Negin - Long red threads', class: 'grade-one', image: 'assets/images/g2.jpeg' },
    { id: 'second', name: 'Grade II', description: 'Pushal - Balanced culinary grade', class: 'grade-two', image: 'assets/images/g3.jpeg' },
    { id: 'third', name: 'Grade III', description: 'Budget-friendly everyday use', class: 'grade-three', image: 'assets/images/g4.jpeg' },
    { id: 'all', name: 'All Products', description: 'Browse our entire collection', class: 'all-products', image: 'assets/images/g1.jpeg' }
  ];

  categories: Category[] = [
    { 
      id: 'premium', 
      name: 'Premium Grade', 
      route: '/buyer/products',
      queryParams: { grade: 'premium' },
      colorClass: 'burgundy',
      image: 'https://images.unsplash.com/photo-1666849254544-3d03f24e821a?w=200&auto=format&fit=crop'
    },
    { 
      id: 'grade-one', 
      name: 'Grade I', 
      route: '/buyer/products',
      queryParams: { grade: 'first' },
      colorClass: 'brown',
      image: 'https://images.unsplash.com/photo-1666849254544-3d03f24e821a?w=200&auto=format&fit=crop'
    },
    { 
      id: 'grade-two', 
      name: 'Grade II', 
      route: '/buyer/products',
      queryParams: { grade: 'second' },
      colorClass: 'gold',
      image: 'https://images.unsplash.com/photo-1666849254544-3d03f24e821a?w=200&auto=format&fit=crop'
    },
    { 
      id: 'all', 
      name: 'All Products', 
      route: '/buyer/products',
      colorClass: 'cream',
      image: 'https://images.unsplash.com/photo-1666849254544-3d03f24e821a?w=200&auto=format&fit=crop'
    }
  ];
}
