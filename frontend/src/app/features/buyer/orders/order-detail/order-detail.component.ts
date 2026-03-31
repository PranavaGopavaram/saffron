import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { OrderDetail, OrderItemDetail, OrderStatus, ApiResponse } from '../../../../core/models/marketplace.model';
import { LoadingSpinnerComponent } from '../../../../shared/components';
import { BuyerHeaderComponent } from '../../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../../shared/buyer-footer/buyer-footer.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LoadingSpinnerComponent, BuyerHeaderComponent, BuyerFooterComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css']
})
export class OrderDetailComponent implements OnInit {
  orderDetail: OrderDetail | null = null;
  loading = true;
  error: string | null = null;
  cancelling = false;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const orderId = parseInt(params['id'], 10);
      if (orderId) {
        this.loadOrder(orderId);
      }
    });
  }

  loadOrder(orderId: number): void {
    this.loading = true;
    this.error = null;

    this.orderService.getOrderById(orderId).subscribe({
      next: (response: ApiResponse<OrderDetail>) => {
        if (response.success && response.data) {
          this.orderDetail = response.data;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load order details. Please try again.';
        this.loading = false;
        console.error('Error loading order:', err);
      }
    });
  }

  cancelOrder(): void {
    if (!this.orderDetail || this.cancelling) return;
    if (!confirm('Are you sure you want to cancel this order?')) return;

    this.cancelling = true;

    this.orderService.cancelOrder(this.orderDetail.order.id).subscribe({
      next: (response: ApiResponse<OrderDetail>) => {
        if (response.success && response.data) {
          this.orderDetail = response.data;
        }
        this.cancelling = false;
      },
      error: (err) => {
        alert('Failed to cancel order. Please try again.');
        this.cancelling = false;
        console.error('Error cancelling order:', err);
      }
    });
  }

  canCancel(): boolean {
    if (!this.orderDetail) return false;
    const status = this.orderDetail.order.orderStatus;
    return status === OrderStatus.PENDING || (status as string) === 'pending';
  }

  getStatusClass(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.PENDING:
      case 'pending':
        return 'status-pending';
      case OrderStatus.CONFIRMED:
      case 'confirmed':
        return 'status-confirmed';
      case OrderStatus.SHIPPED:
      case 'shipped':
        return 'status-shipped';
      case OrderStatus.DELIVERED:
      case 'delivered':
        return 'status-delivered';
      case OrderStatus.CANCELLED:
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  }

  getStatusLabel(status: OrderStatus | string): string {
    switch (status) {
      case OrderStatus.PENDING:
      case 'pending':
        return 'Pending';
      case OrderStatus.CONFIRMED:
      case 'confirmed':
        return 'Confirmed';
      case OrderStatus.SHIPPED:
      case 'shipped':
        return 'Shipped';
      case OrderStatus.DELIVERED:
      case 'delivered':
        return 'Delivered';
      case OrderStatus.CANCELLED:
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'payment-completed';
      case 'pending':
        return 'payment-pending';
      case 'failed':
        return 'payment-failed';
      default:
        return '';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatShortDate(date: Date | string | undefined): string {
    if (!date) return 'TBD';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getItemsBySeller(): Map<number, { sellerName: string; items: OrderItemDetail[] }> {
    const grouped = new Map<number, { sellerName: string; items: OrderItemDetail[] }>();
    
    if (!this.orderDetail?.items) return grouped;

    for (const item of this.orderDetail.items) {
      if (!grouped.has(item.sellerId)) {
        grouped.set(item.sellerId, {
          sellerName: item.sellerName,
          items: []
        });
      }
      grouped.get(item.sellerId)!.items.push(item);
    }

    return grouped;
  }

  getSubtotal(): number {
    if (!this.orderDetail) return 0;
    return this.orderDetail.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  viewItemDetail(item: OrderItemDetail): void {
    if (this.orderDetail?.order?.id && item.id) {
      this.router.navigate(['/buyer/orders', this.orderDetail.order.id, 'items', item.id]);
    }
  }

  goBack(): void {
    this.location.back();
  }
}
