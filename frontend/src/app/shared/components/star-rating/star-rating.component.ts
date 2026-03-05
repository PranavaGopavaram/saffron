import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => StarRatingComponent),
      multi: true
    }
  ]
})
export class StarRatingComponent implements ControlValueAccessor {
  @Input() rating: number = 0;
  @Input() maxRating: number = 5;
  @Input() readonly: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() showValue: boolean = false;
  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverRating: number = 0;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.stars = Array.from({ length: this.maxRating }, (_, i) => i + 1);
  }

  getStarClass(star: number): string {
    const effectiveRating = this.hoverRating || this.rating;
    if (star <= effectiveRating) {
      return 'star filled';
    } else if (star - 0.5 <= effectiveRating) {
      return 'star half-filled';
    }
    return 'star';
  }

  onStarClick(star: number): void {
    if (this.readonly) return;
    this.rating = star;
    this.ratingChange.emit(this.rating);
    this.onChange(this.rating);
    this.onTouched();
  }

  onStarHover(star: number): void {
    if (this.readonly) return;
    this.hoverRating = star;
  }

  onStarLeave(): void {
    this.hoverRating = 0;
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this.rating = value || 0;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.readonly = isDisabled;
  }
}
