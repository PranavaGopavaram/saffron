import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { CartSummary, CartItemWithDetails, ApiResponse } from '../../../core/models/marketplace.model';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../shared/buyer-footer/buyer-footer.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, BuyerHeaderComponent, BuyerFooterComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cart: CartSummary | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private cartService: CartService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (response: ApiResponse<CartSummary>) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.error = 'Failed to load cart';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  get items(): CartItemWithDetails[] {
    return this.cart?.items || [];
  }

  get totalPrice(): number {
    return this.cart?.totalPrice || 0;
  }

  get totalItems(): number {
    return this.cart?.totalItems || 0;
  }

  get hasItems(): boolean {
    return this.items.length > 0;
  }

  getSellerIds(): number[] {
    if (!this.cart?.totalBySeller) return [];
    return Object.keys(this.cart.totalBySeller).map(id => parseInt(id, 10));
  }

  getSellerName(sellerId: number): string {
    return this.cart?.totalBySeller[sellerId]?.sellerName || 'Seller';
  }

  getSellerSubtotal(sellerId: number): number {
    return this.cart?.totalBySeller[sellerId]?.subtotal || 0;
  }

  getSellerItemCount(sellerId: number): number {
    return this.cart?.totalBySeller[sellerId]?.itemCount || 0;
  }

  getItemsBySeller(sellerId: number): CartItemWithDetails[] {
    return this.items.filter(item => item.sellerId === sellerId);
  }

  getProductImage(): string {
    return 'assets/images/g1.jpeg';
  }

  increaseQuantity(item: CartItemWithDetails): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItemWithDetails): void {
    if (item.quantity > 1) {
      this.updateQuantity(item, item.quantity - 1);
    }
  }

  updateQuantity(item: CartItemWithDetails, newQuantity: number): void {
    if (newQuantity < 1) return;
    
    const originalQuantity = item.quantity;
    item.quantity = newQuantity;
    this.recalculateTotals();

    this.cartService.updateItemQuantity(item.id, newQuantity).subscribe({
      next: (response: ApiResponse<CartSummary>) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        item.quantity = originalQuantity;
        this.recalculateTotals();
        this.cdr.detectChanges();
      }
    });
  }

  private recalculateTotals(): void {
    if (!this.cart) return;
    this.cart.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
    this.cart.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  removeItem(item: CartItemWithDetails): void {
    const remainingItems = this.items.filter(i => i.id !== item.id);
    this.cart = {
      items: remainingItems,
      totalItems: remainingItems.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: remainingItems.reduce((sum, i) => sum + (i.price * i.quantity), 0),
      totalBySeller: this.cart!.totalBySeller
    };
    this.cdr.detectChanges();

    this.cartService.removeItem(item.id).subscribe({
      next: (response: ApiResponse<CartSummary>) => {
        if (response.success && response.data) {
          this.cart = response.data;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cdr.detectChanges();
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.cart = {
          items: [],
          totalItems: 0,
          totalPrice: 0,
          totalBySeller: {}
        };
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.cdr.detectChanges();
      }
    });
  }

  formatPrice(price: number): string {
    return '₹' + price.toLocaleString('en-IN');
  }
}