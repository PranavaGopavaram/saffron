import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Redirect root to login
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  
  // Auth routes (public)
  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  
  // Buyer routes (protected)
  {
    path: 'buyer/dashboard',
    loadComponent: () => import('./features/buyer/dashboard/buyer-dashboard.component')
      .then(m => m.BuyerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['buyer', 'admin'] }
  },
  
  // Seller routes (protected)
  {
    path: 'seller/dashboard',
    loadComponent: () => import('./features/seller/dashboard/seller-dashboard.component')
      .then(m => m.SellerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['seller', 'admin'] }
  },
  
  // Admin routes (protected)
  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  
  // Landing page (public)
  {
    path: 'landing',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.LANDING_ROUTES)
  },
  
  // Fallback - redirect unknown routes to login
  { path: '**', redirectTo: '/auth/login' }
];
