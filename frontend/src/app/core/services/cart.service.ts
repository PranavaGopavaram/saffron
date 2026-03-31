import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  CartSummary,
  AddToCartRequest,
  UpdateCartRequest,
  ApiResponse,
  CartItemWithDetails
} from '../models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {}

  private transformCartItem(item: any): CartItemWithDetails {
    if (!item) {
      return {} as CartItemWithDetails;
    }
    return {
      id: item.id,
      userId: item.user_id,
      variantId: item.variant_id,
      quantity: item.quantity,
      addedAt: item.added_at,
      updatedAt: item.updated_at,
      productId: item.product_id,
      productName: item.product_name,
      sku: item.sku,
      weightGrams: item.weight_grams,
      price: parseFloat(item.price),
      currency: item.currency,
      stockQuantity: item.stock_quantity,
      sellerId: item.seller_id,
      sellerName: item.seller_name
    };
  }

  private transformCartSummary(data: any): CartSummary {
    if (!data) {
      return { items: [], totalItems: 0, totalPrice: 0, totalBySeller: {} };
    }
    const transformedBySeller: { [key: number]: { sellerName: string; subtotal: number; itemCount: number } } = {};
    
    for (const key of Object.keys(data.total_by_seller || {})) {
      const sellerData = data.total_by_seller[key];
      transformedBySeller[parseInt(key)] = {
        sellerName: sellerData.seller_name,
        subtotal: sellerData.subtotal,
        itemCount: sellerData.item_count
      };
    }

    return {
      items: (data.items || []).map((item: any) => this.transformCartItem(item)),
      totalItems: data.total_items || 0,
      totalPrice: data.total_price || 0,
      totalBySeller: transformedBySeller
    };
  }

  getCart(): Observable<ApiResponse<CartSummary>> {
    console.log('CartService: Calling API...');
    return this.http.get<ApiResponse<any>>(
      this.apiUrl
    ).pipe(
      tap(response => {
        console.log('CartService: Raw response:', response);
      }),
      map(response => {
        const transformed = {
          ...response,
          data: this.transformCartSummary(response.data)
        };
        console.log('CartService: Transformed data:', transformed.data);
        return transformed;
      }),
      catchError(error => {
        console.error('CartService: Error fetching cart:', error);
        return throwError(() => error);
      })
    );
  }

  addItem(variantId: number, quantity: number): Observable<ApiResponse<CartSummary>> {
    const payload: AddToCartRequest = {
      variant_id: variantId,
      quantity: quantity
    };

    return this.http.post<ApiResponse<any>>(
      this.apiUrl,
      payload
    ).pipe(
      map(response => ({
        ...response,
        data: this.transformCartSummary(response.data)
      })),
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

    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/${cartItemId}`,
      payload
    ).pipe(
      map(response => ({
        ...response,
        data: this.transformCartSummary(response.data)
      })),
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
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/${cartItemId}`
    ).pipe(
      tap(response => {
        console.log('Item removed from cart:', response.message);
      }),
      switchMap(() => this.http.get<ApiResponse<any>>(this.apiUrl)),
      map(response => ({
        ...response,
        data: this.transformCartSummary(response.data)
      })),
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
