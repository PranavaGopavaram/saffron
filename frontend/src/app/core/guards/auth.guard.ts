import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Auth Guard to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (authService.isAuthenticated()) {
    return true;
  }
  
  // Store the attempted URL for redirecting after login
  router.navigate(['/auth/login'], {
    queryParams: { returnUrl: state.url }
  });
  
  return false;
};

/**
 * Role-based Auth Guard to protect routes based on user role
 * Usage: canActivate: [roleGuard], data: { roles: ['buyer', 'admin'] }
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  
  const requiredRoles = route.data['roles'] as string[];
  const userRole = authService.getUserRole();
  
  if (requiredRoles && userRole && requiredRoles.includes(userRole)) {
    return true;
  }
  
  // User is authenticated but doesn't have required role
  // Redirect to appropriate dashboard based on their actual role
  switch (userRole) {
    case 'buyer':
      router.navigate(['/buyer/dashboard']);
      break;
    case 'seller':
      router.navigate(['/seller/dashboard']);
      break;
    case 'admin':
      router.navigate(['/admin/dashboard']);
      break;
    default:
      router.navigate(['/auth/login']);
  }
  
  return false;
};
