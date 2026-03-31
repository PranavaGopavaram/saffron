import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
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
} from '../../../core/models/marketplace.model';
import { LoadingSpinnerComponent, EmptyStateComponent } from '../../../shared/components';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../shared/buyer-footer/buyer-footer.component';

type CheckoutStep = 'address' | 'review' | 'confirmation';

interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  freeThreshold: number | null;
  estimatedDays: string;
  icon: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    FormsModule,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    BuyerHeaderComponent,
    BuyerFooterComponent
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

  shippingMethods: ShippingMethod[] = [
    { id: 'standard', name: 'Standard Shipping', description: 'Delivery in 5-7 business days', cost: 49, freeThreshold: 500, estimatedDays: '5-7 business days', icon: '📦' },
    { id: 'express', name: 'Express Shipping', description: 'Delivery in 2-3 business days', cost: 99, freeThreshold: null, estimatedDays: '2-3 business days', icon: '🚚' },
    { id: 'overnight', name: 'Overnight Delivery', description: 'Next business day delivery', cost: 199, freeThreshold: null, estimatedDays: 'Next business day', icon: '✈️' }
  ];
  selectedShippingMethod: ShippingMethod = this.shippingMethods[0];


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
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    Promise.all([
      this.loadCart(),
      this.loadAddresses()
    ]).then(() => {
      this.loading = false;
      this.cdr.detectChanges();
      const defaultAddress = this.addresses.find(a => a.isDefault);
      if (defaultAddress) {
        this.selectedAddressId = defaultAddress.id;
      }
    }).catch(() => {
      this.loading = false;
      this.cdr.detectChanges();
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
          resolve(); 
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

    const shippingCost = this.getShippingCost();
    this.orderService.createOrder(this.selectedAddressId, shippingCost).subscribe({
      next: (response: ApiResponse<OrderDetail>) => {
        if (response.success && response.data) {
          this.router.navigate(['/buyer/orders']);
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
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  getShippingCost(): number {
    if (!this.cart || !this.selectedShippingMethod) return 0;
    if (this.selectedShippingMethod.freeThreshold && this.cart.totalPrice >= this.selectedShippingMethod.freeThreshold) {
      return 0;
    }
    return this.selectedShippingMethod.cost;
  }

  getMethodCost(method: ShippingMethod): number {
    if (!this.cart || !method.freeThreshold) return method.cost;
    if (this.cart.totalPrice >= method.freeThreshold) return 0;
    return method.cost;
  }

  selectShippingMethod(method: ShippingMethod): void {
    this.selectedShippingMethod = method;
  }

  getEstimatedDeliveryDate(): string {
    if (!this.selectedShippingMethod) return '';
    const today = new Date();
    const daysMatch = this.selectedShippingMethod.estimatedDays.match(/(\d+)-(\d+)/);
    if (daysMatch) {
      const maxDays = parseInt(daysMatch[2], 10);
      const deliveryDate = new Date(today);
      deliveryDate.setDate(today.getDate() + maxDays);
      return deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    if (this.selectedShippingMethod.estimatedDays.includes('Next')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    return this.selectedShippingMethod.estimatedDays;
  }

  getFreeShippingRemaining(): number {
    if (!this.selectedShippingMethod?.freeThreshold || !this.cart) return 0;
    const remaining = this.selectedShippingMethod.freeThreshold - this.cart.totalPrice;
    return remaining > 0 ? remaining : 0;
  }

  showFreeShippingInfo(): boolean {
    if (!this.selectedShippingMethod?.freeThreshold || !this.cart) return false;
    return this.cart.totalPrice < this.selectedShippingMethod.freeThreshold;
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
