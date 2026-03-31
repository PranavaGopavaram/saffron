import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  BuyerProfile,
  SellerProfile,
  SellerStats,
  SellerDashboard,
  Address,
  CreateAddressRequest,
  UpdateAddressRequest,
  ApiResponse
} from '../models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {
  private readonly apiUrl = `${environment.apiUrl}/marketplace`;

  constructor(private http: HttpClient) {}

  private transformBuyerProfile(data: any): BuyerProfile {
    return {
      id: data.id,
      userId: data.user_id,
      companyName: data.company_name,
      fullName: data.full_name,
      email: data.email,
      phone: data.phone,
      totalOrders: data.total_orders || 0,
      totalSpent: data.total_spent || 0,
      averageOrderValue: data.average_order_value || 0,
      defaultShippingAddressId: data.default_shipping_address_id,
      createdAt: data.created_at
    };
  }

  getBuyerProfile(): Observable<ApiResponse<BuyerProfile>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/profile/buyer`
    ).pipe(
      map(response => {
        if (response.success && response.data) {
          return {
            ...response,
            data: this.transformBuyerProfile(response.data)
          };
        }
        return response;
      }),
      catchError(error => {
        console.error('Error fetching buyer profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateBuyerProfile(data: { companyName?: string }): Observable<ApiResponse<BuyerProfile>> {
    return this.http.put<ApiResponse<BuyerProfile>>(
      `${this.apiUrl}/profile/buyer`,
      data
    ).pipe(
      tap(response => {
        console.log('Buyer profile updated:', response.message);
      }),
      catchError(error => {
        console.error('Error updating buyer profile:', error);
        return throwError(() => error);
      })
    );
  }

  getSellerProfile(): Observable<ApiResponse<SellerProfile>> {
    return this.http.get<ApiResponse<SellerProfile>>(
      `${this.apiUrl}/profile/seller`
    ).pipe(
      catchError(error => {
        console.error('Error fetching seller profile:', error);
        return throwError(() => error);
      })
    );
  }

  updateSellerProfile(data: { businessName?: string; saffronSource?: string }): Observable<ApiResponse<SellerProfile>> {
    return this.http.put<ApiResponse<SellerProfile>>(
      `${this.apiUrl}/profile/seller`,
      data
    ).pipe(
      tap(response => {
        console.log('Seller profile updated:', response.message);
      }),
      catchError(error => {
        console.error('Error updating seller profile:', error);
        return throwError(() => error);
      })
    );
  }

  getSellerStats(): Observable<ApiResponse<SellerStats>> {
    return this.http.get<ApiResponse<SellerStats>>(
      `${this.apiUrl}/profile/seller/stats`
    ).pipe(
      catchError(error => {
        console.error('Error fetching seller stats:', error);
        return throwError(() => error);
      })
    );
  }

  getSellerDashboard(): Observable<ApiResponse<SellerDashboard>> {
    return this.http.get<ApiResponse<SellerDashboard>>(
      `${this.apiUrl}/profile/seller/dashboard`
    ).pipe(
      catchError(error => {
        console.error('Error fetching seller dashboard:', error);
        return throwError(() => error);
      })
    );
  }

  getAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(
      `${this.apiUrl}/addresses`
    ).pipe(
      catchError(error => {
        console.error('Error fetching addresses:', error);
        return throwError(() => error);
      })
    );
  }

  createAddress(data: CreateAddressRequest): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(
      `${this.apiUrl}/addresses`,
      data
    ).pipe(
      tap(response => {
        console.log('Address created:', response.message);
      }),
      catchError(error => {
        console.error('Error creating address:', error);
        return throwError(() => error);
      })
    );
  }

  getAddressById(id: number): Observable<ApiResponse<Address>> {
    return this.http.get<ApiResponse<Address>>(
      `${this.apiUrl}/addresses/${id}`
    ).pipe(
      catchError(error => {
        console.error(`Error fetching address ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  updateAddress(id: number, data: UpdateAddressRequest): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(
      `${this.apiUrl}/addresses/${id}`,
      data
    ).pipe(
      tap(response => {
        console.log('Address updated:', response.message);
      }),
      catchError(error => {
        console.error(`Error updating address ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteAddress(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/addresses/${id}`
    ).pipe(
      tap(response => {
        console.log('Address deleted:', response.message);
      }),
      catchError(error => {
        console.error(`Error deleting address ${id}:`, error);
        return throwError(() => error);
      })
    );
  }
}
