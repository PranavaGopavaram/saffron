import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ProductResponse, ProductGrade } from '../../../landing/models/marketplace.model';
import { 
  LoadingSpinnerComponent, 
  ProductCardComponent, 
  EmptyStateComponent, 
  PaginationComponent 
} from '../../../../shared/components';

interface ProductFilters {
  grade?: ProductGrade;
  minPrice?: number;
  maxPrice?: number;
  origin?: string;
  page: number;
  limit: number;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    ProductCardComponent,
    EmptyStateComponent,
    PaginationComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: ProductResponse[] = [];
  isLoading: boolean = true;
  error: string | null = null;
  
  // Filter state
  filters: ProductFilters = {
    page: 1,
    limit: 12
  };
  
  // Filter options
  gradeOptions = [
    { value: '', label: 'All Grades' },
    { value: ProductGrade.PREMIUM, label: 'Premium' },
    { value: ProductGrade.FIRST, label: 'Grade I' },
    { value: ProductGrade.SECOND, label: 'Grade II' },
    { value: ProductGrade.THIRD, label: 'Grade III' }
  ];
  
  selectedGrade: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  originSearch: string = '';
  
  // Pagination
  totalProducts: number = 0;
  
  // Sidebar state
  showFilters: boolean = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    this.loadProducts();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    const filters: ProductFilters = {
      page: this.filters.page,
      limit: this.filters.limit
    };
    
    if (this.selectedGrade) {
      filters.grade = this.selectedGrade as ProductGrade;
    }
    if (this.minPrice) {
      filters.minPrice = this.minPrice;
    }
    if (this.maxPrice) {
      filters.maxPrice = this.maxPrice;
    }
    if (this.originSearch.trim()) {
      filters.origin = this.originSearch.trim();
    }
    
    this.productService.getProducts(filters)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isLoading = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.products = response.data;
            // Note: Backend should ideally return total count for pagination
            // For now, we'll estimate based on returned data
            this.totalProducts = response.data.length < this.filters.limit 
              ? (this.filters.page - 1) * this.filters.limit + response.data.length
              : this.filters.page * this.filters.limit + 1;
          } else {
            this.products = [];
            this.totalProducts = 0;
          }
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.error = 'Failed to load products. Please try again.';
          this.products = [];
        }
      });
  }
  
  applyFilters(): void {
    this.filters.page = 1;
    this.loadProducts();
    this.showFilters = false;
  }
  
  clearFilters(): void {
    this.selectedGrade = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.originSearch = '';
    this.filters.page = 1;
    this.loadProducts();
  }
  
  onPageChange(page: number): void {
    this.filters.page = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  onAddToCart(product: ProductResponse): void {
    // If product has only one variant, add it directly
    // Otherwise navigate to product detail for variant selection
    if (product.variants.length === 1) {
      const variant = product.variants[0];
      this.cartService.addItem(variant.id, 1)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              // Show success feedback (could add a toast service later)
              console.log('Added to cart:', product.product.productName);
            }
          },
          error: (error) => {
            console.error('Error adding to cart:', error);
          }
        });
    } else {
      // Navigate to product detail for variant selection
      this.router.navigate(['/buyer/products', product.product.id]);
    }
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  get hasActiveFilters(): boolean {
    return !!(this.selectedGrade || this.minPrice || this.maxPrice || this.originSearch.trim());
  }
}
