import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  OrderDetail,
  OrderSummary,
  OrderItem,
  CreateOrderRequest,
  UpdateItemStatusRequest,
  ApiResponse
} from '../models/marketplace.model';

interface PaginatedOrders {
  data: OrderSummary[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  private transformOrderSummary(order: any): OrderSummary {
    return {
      id: order.id,
      orderNumber: order.order_number,
      totalAmount: order.total_amount,
      orderStatus: order.order_status,
      paymentStatus: order.payment_status,
      itemCount: order.item_count,
      sellerCount: order.seller_count,
      firstItemImage: order.first_item_image,
      firstItemId: order.first_item_id,
      createdAt: order.created_at
    };
  }

  constructor(private http: HttpClient) {}

  createOrder(shippingAddressId?: number, shippingCost?: number): Observable<ApiResponse<OrderDetail>> {
    const payload: CreateOrderRequest = {
      shipping_address_id: shippingAddressId,
      shipping_cost: shippingCost
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

  getMyOrders(): Observable<ApiResponse<PaginatedOrders>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/my-orders`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          // Backend returns: { data: [...], total, page, limit }
          let ordersArray: any[] = [];
          
          if (Array.isArray(response.data.data)) {
            ordersArray = response.data.data;
          } else if (Array.isArray(response.data)) {
            ordersArray = response.data;
          }
          
          const transformedOrders = ordersArray.map((order: any) => 
            this.transformOrderSummary(order)
          );
          
          return {
            success: response.success,
            message: response.message,
            data: {
              data: transformedOrders,
              total: response.data.total || transformedOrders.length,
              page: response.data.page || 1,
              limit: response.data.limit || 20
            }
          } as ApiResponse<PaginatedOrders>;
        }
        
        return response as ApiResponse<PaginatedOrders>;
      }),
      catchError(error => {
        console.error('Error fetching my orders:', error);
        return throwError(() => error);
      })
    );
  }

  getSellerOrders(): Observable<ApiResponse<PaginatedOrders>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/seller-orders`
    ).pipe(
      map(response => {
        if (response.success && response.data && response.data.data) {
          response.data.data = response.data.data.map((order: any) => 
            this.transformOrderSummary(order)
          );
        }
        return response as ApiResponse<PaginatedOrders>;
      }),
      catchError(error => {
        console.error('Error fetching seller orders:', error);
        return throwError(() => error);
      })
    );
  }

  getOrderById(orderId: number): Observable<ApiResponse<OrderDetail>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${orderId}`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          response.data = this.transformOrderDetail(response.data);
        }
        return response as ApiResponse<OrderDetail>;
      }),
      catchError(error => {
        console.error(`Error fetching order ${orderId}:`, error);
        return throwError(() => error);
      })
    );
  }

  private transformOrderDetail(data: any): OrderDetail {
    return {
      order: {
        id: data.order.id,
        buyerId: data.order.buyer_id,
        orderNumber: data.order.order_number,
        totalAmount: data.order.total_amount,
        orderStatus: data.order.order_status,
        paymentStatus: data.order.payment_status,
        shippingAddressId: data.order.shipping_address_id,
        shippingCost: data.order.shipping_cost,
        deliveryDateEstimated: data.order.delivery_date_estimated,
        createdAt: data.order.created_at,
        completedAt: data.order.completed_at,
        updatedAt: data.order.updated_at
      },
      items: data.items.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        variantId: item.variant_id,
        sellerId: item.seller_id,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        subtotal: item.subtotal,
        itemStatus: item.item_status,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        productId: item.product_id,
        productName: item.product_name,
        sku: item.sku,
        weightGrams: item.weight_grams,
        sellerName: item.seller_name,
        image: item.image
      })),
      buyer: data.buyer,
      shippingAddress: data.shipping_address
    };
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
