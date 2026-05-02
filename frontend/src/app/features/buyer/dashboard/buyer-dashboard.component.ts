import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../shared/buyer-footer/buyer-footer.component';
import { OrderService } from '../../../core/services/order.service';
import { UserService, UserProfile } from '../../../core/services/user.service';
import { MarketplaceService } from '../../../core/services/marketplace.service';
import { OrderSummary, BuyerProfile } from '../../../core/models/marketplace.model';

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
}

interface SpendingSummary {
  totalSpent: number;
  last30Days: number;
  avgOrder: number;
}

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BuyerHeaderComponent, BuyerFooterComponent],
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.css']
})
export class BuyerDashboardComponent implements OnInit {
  private orderService = inject(OrderService);
  private userService = inject(UserService);
  private marketplaceService = inject(MarketplaceService);

  userProfile = signal<UserProfile | null>(null);
  buyerProfile = signal<BuyerProfile | null>(null);
  orderStats = signal<OrderStats>({ total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0 });
  recentOrders = signal<OrderSummary[]>([]);
  spending = signal<SpendingSummary>({ totalSpent: 0, last30Days: 0, avgOrder: 0 });
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  reload(): void {
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      userProfile: this.userService.getProfile(),
      buyerProfile: this.marketplaceService.getBuyerProfile(),
      orders: this.orderService.getMyOrders()
    }).subscribe({
      next: (results) => {
        // Set user profile
        if (results.userProfile.success && results.userProfile.data) {
          this.userProfile.set(results.userProfile.data);
        }

        // Set buyer profile (contains spending stats from backend)
        if (results.buyerProfile.success && results.buyerProfile.data) {
          const bp = results.buyerProfile.data;
          this.buyerProfile.set(bp);
          
          // Use backend-calculated spending stats
          this.spending.set({
            totalSpent: bp.totalSpent || 0,
            last30Days: this.calculateLast30DaysSpendingFromResponse(results.orders),
            avgOrder: bp.averageOrderValue || 0
          });
        }

        // Process orders for stats and recent orders
        if (results.orders.success && results.orders.data) {
          const ordersData = results.orders.data;
          const orders = ordersData.data || [];
          
          // Use buyerProfile.totalOrders for accurate count (excludes cancelled)
          const totalFromProfile = this.buyerProfile()?.totalOrders || ordersData.total || orders.length;
          
          // Calculate order stats by status
          this.orderStats.set({
            total: totalFromProfile,
            // Match the Orders page: "Pending" includes both pending and confirmed.
            pending: orders.filter((o: OrderSummary) =>
              o.orderStatus === 'pending' || o.orderStatus === 'confirmed'
            ).length,
            confirmed: orders.filter((o: OrderSummary) => o.orderStatus === 'confirmed').length,
            shipped: orders.filter((o: OrderSummary) => o.orderStatus === 'shipped').length,
            delivered: orders.filter((o: OrderSummary) => o.orderStatus === 'delivered').length
          });

          // Sort and get recent orders
          const sorted = [...orders].sort((a: OrderSummary, b: OrderSummary) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.recentOrders.set(sorted.slice(0, 5));

          // If buyer profile didn't have spending data, calculate from orders
          if (!this.buyerProfile()?.totalSpent) {
            const totalSpent = orders.reduce((sum: number, o: OrderSummary) => sum + Number(o.totalAmount), 0);
            const last30Days = this.calculateLast30DaysFromOrders(orders);
            this.spending.set({
              totalSpent,
              last30Days,
              avgOrder: orders.length > 0 ? totalSpent / orders.length : 0
            });
          }
        }

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.error.set('Failed to load dashboard. Please try again.');
        this.loading.set(false);
      }
    });
  }

  private calculateLast30DaysSpendingFromResponse(ordersResponse: any): number {
    if (!ordersResponse.success || !ordersResponse.data?.data) {
      return 0;
    }
    return this.calculateLast30DaysFromOrders(ordersResponse.data.data);
  }

  private calculateLast30DaysFromOrders(orders: OrderSummary[]): number {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const last30DaysOrders = orders.filter((o: OrderSummary) => {
      const d = new Date(o.createdAt);
      return d >= thirtyDaysAgo && d <= now;
    });
    return last30DaysOrders.reduce((sum: number, o: OrderSummary) => sum + Number(o.totalAmount), 0);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(price);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  getStatusClass(status: string): string {
    return 'status-' + status;
  }
}
