import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { OrderService } from '../../../../core/services/order.service';
import { ProductService } from '../../../../core/services/product.service';
import { 
  OrderDetail, 
  OrderItemDetail, 
  ProductResponse, 
  ProductGrade,
  OrderStatus,
  ApiResponse 
} from '../../../../core/models/marketplace.model';
import { LoadingSpinnerComponent } from '../../../../shared/components';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { BuyerHeaderComponent } from '../../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../../shared/buyer-footer/buyer-footer.component';

@Component({
  selector: 'app-order-item-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSpinnerComponent,
    StarRatingComponent,
    BuyerHeaderComponent, 
    BuyerFooterComponent
  ],
  templateUrl: './order-item-detail.component.html',
  styleUrls: ['./order-item-detail.component.css']
})
export class OrderItemDetailComponent implements OnInit {
  orderDetail: OrderDetail | null = null;
  orderItem: OrderItemDetail | null = null;
  product: ProductResponse | null = null;
  
  orderId: number = 0;
  itemId: number = 0;
  
  loading = true;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private productService: ProductService,
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

          this.productService.getProductById(this.orderItem.productId).subscribe({
            next: (productResponse) => {
              if (productResponse.success && productResponse.data) {
                this.product = productResponse.data;
              }
              this.loading = false;
              this.cdr.detectChanges();
            },
            error: (err) => {
              console.error('Error loading product:', err);
              this.loading = false;
              this.cdr.detectChanges();
            }
          });
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

  get gradeLabel(): string {
    if (!this.product) return '';
    const labels: Record<ProductGrade, string> = {
      [ProductGrade.PREMIUM]: 'Premium',
      [ProductGrade.FIRST]: 'Grade I',
      [ProductGrade.SECOND]: 'Grade II',
      [ProductGrade.THIRD]: 'Grade III'
    };
    return labels[this.product.product.grade] || this.product.product.grade;
  }

  getProductImage(): string {
    if (this.product?.product.images?.length) {
      return this.product.product.images[0];
    }
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

  formatDate(date: Date | string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  isDelivered(): boolean {
    const status = this.orderItem?.itemStatus?.toString().toLowerCase();
    return status === 'delivered';
  }

  getDeliveredDate(): string {
    if (this.isDelivered() && this.orderItem?.updatedAt) {
      return this.formatDate(this.orderItem.updatedAt);
    }
    return '';
  }

  goBack(): void {
    this.location.back();
  }
}
