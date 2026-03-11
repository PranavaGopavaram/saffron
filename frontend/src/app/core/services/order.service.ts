import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  OrderDetail,
  OrderSummary,
  OrderItem,
  CreateOrderRequest,
  UpdateItemStatusRequest,
  ApiResponse
} from '../models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(shippingAddressId?: number): Observable<ApiResponse<OrderDetail>> {
    const payload: CreateOrderRequest = {
      shipping_address_id: shippingAddressId
    };

    return this.http.post<ApiResponse<OrderDetail>>(
      this.apiUrl,
      payload
    ).pipe(
      tap(response => {
        console.log('Order created:', response.message);
      }),
      catchError(error => {
        console.error('Error creating order:', error);
        return throwError(() => error);
      })
    );
  }

  getMyOrders(): Observable<ApiResponse<OrderSummary[]>> {
    return this.http.get<ApiResponse<OrderSummary[]>>(
      `${this.apiUrl}/my-orders`
    ).pipe(
      catchError(error => {
        console.error('Error fetching my orders:', error);
        return throwError(() => error);
      })
    );
  }

  getSellerOrders(): Observable<ApiResponse<OrderSummary[]>> {
    return this.http.get<ApiResponse<OrderSummary[]>>(
      `${this.apiUrl}/seller-orders`
    ).pipe(
      catchError(error => {
        console.error('Error fetching seller orders:', error);
        return throwError(() => error);
      })
    );
  }

  getOrderById(orderId: number): Observable<ApiResponse<OrderDetail>> {
    return this.http.get<ApiResponse<OrderDetail>>(
      `${this.apiUrl}/${orderId}`
    ).pipe(
      catchError(error => {
        console.error(`Error fetching order ${orderId}:`, error);
        return throwError(() => error);
      })
    );
  }

  cancelOrder(orderId: number): Observable<ApiResponse<OrderDetail>> {
    return this.http.patch<ApiResponse<OrderDetail>>(
      `${this.apiUrl}/${orderId}/cancel`,
      {}
    ).pipe(
      tap(response => {
        console.log('Order cancelled:', response.message);
      }),
      catchError(error => {
        console.error(`Error cancelling order ${orderId}:`, error);
        return throwError(() => error);
      })
    );
  }

  updateItemStatus(
    orderId: number, 
    itemId: number, 
    status: 'confirmed' | 'shipped' | 'delivered'
  ): Observable<ApiResponse<OrderItem>> {
    const payload: UpdateItemStatusRequest = { item_status: status };

    return this.http.patch<ApiResponse<OrderItem>>(
      `${this.apiUrl}/${orderId}/items/${itemId}/status`,
      payload
    ).pipe(
      tap(response => {
        console.log('Item status updated:', response.message);
      }),
      catchError(error => {
        console.error(`Error updating item status:`, error);
        return throwError(() => error);
      })
    );
  }
}
