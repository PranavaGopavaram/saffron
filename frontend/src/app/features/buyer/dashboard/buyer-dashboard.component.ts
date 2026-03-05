import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { User } from '../../../core/models/user.model';
import { OrderSummary } from '../../landing/models/marketplace.model';

interface OrderStats {
  total: number; pending: number; shipped: number; delivered: number;
}

@Component({
  selector: 'app-buyer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './buyer-dashboard.component.html',
  styleUrls: ['./buyer-dashboard.component.css']
})
export class BuyerDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private router = inject(Router);

  user = signal<User | null>(null);
  cartItemCount = signal(0);
  orderStats = signal<OrderStats>({ total: 0, pending: 0, shipped: 0, delivered: 0 });

  ngOnInit(): void {
    this.user.set(this.authService.getCurrentUser());
    this.loadDashboardData();
  }

  private loadDashboardData(): void {
    this.cartService.getCart().subscribe(res => 
      this.cartItemCount.set(res.success ? res.data?.items?.length || 0 : 0)
    );

    this.orderService.getMyOrders().subscribe(res => {
      if (res.success && Array.isArray(res.data)) {
        const orders = res.data;
        this.orderStats.set({
          total: orders.length,
          pending: orders.filter(o => ['pending', 'confirmed'].includes(o.orderStatus)).length,
          shipped: orders.filter(o => o.orderStatus === 'shipped').length,
          delivered: orders.filter(o => o.orderStatus === 'delivered').length
        });
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}