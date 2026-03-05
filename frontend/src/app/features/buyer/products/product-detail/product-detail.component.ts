import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subject, takeUntil, finalize, forkJoin } from 'rxjs';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { ReviewService } from '../../../../core/services/review.service';
import { 
  ProductResponse, 
  ProductVariant, 
  ProductGrade,
  ProductReviewWithBuyer,
  ReviewSummary
} from '../../../landing/models/marketplace.model';
import { 
  LoadingSpinnerComponent, 
  StarRatingComponent,
  QuantityInputComponent,
  EmptyStateComponent 
} from '../../../../shared/components';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    LoadingSpinnerComponent,
    StarRatingComponent,
    QuantityInputComponent,
    EmptyStateComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: ProductResponse | null = null;
  reviews: ProductReviewWithBuyer[] = [];
  reviewSummary: ReviewSummary | null = null;
  
  selectedVariant: ProductVariant | null = null;
  quantity: number = 1;
  
  isLoading: boolean = true;
  isAddingToCart: boolean = false;
  error: string | null = null;
  addToCartSuccess: boolean = false;
  
  activeImageIndex: number = 0;
  activeTab: 'description' | 'reviews' = 'description';
  
  private destroy$ = new Subject<void>();
  private productId: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private reviewService: ReviewService
  ) {}
  
  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.productId = +params['id'];
        this.loadProductDetails();
      });
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  loadProductDetails(): void {
    this.isLoading = true;
    this.error = null;
    
    forkJoin({
      product: this.productService.getProductById(this.productId),
      reviews: this.reviewService.getProductReviews(this.productId),
      summary: this.reviewService.getProductReviewSummary(this.productId)
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isLoading = false)
    )
    .subscribe({
      next: ({ product, reviews, summary }) => {
        if (product.success && product.data) {
          this.product = product.data;
          // Select first variant by default
          if (this.product.variants.length > 0) {
            this.selectedVariant = this.product.variants[0];
          }
        }
        
        if (reviews.success && reviews.data) {
          this.reviews = reviews.data;
        }
        
        if (summary.success && summary.data) {
          this.reviewSummary = summary.data;
        }
      },
      error: (error) => {
        console.error('Error loading product:', error);
        this.error = 'Failed to load product details. Please try again.';
      }
    });
  }
  
  selectVariant(variant: ProductVariant): void {
    this.selectedVariant = variant;
    this.quantity = 1;
  }
  
  onQuantityChange(newQuantity: number): void {
    this.quantity = newQuantity;
  }
  
  addToCart(): void {
    if (!this.selectedVariant || this.isAddingToCart) return;
    
    this.isAddingToCart = true;
    this.addToCartSuccess = false;
    
    this.cartService.addItem(this.selectedVariant.id, this.quantity)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isAddingToCart = false)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.addToCartSuccess = true;
            setTimeout(() => this.addToCartSuccess = false, 3000);
          }
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
        }
      });
  }
  
  buyNow(): void {
    if (!this.selectedVariant) return;
    
    this.cartService.addItem(this.selectedVariant.id, this.quantity)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/buyer/checkout']);
          }
        },
        error: (error) => {
          console.error('Error adding to cart:', error);
        }
      });
  }
  
  setActiveImage(index: number): void {
    this.activeImageIndex = index;
  }
  
  setActiveTab(tab: 'description' | 'reviews'): void {
    this.activeTab = tab;
  }
  
  goBack(): void {
    this.router.navigate(['/buyer/products']);
  }
  
  get gradeLabel(): string {
    if (!this.product) return '';
    const labels: Record<ProductGrade, string> = {
      [ProductGrade.PREMIUM]: 'Premium Grade',
      [ProductGrade.FIRST]: 'Grade I',
      [ProductGrade.SECOND]: 'Grade II',
      [ProductGrade.THIRD]: 'Grade III'
    };
    return labels[this.product.product.grade] || this.product.product.grade;
  }
  
  get gradeClass(): string {
    if (!this.product) return '';
    return `grade-${this.product.product.grade}`;
  }
  
  get productImages(): string[] {
    if (!this.product || !this.product.product.images || this.product.product.images.length === 0) {
      return ['assets/images/saffron-placeholder.jpg'];
    }
    return this.product.product.images;
  }
  
  get maxQuantity(): number {
    return this.selectedVariant ? Math.min(this.selectedVariant.stockQuantity, 99) : 1;
  }
  
  get isOutOfStock(): boolean {
    return !this.selectedVariant || this.selectedVariant.stockQuantity === 0;
  }
  
  formatWeight(grams: number): string {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)}kg`;
    }
    return `${grams}g`;
  }
}
