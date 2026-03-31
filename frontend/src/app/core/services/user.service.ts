import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/auth.model';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../models/marketplace.model';

export interface UserProfile {
  id: number;
  user_id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  company_name?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly apiUrl = `${environment.apiUrl}/user`;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<ApiResponse<UserProfile>> {
    return this.http.get<ApiResponse<UserProfile>>(
      `${this.apiUrl}/profile`
    ).pipe(
      tap(response => {
        console.log('Profile response:', response);
      }),
      catchError(error => {
        console.error('Error fetching profile:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        return throwError(() => error);
      })
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserProfile>> {
    return this.http.put<ApiResponse<UserProfile>>(
      `${this.apiUrl}/profile`,
      data
    ).pipe(
      tap(response => {
        console.log('Profile updated:', response.message);
      }),
      catchError(error => {
        console.error('Error updating profile:', error);
        return throwError(() => error);
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse<null>> {
    return this.http.put<ApiResponse<null>>(
      `${this.apiUrl}/password`,
      data
    ).pipe(
      tap(response => {
        console.log('Password changed:', response.message);
      }),
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => error);
      })
    );
  }

  getAddresses(): Observable<ApiResponse<Address[]>> {
    return this.http.get<ApiResponse<Address[]>>(
      `${environment.apiUrl}/marketplace/addresses`
    ).pipe(
      catchError(error => {
        console.error('Error fetching addresses:', error);
        return throwError(() => error);
      })
    );
  }

  createAddress(data: CreateAddressRequest): Observable<ApiResponse<Address>> {
    return this.http.post<ApiResponse<Address>>(
      `${environment.apiUrl}/marketplace/addresses`,
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

  updateAddress(addressId: number, data: UpdateAddressRequest): Observable<ApiResponse<Address>> {
    return this.http.put<ApiResponse<Address>>(
      `${environment.apiUrl}/marketplace/addresses/${addressId}`,
      data
    ).pipe(
      tap(response => {
        console.log('Address updated:', response.message);
      }),
      catchError(error => {
        console.error('Error updating address:', error);
        return throwError(() => error);
      })
    );
  }

  deleteAddress(addressId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${environment.apiUrl}/marketplace/addresses/${addressId}`
    ).pipe(
      tap(response => {
        console.log('Address deleted:', response.message);
      }),
      catchError(error => {
        console.error('Error deleting address:', error);
        return throwError(() => error);
      })
    );
  }
}