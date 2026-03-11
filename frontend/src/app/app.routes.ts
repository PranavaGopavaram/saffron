import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  

  { 
    path: 'auth', 
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  

  {
    path: 'buyer',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['buyer', 'admin'] },
    children: [
      {
        path: 'home',
        loadComponent: () => import('./features/buyer/home/buyer-home.component')
          .then(m => m.BuyerHomeComponent)
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/buyer/dashboard/buyer-dashboard.component')
          .then(m => m.BuyerDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./features/buyer/products/product-list/product-list.component')
          .then(m => m.ProductListComponent)
      },
      {
        path: 'products/:id',
        loadComponent: () => import('./features/buyer/products/product-detail/product-detail.component')
          .then(m => m.ProductDetailComponent)
      },
      {
        path: 'cart',
        loadComponent: () => import('./features/buyer/cart/cart.component')
          .then(m => m.CartComponent)
      },
      {
        path: 'checkout',
        loadComponent: () => import('./features/buyer/checkout/checkout.component')
          .then(m => m.CheckoutComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/buyer/orders/order-list/order-list.component')
          .then(m => m.OrderListComponent)
      },
      {
        path: 'orders/:id',
        loadComponent: () => import('./features/buyer/orders/order-detail/order-detail.component')
          .then(m => m.OrderDetailComponent)
      },
      {
        path: 'addresses',
        loadComponent: () => import('./features/buyer/addresses/address-list/address-list.component')
          .then(m => m.AddressListComponent)
      },
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      }
    ]
  },
  

  {
    path: 'seller/dashboard',
    loadComponent: () => import('./features/seller/dashboard/seller-dashboard.component')
      .then(m => m.SellerDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['seller', 'admin'] }
  },
  

  {
    path: 'admin/dashboard',
    loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component')
      .then(m => m.AdminDashboardComponent),
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] }
  },
  

  {
    path: 'landing',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.LANDING_ROUTES)
  },
  
  
  { path: '**', redirectTo: '/auth/login' }
];
