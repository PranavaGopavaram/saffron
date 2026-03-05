import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-quantity-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quantity-input.component.html',
  styleUrls: ['./quantity-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => QuantityInputComponent),
      multi: true
    }
  ]
})
export class QuantityInputComponent implements ControlValueAccessor {
  @Input() min: number = 1;
  @Input() max: number = 999;
  @Input() step: number = 1;
  @Input() disabled: boolean = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() 
  set quantity(value: number) {
    this._quantity = value || this.min;
  }
  get quantity(): number {
    return this._quantity;
  }
  @Output() quantityChange = new EventEmitter<number>();

  private _quantity: number = 1;

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  decrement(): void {
    if (this.disabled) return;
    const newValue = Math.max(this.min, this._quantity - this.step);
    this.updateQuantity(newValue);
  }

  increment(): void {
    if (this.disabled) return;
    const newValue = Math.min(this.max, this._quantity + this.step);
    this.updateQuantity(newValue);
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);
    
    if (isNaN(value)) {
      value = this.min;
    }
    
    value = Math.max(this.min, Math.min(this.max, value));
    this.updateQuantity(value);
  }

  private updateQuantity(value: number): void {
    this._quantity = value;
    this.quantityChange.emit(this._quantity);
    this.onChange(this._quantity);
    this.onTouched();
  }

  // ControlValueAccessor implementation
  writeValue(value: number): void {
    this._quantity = value || this.min;
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
