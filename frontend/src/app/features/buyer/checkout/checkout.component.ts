import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { MarketplaceService } from '../../../core/services/marketplace.service';
import { 
  CartSummary,
  CartItemWithDetails,
  Address,
  OrderDetail,
  ApiResponse,
  CreateAddressRequest
} from '../../landing/models/marketplace.model';
import { LoadingSpinnerComponent, EmptyStateComponent } from '../../../shared/components';

type CheckoutStep = 'address' | 'review' | 'confirmation';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
  currentStep: CheckoutStep = 'address';
  cart: CartSummary | null = null;
  addresses: Address[] = [];
  selectedAddressId: number | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;
  orderConfirmation: OrderDetail | null = null;

  // New address form
  showAddressForm = false;
  newAddress: CreateAddressRequest = {
    type: 'shipping',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'United States',
    is_default: false
  };
  addressFormError: string | null = null;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private marketplaceService: MarketplaceService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    // Load cart and addresses in parallel
    Promise.all([
      this.loadCart(),
      this.loadAddresses()
    ]).then(() => {
      this.loading = false;
      // Auto-select default address if available
      const defaultAddress = this.addresses.find(a => a.isDefault);
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id;
      }
    }).catch(() => {
      this.loading = false;
    });
  }

  private loadCart(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cartService.getCart().subscribe({
        next: (response: ApiResponse<CartSummary>) => {
          if (response.success && response.data) {
            this.cart = response.data;
            if (this.cart.items.length === 0) {
              this.error = 'Your cart is empty';
            }
          }
          resolve();
        },
        error: (err) => {
          this.error = 'Failed to load cart';
          console.error('Error loading cart:', err);
          reject(err);
        }
      });
    });
  }

  private loadAddresses(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.marketplaceService.getAddresses().subscribe({
        next: (response: ApiResponse<Address[]>) => {
          if (response.success && response.data) {
            this.addresses = response.data.filter(a => a.type === 'shipping');
          }
          resolve();
        },
        error: (err) => {
          console.error('Error loading addresses:', err);
          resolve(); // Don't fail the whole checkout if addresses fail
        }
      });
    });
  }

  selectAddress(addressId: number): void {
    this.selectedAddressId = addressId;
  }

  toggleAddressForm(): void {
    this.showAddressForm = !this.showAddressForm;
    this.addressFormError = null;
    if (!this.showAddressForm) {
      this.resetAddressForm();
    }
  }

  private resetAddressForm(): void {
    this.newAddress = {
      type: 'shipping',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: 'United States',
      is_default: false
    };
  }

  saveAddress(): void {
    if (!this.validateAddressForm()) return;

    this.addressFormError = null;
    this.submitting = true;

    this.marketplaceService.createAddress(this.newAddress).subscribe({
      next: (response: ApiResponse<Address>) => {
        if (response.success && response.data) {
          this.addresses.push(response.data);
          this.selectedAddressId = response.data.id;
          this.showAddressForm = false;
          this.resetAddressForm();
        }
        this.submitting = false;
      },
      error: (err) => {
        this.addressFormError = 'Failed to save address. Please try again.';
        this.submitting = false;
        console.error('Error saving address:', err);
      }
    });
  }

  private validateAddressForm(): boolean {
    if (!this.newAddress.street.trim()) {
      this.addressFormError = 'Street address is required';
      return false;
    }
    if (!this.newAddress.city.trim()) {
      this.addressFormError = 'City is required';
      return false;
    }
    if (!this.newAddress.state.trim()) {
      this.addressFormError = 'State is required';
      return false;
    }
    if (!this.newAddress.zip_code.trim()) {
      this.addressFormError = 'ZIP code is required';
      return false;
    }
    if (!this.newAddress.country.trim()) {
      this.addressFormError = 'Country is required';
      return false;
    }
    return true;
  }

  proceedToReview(): void {
    if (!this.selectedAddressId) {
      this.error = 'Please select a shipping address';
      return;
    }
    this.error = null;
    this.currentStep = 'review';
  }

  backToAddress(): void {
    this.currentStep = 'address';
    this.error = null;
  }

  placeOrder(): void {
    if (!this.selectedAddressId || !this.cart) return;

    this.submitting = true;
    this.error = null;

    this.orderService.createOrder(this.selectedAddressId).subscribe({
      next: (response: ApiResponse<OrderDetail>) => {
        if (response.success && response.data) {
          this.orderConfirmation = response.data;
          this.currentStep = 'confirmation';
        }
        this.submitting = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to place order. Please try again.';
        this.submitting = false;
        console.error('Error placing order:', err);
      }
    });
  }

  getSelectedAddress(): Address | null {
    if (!this.selectedAddressId) return null;
    return this.addresses.find(a => a.id === this.selectedAddressId) || null;
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

  getShippingCost(): number {
    if (!this.cart) return 0;
    // Free shipping over $100
    return this.cart.totalPrice >= 100 ? 0 : 9.99;
  }

  getTotalWithShipping(): number {
    if (!this.cart) return 0;
    return this.cart.totalPrice + this.getShippingCost();
  }

  goToOrders(): void {
    this.router.navigate(['/buyer/orders']);
  }

  continueShopping(): void {
    this.router.navigate(['/buyer/products']);
  }
}
