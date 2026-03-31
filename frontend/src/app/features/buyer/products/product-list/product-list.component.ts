import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ProductResponse, ProductGrade } from '../../../../core/models/marketplace.model';
import { ProductCardComponent } from '../../../../shared/components';
import { ProductService } from '../../../../core/services/product.service';
import { BuyerHeaderComponent } from '../../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../../shared/buyer-footer/buyer-footer.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ProductCardComponent,
    BuyerHeaderComponent,
    BuyerFooterComponent
  ],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {
  products: ProductResponse[] = [];
  isLoading: boolean = false;
  error: string | null = null;


  filters = {
    page: 1,
    limit: 12
  };

  gradeOptions = [
    { value: '', label: 'All Grades' },
    { value: ProductGrade.PREMIUM, label: 'Premium' },
    { value: ProductGrade.FIRST, label: 'Grade I' },
    { value: ProductGrade.SECOND, label: 'Grade II' }
  ];

  selectedGrade: string = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  originSearch: string = '';
  searchQuery: string = '';


  sortOptions = [
    { value: '', label: 'Default' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'best_sellers', label: 'Best Sellers' }
  ];
  selectedSort: string = '';


  totalProducts: number = 0;
  totalPages: number = 1;

  showFilters: boolean = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    console.log('ProductListComponent: ngOnInit - showFilters:', this.showFilters, 'selectedGrade:', this.selectedGrade);
    
    this.route.queryParams.subscribe(params => {
      console.log('Query params received:', params);
      if (params['grade']) {
        this.selectedGrade = params['grade'];
        console.log('Set selectedGrade from URL:', this.selectedGrade);
      }
      if (params['origin']) {
        this.originSearch = params['origin'];
        console.log('Set originSearch from URL:', this.originSearch);
      }
      this.loadProducts();
    });
  }

  loadProducts(): void {
    console.log('ProductListComponent: loadProducts called, isLoading:', this.isLoading);
    this.isLoading = true;
    this.error = null;
    this.cdr.detectChanges();

    const filters = {
      grade: (this.selectedGrade as ProductGrade) || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      origin: this.originSearch || undefined,
      search: this.searchQuery || undefined,
      sort: this.selectedSort || undefined,
      page: this.filters.page,
      limit: this.filters.limit
    };

    console.log('loadProducts - API filters:', JSON.stringify(filters));

    this.productService.getProducts(filters).subscribe({
      next: (response) => {
        console.log('ProductListComponent: API response received:', response.success, 'data:', response.data?.data?.length);
        
        if (!response.data) {
          this.error = 'Invalid response from server';
          this.isLoading = false;
          this.cdr.detectChanges();
          return;
        }
        
        this.products = response.data.data || [];
        this.totalProducts = response.data.total || 0;
        this.totalPages = Math.ceil(this.totalProducts / this.filters.limit);
        
        console.log('ProductListComponent: Setting isLoading=false, products:', this.products.length, 'totalProducts:', this.totalProducts);
        
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('ProductListComponent: After set false, isLoading:', this.isLoading);
      },
      error: (err) => {
        this.error = 'Failed to load products. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('ProductListComponent: Error loading products:', err);
      }
    });
  }

  applyFilters(): void {
    console.log('applyFilters called - selectedGrade:', this.selectedGrade, 'origin:', this.originSearch, 'minPrice:', this.minPrice, 'maxPrice:', this.maxPrice, 'sort:', this.selectedSort);
    this.filters.page = 1;
    this.loadProducts();
  }

  onGradeChange(): void {
    console.log('onGradeChange - selectedGrade:', this.selectedGrade);
    this.applyFilters();
  }

  onOriginChange(): void {
    console.log('onOriginChange - originSearch:', this.originSearch);
    this.applyFilters();
  }

  onPriceChange(): void {
    console.log('onPriceChange - minPrice:', this.minPrice, 'maxPrice:', this.maxPrice);
    this.applyFilters();
  }

  onSearch(): void {
    this.filters.page = 1;
    this.loadProducts();
  }

  onSortChange(): void {
    this.filters.page = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.selectedGrade = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.originSearch = '';
    this.searchQuery = '';
    this.selectedSort = '';
    this.filters.page = 1;
    this.loadProducts();
  }

  onPageChange(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.filters.page = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onAddToCart(product: ProductResponse): void {
    this.router.navigate(['/buyer/products', product.product.id]);
  }

  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }

  trackProductId(index: number, product: ProductResponse): number {
    return product.product.id;
  }

  get hasActiveFilters(): boolean {
    return !!(this.selectedGrade || this.minPrice || this.maxPrice || this.originSearch.trim() || this.searchQuery.trim());
  }
}
