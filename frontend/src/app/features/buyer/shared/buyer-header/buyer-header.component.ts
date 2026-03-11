import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { CartService } from '../../../../core/services/cart.service';

@Component({
  selector: 'app-buyer-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './buyer-header.component.html',
  styleUrls: ['./buyer-header.component.css']
})
export class BuyerHeaderComponent implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private router = inject(Router);

  user = signal(this.authService.getCurrentUser());
  cartItemCount = signal(0);

  ngOnInit(): void {
    this.loadCartCount();
  }

  private loadCartCount(): void {
    this.cartService.getCart().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cartItemCount.set(res.data.totalItems);
        }
      },
      error: () => {
        this.cartItemCount.set(0);
      }
    });
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
