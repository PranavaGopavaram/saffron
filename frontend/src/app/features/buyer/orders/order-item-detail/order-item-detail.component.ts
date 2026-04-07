import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { OrderDetail, OrderItemDetail, OrderStatus, ApiResponse } from '../../../../core/models/marketplace.model';
import { LoadingSpinnerComponent } from '../../../../shared/components';
import { BuyerHeaderComponent } from '../../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../../shared/buyer-footer/buyer-footer.component';

@Component({
  selector: 'app-order-item-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSpinnerComponent,
    BuyerHeaderComponent,
    BuyerFooterComponent
  ],
  templateUrl: './order-item-detail.component.html',
  styleUrls: ['./order-item-detail.component.css']
})
export class OrderItemDetailComponent implements OnInit {
  orderDetail: OrderDetail | null = null;
  orderItem: OrderItemDetail | null = null;
  
  orderId: number = 0;
  itemId: number = 0;
  
  loading = true;
  error: string | null = null;

  showCancelModal = false;
  cancelling = false;
  cancelError: string | null = null;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orderId = parseInt(params['orderId'], 10);
      this.itemId = parseInt(params['itemId'], 10);
      
      if (this.orderId && this.itemId) {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (response: ApiResponse<OrderDetail>) => {
        if (response.success && response.data) {
          this.orderDetail = response.data;
          this.orderItem = response.data.items.find(item => item.id === this.itemId) || null;
          
          if (!this.orderItem) {
            this.error = 'Order item not found';
            this.loading = false;
            this.cdr.detectChanges();
            return;
          }
          this.loading = false;
          this.cdr.detectChanges();
        } else {
          this.error = 'Failed to load order details';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = 'Failed to load order details. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
        console.error('Error loading order:', err);
      }
    });
  }

  openCancelModal(): void {
    this.showCancelModal = true;
    this.cancelError = null;
  }

  closeCancelModal(): void {
    if (!this.cancelling) {
      this.showCancelModal = false;
      this.cancelError = null;
    }
  }

  confirmCancel(): void {
    if (!this.orderItem || this.cancelling) return;
    
    this.cancelling = true;
    this.cancelError = null;

    this.orderService.cancelItem(this.orderId, this.itemId).subscribe({
      next: (response: ApiResponse<OrderItemDetail>) => {
        if (response.success) {
          this.showCancelModal = false;
          this.loadData();
        } else {
          this.cancelError = response.message || 'Failed to cancel item';
        }
        this.cancelling = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cancelError = 'Failed to cancel item. Please try again.';
        this.cancelling = false;
        this.cdr.detectChanges();
        console.error('Error cancelling item:', err);
      }
    });
  }

  getStatusClass(status: OrderStatus | string): string {
    const statusStr = status?.toString().toLowerCase();
    switch (statusStr) {
      case 'pending':
        return 'status-pending';
      case 'confirmed':
        return 'status-confirmed';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }


  getStatusLabel(status: OrderStatus | string): string {
    const statusStr = status?.toString().toLowerCase();
    switch (statusStr) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'shipped':
        return 'Shipped';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status?.toString() || '';
    }
  }

  getProductImage(): string {
    if (this.orderItem?.image) {
      return this.orderItem.image;
    }
    return 'assets/images/saffron-placeholder.jpg';
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  formatShortDate(date: Date | string | undefined): string {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  canCancel(): boolean {
    const status = this.orderItem?.itemStatus?.toString().toLowerCase();
    return status === 'pending' || status === 'confirmed';
  }

  goBack(): void {
    this.location.back();
  }
}