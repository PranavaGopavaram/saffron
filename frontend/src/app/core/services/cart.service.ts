import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  CartSummary,
  AddToCartRequest,
  UpdateCartRequest,
  ApiResponse
} from '../../features/landing/models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  getCart(): Observable<ApiResponse<CartSummary>> {
    return this.http.get<ApiResponse<CartSummary>>(
      this.apiUrl
    ).pipe(
      catchError(error => {
        console.error('Error fetching cart:', error);
        return throwError(() => error);
      })
    );
  }

  addItem(variantId: number, quantity: number): Observable<ApiResponse<CartSummary>> {
    const payload: AddToCartRequest = {
      variant_id: variantId,
      quantity: quantity
    };

    return this.http.post<ApiResponse<CartSummary>>(
      this.apiUrl,
      payload
    ).pipe(
      tap(response => {
        console.log('Item added to cart:', response.message);
      }),
      catchError(error => {
        console.error('Error adding item to cart:', error);
        return throwError(() => error);
      })
    );
  }

  updateItemQuantity(cartItemId: number, quantity: number): Observable<ApiResponse<CartSummary>> {
    const payload: UpdateCartRequest = { quantity };

    return this.http.put<ApiResponse<CartSummary>>(
      `${this.apiUrl}/${cartItemId}`,
      payload
    ).pipe(
      tap(response => {
        console.log('Cart item updated:', response.message);
      }),
      catchError(error => {
        console.error('Error updating cart item:', error);
        return throwError(() => error);
      })
    );
  }

  removeItem(cartItemId: number): Observable<ApiResponse<CartSummary>> {
    return this.http.delete<ApiResponse<CartSummary>>(
      `${this.apiUrl}/${cartItemId}`
    ).pipe(
      tap(response => {
        console.log('Item removed from cart:', response.message);
      }),
      catchError(error => {
        console.error('Error removing cart item:', error);
        return throwError(() => error);
      })
    );
  }

  clearCart(): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      this.apiUrl
    ).pipe(
      tap(response => {
        console.log('Cart cleared:', response.message);
      }),
      catchError(error => {
        console.error('Error clearing cart:', error);
        return throwError(() => error);
      })
    );
  }

  cleanupStaleItems(): Observable<ApiResponse<{ removedCount: number }>> {
    return this.http.post<ApiResponse<{ removedCount: number }>>(
      `${this.apiUrl}/cleanup`,
      {}
    ).pipe(
      tap(response => {
        console.log('Stale items cleaned up:', response.message);
      }),
      catchError(error => {
        console.error('Error cleaning up stale items:', error);
        return throwError(() => error);
      })
    );
  }
}
