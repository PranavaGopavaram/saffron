import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/order.service';
import { OrderSummary, ApiResponse, OrderStatus } from '../../../landing/models/marketplace.model';
import { LoadingSpinnerComponent, EmptyStateComponent, PaginationComponent } from '../../../../shared/components';

type OrderFilter = 'all' | 'pending' | 'shipped' | 'delivered' | 'cancelled';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    LoadingSpinnerComponent,
    EmptyStateComponent,
    PaginationComponent
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

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  constructor(
    private orderService: OrderService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for status query param
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

    this.orderService.getMyOrders().subscribe({
      next: (response: ApiResponse<OrderSummary[]>) => {
        if (response.success && response.data) {
          this.orders = response.data;
          this.applyFilter();
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load orders. Please try again.';
        this.loading = false;
        console.error('Error loading orders:', err);
      }
    });
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
        if (this.activeFilter === 'pending') {
          return order.orderStatus === OrderStatus.PENDING || order.orderStatus === OrderStatus.CONFIRMED;
        }
        return order.orderStatus === this.activeFilter;
      });
    }

    // Sort by date (newest first)
    this.filteredOrders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
