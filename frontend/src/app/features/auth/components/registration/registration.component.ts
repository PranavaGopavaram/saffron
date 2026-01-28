import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegistrationData, BuyerRegistration, SellerRegistration } from '../../../../core/models/user.model';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  selectedFiles: File[] = [];
  isLoading = false;
  errorMessage: string = '';
  successMessage: string = '';  // Added for success feedback

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setupRoleChangeListener();
  }

  /**
   * Initialize the form with basic fields
   */
  private initializeForm(): void {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  /**
   * Listen to role changes and add/remove fields dynamically
   */
  private setupRoleChangeListener(): void {
    this.registrationForm.get('role')?.valueChanges.subscribe((role: string) => {
      this.removeRoleSpecificFields();
      
      if (role === 'buyer') {
        this.addBuyerFields();
      } else if (role === 'seller') {
        this.addSellerFields();
      }
    });
  }

  /**
   * Remove all role-specific fields
   */
  private removeRoleSpecificFields(): void {
    // Remove buyer fields
    this.registrationForm.removeControl('phone');
    this.registrationForm.removeControl('companyName');
    this.registrationForm.removeControl('shippingStreet');
    this.registrationForm.removeControl('shippingCity');
    this.registrationForm.removeControl('shippingState');
    this.registrationForm.removeControl('shippingZip');
    this.registrationForm.removeControl('shippingCountry');
    
    // Remove seller fields
    this.registrationForm.removeControl('businessName');
    this.registrationForm.removeControl('businessStreet');
    this.registrationForm.removeControl('businessCity');
    this.registrationForm.removeControl('businessState');
    this.registrationForm.removeControl('businessZip');
    this.registrationForm.removeControl('businessCountry');
    this.registrationForm.removeControl('taxId');
    this.registrationForm.removeControl('saffronSource');
    
    // Clear selected files
    this.selectedFiles = [];
  }

  /**
   * Add buyer-specific fields
   */
  private addBuyerFields(): void {
    this.registrationForm.addControl('phone', this.fb.control('', Validators.required));
    this.registrationForm.addControl('companyName', this.fb.control(''));
    this.registrationForm.addControl('shippingStreet', this.fb.control('', Validators.required));
    this.registrationForm.addControl('shippingCity', this.fb.control('', Validators.required));
    this.registrationForm.addControl('shippingState', this.fb.control('', Validators.required));
    this.registrationForm.addControl('shippingZip', this.fb.control('', Validators.required));
    this.registrationForm.addControl('shippingCountry', this.fb.control('', Validators.required));
  }

  /**
   * Add seller-specific fields
   */
  private addSellerFields(): void {
    this.registrationForm.addControl('phone', this.fb.control('', Validators.required));
    this.registrationForm.addControl('businessName', this.fb.control('', Validators.required));
    this.registrationForm.addControl('businessStreet', this.fb.control('', Validators.required));
    this.registrationForm.addControl('businessCity', this.fb.control('', Validators.required));
    this.registrationForm.addControl('businessState', this.fb.control('', Validators.required));
    this.registrationForm.addControl('businessZip', this.fb.control('', Validators.required));
    this.registrationForm.addControl('businessCountry', this.fb.control('', Validators.required));
    this.registrationForm.addControl('taxId', this.fb.control('', Validators.required));
    this.registrationForm.addControl('saffronSource', this.fb.control('', [Validators.required, Validators.minLength(10)]));
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Handle file selection for seller certifications
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) {
      return;
    }

    const files = Array.from(input.files);
    const errors: string[] = [];

    // Validate each file
    for (const file of files) {
      // Check file type (PDF only)
      if (file.type !== 'application/pdf') {
        errors.push(`${file.name}: Only PDF files are allowed`);
        continue;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: File size exceeds 5MB`);
        continue;
      }

      // Check total files (max 5)
      if (this.selectedFiles.length >= 5) {
        errors.push('Maximum 5 files allowed');
        break;
      }

      this.selectedFiles.push(file);
    }

    // Show errors if any
    if (errors.length > 0) {
      this.errorMessage = errors.join(', ');
      setTimeout(() => this.errorMessage = '', 5000);
    }

    // Reset input
    input.value = '';
  }

  /**
   * Remove a file from the selected files
   */
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  /**
   * Get formatted file size
   */
  getFileSize(bytes: number): string {
    return (bytes / 1024).toFixed(2) + ' KB';
  }

  /**
   * Check if a field has errors and was touched
   */
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.registrationForm.get(fieldName);
    if (!field) return false;

    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }

    return field.invalid && (field.dirty || field.touched);
  }

  /**
   * Check if passwords mismatch
   */
  hasPasswordMismatch(): boolean {
    const confirmPassword = this.registrationForm.get('confirmPassword');
    return !!(this.registrationForm.hasError('passwordMismatch') && 
           confirmPassword?.dirty && 
           confirmPassword?.touched);
  }

  /**
   * Prepare registration data based on role
   */
  private prepareRegistrationData(): RegistrationData {
    const formValue = this.registrationForm.value;
    const role = formValue.role;

    if (role === 'buyer') {
      const buyerData: BuyerRegistration = {
        fullName: formValue.fullName,
        email: formValue.email,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        phone: formValue.phone,
        role: 'buyer',
        companyName: formValue.companyName || undefined,
        shippingAddress: {
          street: formValue.shippingStreet,
          city: formValue.shippingCity,
          state: formValue.shippingState,
          zipCode: formValue.shippingZip,
          country: formValue.shippingCountry
        }
      };
      return buyerData;
    } else {
      const sellerData: SellerRegistration = {
        fullName: formValue.fullName,
        email: formValue.email,
        password: formValue.password,
        confirmPassword: formValue.confirmPassword,
        phone: formValue.phone,
        role: 'seller',
        businessName: formValue.businessName,
        businessAddress: {
          street: formValue.businessStreet,
          city: formValue.businessCity,
          state: formValue.businessState,
          zipCode: formValue.businessZip,
          country: formValue.businessCountry
        },
        taxId: formValue.taxId,
        saffronSource: formValue.saffronSource,
        certifications: this.selectedFiles.length > 0 ? this.selectedFiles : undefined
      };
      return sellerData;
    }
  }

  /**
   * Submit the registration form
   */
  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Prepare registration data
    const registrationData = this.prepareRegistrationData();
    const role = registrationData.role;

    // Call appropriate registration method based on role
    if (role === 'buyer') {
      this.authService.registerBuyer(registrationData).subscribe({
        next: (response) => this.handleRegistrationSuccess(response, 'buyer'),
        error: (error) => this.handleRegistrationError(error)
      });
    } else if (role === 'seller') {
      this.authService.registerSeller(registrationData, this.selectedFiles).subscribe({
        next: (response) => this.handleRegistrationSuccess(response, 'seller'),
        error: (error) => this.handleRegistrationError(error)
      });
    }
  }

  /**
   * Handle successful registration
   */
  private handleRegistrationSuccess(response: any, role: string): void {
    this.isLoading = false;
    if (response.success) {
      this.successMessage = response.message || 'Registration successful! Redirecting to dashboard...';
      // Navigate to dashboard after short delay
      setTimeout(() => {
        this.router.navigate([`/${role}/dashboard`]);
      }, 1500);
    }
  }

  /**
   * Handle registration error
   */
  private handleRegistrationError(error: any): void {
    this.isLoading = false;
    
    if (error.status === 409) {
      this.errorMessage = 'Email already registered. Please use a different email or login.';
    } else if (error.status === 0) {
      this.errorMessage = 'Cannot connect to server. Please check if the backend is running on http://localhost:3000';
    } else {
      this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
    }
  }

  /**
   * Get current role value
   */
  get currentRole(): string {
    return this.registrationForm.get('role')?.value || '';
  }
}
