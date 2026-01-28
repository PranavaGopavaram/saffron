import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { StorageService } from '../services/storage.service';

/**
 * HTTP Interceptor that automatically attaches JWT token to outgoing requests
 * and handles authentication errors (401/403)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  // Get token from storage
  const token = storageService.getToken();
  
  // Clone request and add Authorization header if token exists
  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  // Handle the request and catch authentication errors
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // If 401 or 403, clear auth data and redirect to login
      if (error.status === 401 || error.status === 403) {
        console.error('Authentication error:', error.status);
        storageService.clearAll();
        router.navigate(['/auth/login'], { 
          queryParams: { 
            returnUrl: router.url,
            sessionExpired: error.status === 401 ? 'true' : undefined
          } 
        });
      }
      
      return throwError(() => error);
    })
  );
};
