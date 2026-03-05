import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  Product,
  ProductVariant,
  ProductResponse,
  CreateProductRequest,
  CreateVariantRequest,
  ProductGrade,
  ApiResponse
} from '../../features/landing/models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(filters?: {
    grade?: ProductGrade;
    minPrice?: number;
    maxPrice?: number;
    origin?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<ProductResponse[]>> {
    let params = new HttpParams();
    
    if (filters) {
      if (filters.grade) params = params.set('grade', filters.grade);
      if (filters.minPrice) params = params.set('min_price', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('max_price', filters.maxPrice.toString());
      if (filters.origin) params = params.set('origin', filters.origin);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ApiResponse<ProductResponse[]>>(
      this.apiUrl,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  getProductById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<ProductResponse>>(
      `${this.apiUrl}/${id}`
    ).pipe(
      catchError(error => {
        console.error(`Error fetching product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  createProduct(data: CreateProductRequest): Observable<ApiResponse<ProductResponse>> {
    return this.http.post<ApiResponse<ProductResponse>>(
      this.apiUrl,
      data
    ).pipe(
      tap(response => {
        console.log('Product created:', response.message);
      }),
      catchError(error => {
        console.error('Error creating product:', error);
        return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, data: Partial<CreateProductRequest>): Observable<ApiResponse<ProductResponse>> {
    return this.http.put<ApiResponse<ProductResponse>>(
      `${this.apiUrl}/${id}`,
      data
    ).pipe(
      tap(response => {
        console.log('Product updated:', response.message);
      }),
      catchError(error => {
        console.error(`Error updating product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteProduct(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${id}`
    ).pipe(
      tap(response => {
        console.log('Product deleted:', response.message);
      }),
      catchError(error => {
        console.error(`Error deleting product ${id}:`, error);
        return throwError(() => error);
      })
    );
  }

  addVariant(productId: number, data: CreateVariantRequest): Observable<ApiResponse<ProductVariant>> {
    return this.http.post<ApiResponse<ProductVariant>>(
      `${this.apiUrl}/${productId}/variants`,
      data
    ).pipe(
      tap(response => {
        console.log('Variant added:', response.message);
      }),
      catchError(error => {
        console.error(`Error adding variant to product ${productId}:`, error);
        return throwError(() => error);
      })
    );
  }
}
