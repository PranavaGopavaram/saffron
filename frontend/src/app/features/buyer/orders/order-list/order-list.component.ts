import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { OrderSummary, ApiResponse, OrderStatus } from '../../../../core/models/marketplace.model';
import { LoadingSpinnerComponent, EmptyStateComponent, PaginationComponent } from '../../../../shared/components';
import { BuyerHeaderComponent } from '../../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../../shared/buyer-footer/buyer-footer.component';

type OrderFilter = 'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSpinnerComponent,
    EmptyStateComponent,
    PaginationComponent,
    BuyerHeaderComponent,
    BuyerFooterComponent
  ],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: OrderSummary[] = [];
  filteredOrders: OrderSummary[] = [];
  loading = true;
  error: string | null = null;
  activeFilter: OrderFilter = 'all';

  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['status']) {
        this.activeFilter = params['status'] as OrderFilter;
      }
      this.loadOrders();
    });
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    this.orderService.getMyOrders().subscribe(
      (response: any) => {
        if (response.success && response.data) {
          const orders = response.data.data || [];
          this.orders = orders;
          this.applyFilter();
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      (err) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    );
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter = filter;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    if (this.activeFilter === 'all') {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => {
        const status = order.orderStatus?.toString().toLowerCase();
        if (this.activeFilter === 'pending') {
          return status === 'pending' || status === 'confirmed';
        }
        return status === this.activeFilter;
      });
    }

    this.filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
    this.cdr.detectChanges();
  }

  get paginatedOrders(): OrderSummary[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.filteredOrders.slice(start, end);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFilterCount(filter: OrderFilter): number {
    if (filter === 'all') return this.orders.length;
    if (filter === 'pending') {
      return this.orders.filter(o => 
        o.orderStatus === OrderStatus.PENDING || o.orderStatus === OrderStatus.CONFIRMED
      ).length;
    }
    return this.orders.filter(o => o.orderStatus === filter).length;
  }
}
