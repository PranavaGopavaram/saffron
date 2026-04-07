import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { 
  LoginRequest, 
  AuthResponse, 
  ApiResponse,
  BuyerRegistrationRequest,
  SellerRegistrationRequest,
  JWTPayload,
  User
} from '../../../core/models/auth.model';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(
    private http: HttpClient,
    private storageService: StorageService
  ) {}
  
  registerBuyer(data: BuyerRegistrationRequest): Observable<ApiResponse<AuthResponse>> {
    const payload = {
      ...data,
      shippingAddress: {
        street: data.shippingAddress.street,
        city: data.shippingAddress.city,
        state: data.shippingAddress.state,
        zip_code: data.shippingAddress.zipCode, 
        country: data.shippingAddress.country
      }
    };


    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/register`,
      payload
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storageService.saveToken(response.data.token);
          this.storageService.saveUser(response.data.user);
        }
      }),
      catchError(error => {
        console.error('❌ Buyer registration error:', error);
        return throwError(() => error);
      })
    );
  }


  registerSeller(
    data: SellerRegistrationRequest,
    files?: File[]
  ): Observable<ApiResponse<AuthResponse>> {
    const formData = new FormData();

    formData.append('fullName', data.fullName);
    formData.append('email', data.email);
    formData.append('password', data.password);
    formData.append('confirmPassword', data.confirmPassword);
    formData.append('phone', data.phone);
    formData.append('role', data.role);
    formData.append('businessName', data.businessName);
    formData.append('taxId', data.taxId);
    formData.append('saffronSource', data.saffronSource);
    
    formData.append('businessAddress[street]', data.businessAddress.street);
    formData.append('businessAddress[city]', data.businessAddress.city);
    formData.append('businessAddress[state]', data.businessAddress.state);
    formData.append('businessAddress[zip_code]', data.businessAddress.zipCode);
    formData.append('businessAddress[country]', data.businessAddress.country);
    
    // Add files if provided
    if (files && files.length > 0) {
      files.forEach(file => formData.append('certifications', file));
    }

    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/register`,
      formData  // Browser sets Content-Type automatically for FormData
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storageService.saveToken(response.data.token);
          this.storageService.saveUser(response.data.user);
        }
      }),
      catchError(error => {
        console.error('❌ Seller registration error:', error);
        return throwError(() => error);
      })
    );
  }


  login(credentials: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(
      `${environment.apiUrl}/auth/login`,
      credentials
    ).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.storageService.saveToken(response.data.token);
          this.storageService.saveUser(response.data.user);
        }
      }),
      catchError(error => {
        console.error('❌ Login error:', error);
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    console.log('User logged out');
    this.storageService.clearAll();
  }
  
  isAuthenticated(): boolean {
    const token = this.storageService.getToken();
    if (!token) {
      return false;
    }
    
    try {
      const payload = this.decodeToken(token);
      if (payload.exp) {
        const isExpired = Date.now() >= payload.exp * 1000;
        if (isExpired) {
          this.storageService.clearAll();
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('Token decode error:', error);
      this.storageService.clearAll();
      return false;
    }
  }
  
  private decodeToken(token: string): JWTPayload {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }
      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      throw new Error('Failed to decode token');
    }
  }
  

  getCurrentUser(): User | null {
    return this.storageService.getUser();
  }
  
  /**
   * Get current user role
   */
  getUserRole(): 'buyer' | 'seller' | 'admin' | null {
    const user = this.getCurrentUser();
    return user?.role || null;
  }
  
  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }
}
