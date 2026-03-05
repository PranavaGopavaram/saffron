import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductResponse, ProductGrade } from '../../../features/landing/models/marketplace.model';
import { StarRatingComponent } from '../star-rating/star-rating.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, StarRatingComponent],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.css']
})
export class ProductCardComponent {
  @Input() product!: ProductResponse;
  @Input() showAddToCart: boolean = true;
  @Output() addToCart = new EventEmitter<ProductResponse>();

  get lowestPrice(): number {
    if (!this.product.variants || this.product.variants.length === 0) {
      return 0;
    }
    return Math.min(...this.product.variants.map(v => v.price));
  }

  get highestPrice(): number {
    if (!this.product.variants || this.product.variants.length === 0) {
      return 0;
    }
    return Math.max(...this.product.variants.map(v => v.price));
  }

  get priceRange(): string {
    if (this.lowestPrice === this.highestPrice) {
      return `$${this.lowestPrice.toFixed(2)}`;
    }
    return `$${this.lowestPrice.toFixed(2)} - $${this.highestPrice.toFixed(2)}`;
  }

  get gradeLabel(): string {
    const labels: Record<ProductGrade, string> = {
      [ProductGrade.PREMIUM]: 'Premium',
      [ProductGrade.FIRST]: 'Grade I',
      [ProductGrade.SECOND]: 'Grade II',
      [ProductGrade.THIRD]: 'Grade III'
    };
    return labels[this.product.product.grade] || this.product.product.grade;
  }

  get gradeClass(): string {
    return `grade-${this.product.product.grade}`;
  }

  get productImage(): string {
    if (this.product.product.images && this.product.product.images.length > 0) {
      return this.product.product.images[0];
    }
    return 'assets/images/saffron-placeholder.jpg';
  }

  onAddToCart(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.addToCart.emit(this.product);
  }
}
