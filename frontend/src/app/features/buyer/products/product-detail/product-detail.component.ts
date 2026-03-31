import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductResponse, ProductGrade } from '../../../../core/models/marketplace.model';
import { ProductService } from '../../../../core/services/product.service';
import { CartService } from '../../../../core/services/cart.service';
import { QuantityInputComponent } from '../../../../shared/components/quantity-input/quantity-input.component';
import { StarRatingComponent } from '../../../../shared/components/star-rating/star-rating.component';
import { BuyerHeaderComponent } from '../../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../../shared/buyer-footer/buyer-footer.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    QuantityInputComponent,
    StarRatingComponent,
    BuyerHeaderComponent,
    BuyerFooterComponent
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: ProductResponse | undefined = undefined;
  isLoading: boolean = false;
  error: string | null = null;

  selectedVariantId: number | null = null;
  quantity: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    }
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.error = null;
    console.log('loadProduct called, id:', id);

    this.productService.getProductById(id).subscribe({
      next: (response) => {
        console.log('Product loaded, response.data:', response.data);
        console.log('Product name:', response.data?.product?.productName);
        this.product = response.data;
        console.log('this.product set:', this.product);
        if (this.product?.variants?.length) {
          this.selectedVariantId = this.product.variants[0].id;
        }
        this.isLoading = false;
        this.cdr.detectChanges();
        console.log('isLoading set to false');
      },
      error: (err) => {
        this.error = 'Failed to load product. Please try again.';
        this.isLoading = false;
        this.cdr.detectChanges();
        console.error('Error loading product:', err);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/buyer/products']);
  }

  selectVariant(variantId: number): void {
    this.selectedVariantId = variantId;
  }

  get selectedVariant() {
    if (!this.product || !this.selectedVariantId) return null;
    return this.product.variants.find(v => v.id === this.selectedVariantId) || null;
  }

  get gradeLabel(): string {
    if (!this.product) return '';
    const labels: Record<ProductGrade, string> = {
      [ProductGrade.PREMIUM]: 'Premium',
      [ProductGrade.FIRST]: 'Grade I',
      [ProductGrade.SECOND]: 'Grade II',
      [ProductGrade.THIRD]: 'Grade III'
    };
    return labels[this.product.product.grade] || this.product.product.grade;
  }

  get lowestPrice(): number {
    if (!this.product || !this.product.variants.length) return 0;
    return Math.min(...this.product.variants.map(v => v.price));
  }

  get highestPrice(): number {
    if (!this.product || !this.product.variants.length) return 0;
    return Math.max(...this.product.variants.map(v => v.price));
  }

  get priceRange(): string {
    if (!this.product) return '';
    if (this.lowestPrice === this.highestPrice) {
      return `₹${this.lowestPrice.toLocaleString('en-IN')}`;
    }
    return `₹${this.lowestPrice.toLocaleString('en-IN')} - ₹${this.highestPrice.toLocaleString('en-IN')}`;
  }

  onQuantityChange(qty: number): void {
    this.quantity = qty;
  }

  addToCart(): void {
    if (!this.selectedVariant) {
      alert('Please select a variant');
      return;
    }

    this.cartService.addItem(this.selectedVariant.id, this.quantity).subscribe({
      next: (response) => {
        if (response.success) {
          alert(`Added ${this.quantity} item(s) to cart!`);
          this.router.navigate(['/buyer/cart']);
        } else {
          alert('Failed to add to cart. Please try again.');
        }
      },
      error: (err) => {
        console.error('Error adding to cart:', err);
        alert('Failed to add to cart. Please try again.');
      }
    });
  }

  getProductImage(): string {
    if (!this.product?.product.images?.length) {
      return 'assets/images/saffron-placeholder.jpg';
    }
    return this.product.product.images[0];
  }
}
