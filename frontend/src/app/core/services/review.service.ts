import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ProductReview,
  ProductReviewWithBuyer,
  SellerReview,
  SellerReviewWithBuyer,
  ReviewSummary,
  CreateProductReviewRequest,
  CreateSellerReviewRequest,
  ApiResponse
} from '../../features/landing/models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly apiUrl = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getMyReviews(): Observable<ApiResponse<ProductReviewWithBuyer[]>> {
    return this.http.get<ApiResponse<ProductReviewWithBuyer[]>>(
      `${this.apiUrl}/my`
    ).pipe(
      catchError(error => {
        console.error('Error fetching my reviews:', error);
        return throwError(() => error);
      })
    );
  }

  getProductReviews(productId: number): Observable<ApiResponse<ProductReviewWithBuyer[]>> {
    return this.http.get<ApiResponse<ProductReviewWithBuyer[]>>(
      `${this.apiUrl}/products/${productId}`
    ).pipe(
      catchError(error => {
        console.error(`Error fetching product reviews:`, error);
        return throwError(() => error);
      })
    );
  }

  getProductReviewSummary(productId: number): Observable<ApiResponse<ReviewSummary>> {
    return this.http.get<ApiResponse<ReviewSummary>>(
      `${this.apiUrl}/products/${productId}/summary`
    ).pipe(
      catchError(error => {
        console.error(`Error fetching product review summary:`, error);
        return throwError(() => error);
      })
    );
  }

  createProductReview(productId: number, data: CreateProductReviewRequest): Observable<ApiResponse<ProductReview>> {
    return this.http.post<ApiResponse<ProductReview>>(
      `${this.apiUrl}/products/${productId}`,
      data
    ).pipe(
      tap(response => {
        console.log('Product review created:', response.message);
      }),
      catchError(error => {
        console.error('Error creating product review:', error);
        return throwError(() => error);
      })
    );
  }

  updateProductReview(reviewId: number, data: Partial<CreateProductReviewRequest>): Observable<ApiResponse<ProductReview>> {
    return this.http.put<ApiResponse<ProductReview>>(
      `${this.apiUrl}/${reviewId}`,
      data
    ).pipe(
      tap(response => {
        console.log('Product review updated:', response.message);
      }),
      catchError(error => {
        console.error('Error updating product review:', error);
        return throwError(() => error);
      })
    );
  }

  deleteProductReview(reviewId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/${reviewId}`
    ).pipe(
      tap(response => {
        console.log('Product review deleted:', response.message);
      }),
      catchError(error => {
        console.error('Error deleting product review:', error);
        return throwError(() => error);
      })
    );
  }

  createSellerReview(sellerId: number, data: CreateSellerReviewRequest): Observable<ApiResponse<SellerReview>> {
    return this.http.post<ApiResponse<SellerReview>>(
      `${this.apiUrl}/sellers/${sellerId}`,
      data
    ).pipe(
      tap(response => {
        console.log('Seller review created:', response.message);
      }),
      catchError(error => {
        console.error('Error creating seller review:', error);
        return throwError(() => error);
      })
    );
  }

  getSellerReviews(sellerId: number): Observable<ApiResponse<SellerReviewWithBuyer[]>> {
    return this.http.get<ApiResponse<SellerReviewWithBuyer[]>>(
      `${this.apiUrl}/sellers/${sellerId}`
    ).pipe(
      catchError(error => {
        console.error(`Error fetching seller reviews:`, error);
        return throwError(() => error);
      })
    );
  }

  deleteSellerReview(reviewId: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(
      `${this.apiUrl}/sellers/${reviewId}`
    ).pipe(
      tap(response => {
        console.log('Seller review deleted:', response.message);
      }),
      catchError(error => {
        console.error('Error deleting seller review:', error);
        return throwError(() => error);
      })
    );
  }
}
