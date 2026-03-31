import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../shared/buyer-footer/buyer-footer.component';
import { OrderService } from '../../../core/services/order.service';
import { OrderSummary } from '../../../core/models/marketplace.model';

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  shipped: number;
  delivered: number;
}

interface SpendingSummary {
  totalSpent: number;
  thisMonth: number;
  avgOrder: number;
}

interface ApiOrder {
  id: number;
  order_number: string;
  total_amount: number;
  order_status: string;
  payment_status: string;
  item_count: number;
  seller_count: number;
  first_item_image: string | null;
  first_item_id: number | null;
  created_at: string;
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

  orderStats = signal<OrderStats>({ total: 0, pending: 0, confirmed: 0, shipped: 0, delivered: 0 });
  recentOrders = signal<OrderSummary[]>([]);
  spending = signal<SpendingSummary>({ totalSpent: 0, thisMonth: 0, avgOrder: 0 });
  loading = signal(true);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  private mapApiOrder(apiOrder: ApiOrder): OrderSummary {
    return {
      id: apiOrder.id,
      orderNumber: apiOrder.order_number,
      totalAmount: apiOrder.total_amount,
      orderStatus: apiOrder.order_status as any,
      paymentStatus: apiOrder.payment_status as any,
      itemCount: apiOrder.item_count,
      sellerCount: apiOrder.seller_count,
      firstItemImage: apiOrder.first_item_image || null,
      firstItemId: apiOrder.first_item_id || null,
      createdAt: new Date(apiOrder.created_at)
    };
  }

  private loadDashboardData(): void {
    this.orderService.getMyOrders().subscribe(
      (res) => {
        const paginatedData = res.data;
        const apiOrders = paginatedData?.data || [];
        
        if (res.success && Array.isArray(apiOrders)) {
          const orders = apiOrders.map((o: any) => this.mapApiOrder(o));
          
          this.orderStats.set({
            total: orders.length,
            pending: orders.filter(o => o.orderStatus === 'pending').length,
            confirmed: orders.filter(o => o.orderStatus === 'confirmed').length,
            shipped: orders.filter(o => o.orderStatus === 'shipped').length,
            delivered: orders.filter(o => o.orderStatus === 'delivered').length
          });

          const sorted = [...orders].sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          this.recentOrders.set(sorted.slice(0, 5));

          const totalSpent = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
          const now = new Date();
          const thisMonthOrders = orders.filter(o => {
            const d = new Date(o.createdAt);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
          });
          const thisMonth = thisMonthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);

          this.spending.set({
            totalSpent,
            thisMonth,
            avgOrder: orders.length > 0 ? totalSpent / orders.length : 0
          });
        }
        this.loading.set(false);
      },
      (err) => {
        console.error('Error loading dashboard:', err);
        this.loading.set(false);
      }
    );
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
