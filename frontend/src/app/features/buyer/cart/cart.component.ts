import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { 
  CartSummary, 
  CartItemWithDetails,
  ApiResponse 
} from '../../landing/models/marketplace.model';
import { LoadingSpinnerComponent, QuantityInputComponent, EmptyStateComponent } from '../../../shared/components';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSpinnerComponent, 
    QuantityInputComponent,
    EmptyStateComponent
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: CartSummary | null = null;
  loading = true;
  updating: { [key: number]: boolean } = {};
  error: string | null = null;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.error = null;

    this.cartService.getCart().subscribe({
      next: (response: ApiResponse<CartSummary>) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load cart. Please try again.';
        this.loading = false;
        console.error('Error loading cart:', err);
      }
    });
  }

  updateQuantity(item: CartItemWithDetails, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > item.stockQuantity) return;
    if (this.updating[item.id]) return;

    this.updating[item.id] = true;

    this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
      next: (response: ApiResponse<CartSummary>) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.updating[item.id] = false;
      },
      error: (err) => {
        console.error('Error updating quantity:', err);
        this.updating[item.id] = false;
      }
    });
  }

  removeItem(item: CartItemWithDetails): void {
    if (this.updating[item.id]) return;

    this.updating[item.id] = true;

    this.cartService.removeItem(item.id).subscribe({
      next: (response: ApiResponse<CartSummary>) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.updating[item.id] = false;
      },
      error: (err) => {
        console.error('Error removing item:', err);
        this.updating[item.id] = false;
      }
    });
  }

  clearCart(): void {
    if (!this.cart || this.cart.items.length === 0) return;

    if (!confirm('Are you sure you want to clear your cart?')) return;

    this.loading = true;

    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          totalBySeller: {}
        };
        this.loading = false;
      },
      error: (err) => {
        console.error('Error clearing cart:', err);
        this.loading = false;
      }
    });
  }

  proceedToCheckout(): void {
    if (!this.cart || this.cart.items.length === 0) return;
    this.router.navigate(['/buyer/checkout']);
  }

  getSellerIds(): number[] {
    if (!this.cart?.totalBySeller) return [];
    return Object.keys(this.cart.totalBySeller).map(id => parseInt(id, 10));
  }

  getItemsBySeller(sellerId: number): CartItemWithDetails[] {
    if (!this.cart?.items) return [];
    return this.cart.items.filter(item => item.sellerId === sellerId);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getItemSubtotal(item: CartItemWithDetails): number {
    return item.price * item.quantity;
  }

  isCartEmpty(): boolean {
    return !this.cart || this.cart.items.length === 0;
  }
}
