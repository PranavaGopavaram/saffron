import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  Product,
  ProductVariant,
  ProductResponse,
  CreateProductRequest,
  CreateVariantRequest,
  ProductGrade,
  ApiResponse
} from '../models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  private transformProduct(product: any): Product {
    if (!product) {
      return {} as Product;
    }
    return {
      id: product.id || product.product?.id,
      sellerId: product.sellerId || product.seller_id,
      productName: product.productName || product.product_name,
      description: product.description,
      origin: product.origin,
      grade: product.grade as ProductGrade,
      colorRating: product.colorRating || product.color_rating,
      aromaScore: product.aromaScore || product.aroma_score,
      isoCertification: product.isoCertification || Boolean(product.iso_certification),
      moistureLevel: parseFloat(product.moistureLevel || product.moisture_level) || 0,
      images: product.images,
      status: product.status,
      createdAt: product.createdAt || product.created_at,
      updatedAt: product.updatedAt || product.updated_at
    };
  }

  private transformVariant(variant: any): ProductVariant {
    if (!variant) {
      return {} as ProductVariant;
    }
    return {
      id: variant.id,
      productId: variant.productId || variant.product_id,
      sku: variant.sku,
      weightGrams: variant.weightGrams || variant.weight_grams,
      price: parseFloat(variant.price),
      packageType: variant.packageType || variant.package_type,
      stockQuantity: variant.stockQuantity || variant.stock_quantity,
      createdAt: variant.createdAt || variant.created_at,
      updatedAt: variant.updatedAt || variant.updated_at
    };
  }

  private transformSellerInfo(seller: any): any {
    if (!seller) {
      return { id: 0, businessName: '', averageRating: 0 };
    }
    return {
      id: seller.id,
      businessName: seller.businessName || seller.business_name,
      averageRating: parseFloat(seller.averageRating || seller.average_rating) || 0
    };
  }

  private transformProductResponse(response: any): ProductResponse {
    if (!response) {
      return { product: {} as Product, variants: [], sellerInfo: { id: 0, businessName: '', averageRating: 0 } };
    }
    return {
      product: this.transformProduct(response.product),
      variants: (response.variants || []).map((v: any) => this.transformVariant(v)),
      sellerInfo: this.transformSellerInfo(response.seller_info)
    };
  }

  getProducts(filters?: {
    grade?: ProductGrade;
    minPrice?: number;
    maxPrice?: number;
    origin?: string;
    search?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }): Observable<ApiResponse<{ data: ProductResponse[]; total: number; page: number; limit: number }>> {
    let params = new HttpParams();

    if (filters) {
      if (filters.grade) params = params.set('grade', filters.grade);
      if (filters.minPrice) params = params.set('min_price', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('max_price', filters.maxPrice.toString());
      if (filters.origin) params = params.set('origin', filters.origin);
      if (filters.search) params = params.set('search', filters.search);
      if (filters.sort) params = params.set('sort', filters.sort);
      if (filters.page) params = params.set('page', filters.page.toString());
      if (filters.limit) params = params.set('limit', filters.limit.toString());
    }

    return this.http.get<ApiResponse<any>>(
      this.apiUrl,
      { params }
    ).pipe(
      map(response => {
        console.log('Products API response success:', response.success);
        console.log('Products data exists:', !!response.data);
        console.log('Products data.data exists:', !!response.data?.data);
        console.log('First product keys:', response.data?.data?.[0] ? Object.keys(response.data.data[0]) : 'none');
        
        const transformed = {
          ...response,
          data: {
            ...response.data,
            data: (response.data?.data || []).map((p: any) => this.transformProductResponse(p))
          }
        };
        
        console.log('Transformed first product keys:', transformed.data?.data?.[0] ? Object.keys(transformed.data.data[0]) : 'none');
        console.log('Transformed product name:', transformed.data?.data?.[0]?.product?.productName);
        
        return transformed;
      }),
      catchError(error => {
        console.error('Error fetching products:', error);
        return throwError(() => error);
      })
    );
  }

  getProductById(id: number): Observable<ApiResponse<ProductResponse>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/${id}`
    ).pipe(
      map(response => {
        console.log('ProductById API response success:', response.success);
        console.log('ProductById data exists:', !!response.data);
        console.log('ProductById product keys:', response.data?.product ? Object.keys(response.data.product) : 'none');
        
        const transformed = {
          ...response,
          data: this.transformProductResponse(response.data)
        };
        
        console.log('Transformed productById productName:', transformed.data?.product?.productName);
        return transformed;
      }),
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
