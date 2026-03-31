import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BuyerHeaderComponent } from '../shared/buyer-header/buyer-header.component';
import { BuyerFooterComponent } from '../shared/buyer-footer/buyer-footer.component';
import { UserService, UserProfile, ChangePasswordRequest } from '../../../core/services/user.service';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../../../core/models/marketplace.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BuyerHeaderComponent, BuyerFooterComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: UserProfile | null = null;
  addresses: Address[] = [];
  loading = true;
  saving = false;
  error = '';
  success = '';

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  isEditingProfile = false;
  isChangingPassword = false;
  isAddingAddress = false;
  editingAddressId: number | null = null;

  profileForm = {
    fullName: '',
    phone: ''
  };

  passwordForm: ChangePasswordRequest = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  addressForm: CreateAddressRequest = {
    type: 'shipping',
    street: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    is_default: false
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    console.log('Loading profile data...');
    
    const timeout = setTimeout(() => {
      if (this.loading) {
        console.error('Profile load timeout - forcing stop');
        this.error = 'Request timed out. Please try again.';
        this.loading = false;
      }
    }, 10000);
    
    this.userService.getProfile().subscribe({
      next: (res) => {
        clearTimeout(timeout);
        console.log('Profile loaded:', res);
        this.profile = res.data!;
        this.profileForm.fullName = this.profile.full_name;
        this.profileForm.phone = this.profile.phone || '';
        this.cdr.detectChanges();
        this.loadAddresses();
      },
      error: (err) => {
        clearTimeout(timeout);
        console.error('Failed to load profile:', err);
        this.error = err?.error?.message || err?.message || 'Failed to load profile';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadAddresses(): void {
    this.userService.getAddresses().subscribe({
      next: (res) => {
        this.addresses = res.data || [];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleEditProfile(): void {
    this.isEditingProfile = !this.isEditingProfile;
    if (this.profile) {
      this.profileForm.fullName = this.profile.full_name;
      this.profileForm.phone = this.profile.phone || '';
    }
  }

  saveProfile(): void {
    this.saving = true;
    this.error = '';
    this.userService.updateProfile({
      fullName: this.profileForm.fullName,
      phone: this.profileForm.phone
    }).subscribe({
      next: (res) => {
        this.profile = res.data!;
        this.isEditingProfile = false;
        this.saving = false;
        this.success = 'Profile updated successfully';
        this.cdr.detectChanges();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to update profile';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleChangePassword(): void {
    this.isChangingPassword = !this.isChangingPassword;
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.error = 'New password and confirm password do not match';
      return;
    }
    this.saving = true;
    this.error = '';
    this.userService.changePassword(this.passwordForm).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.saving = false;
        this.success = 'Password changed successfully';
        this.cdr.detectChanges();
        setTimeout(() => this.success = '', 3000);
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to change password';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleAddAddress(): void {
    this.isAddingAddress = !this.isAddingAddress;
    this.resetAddressForm();
  }

  resetAddressForm(): void {
    this.addressForm = {
      type: 'shipping',
      street: '',
      city: '',
      state: '',
      zip_code: '',
      country: '',
      is_default: false
    };
  }

  saveAddress(): void {
    const addressData: CreateAddressRequest = {
      type: this.addressForm.type,
      street: this.addressForm.street,
      city: this.addressForm.city,
      state: this.addressForm.state,
      zip_code: this.addressForm.zip_code,
      country: this.addressForm.country,
      is_default: this.addressForm.is_default
    };

    if (this.editingAddressId) {
      this.saving = true;
      this.userService.updateAddress(this.editingAddressId, addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.cancelAddressEdit();
          this.saving = false;
          this.success = 'Address updated successfully';
          this.cdr.detectChanges();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to update address';
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.saving = true;
      this.userService.createAddress(addressData).subscribe({
        next: () => {
          this.loadAddresses();
          this.isAddingAddress = false;
          this.resetAddressForm();
          this.saving = false;
          this.success = 'Address added successfully';
          this.cdr.detectChanges();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to add address';
          this.saving = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  editAddress(address: Address): void {
    this.editingAddressId = address.id!;
    this.isAddingAddress = true;
    this.addressForm = {
      type: address.type,
      street: address.street,
      city: address.city,
      state: address.state,
      zip_code: address.zipCode,
      country: address.country,
      is_default: address.isDefault
    };
  }

  cancelAddressEdit(): void {
    this.editingAddressId = null;
    this.isAddingAddress = false;
    this.resetAddressForm();
  }

  deleteAddress(addressId: number): void {
    if (confirm('Are you sure you want to delete this address?')) {
      this.userService.deleteAddress(addressId).subscribe({
        next: () => {
          this.loadAddresses();
          this.success = 'Address deleted successfully';
          this.cdr.detectChanges();
          setTimeout(() => this.success = '', 3000);
        },
        error: (err) => {
          this.error = err.error?.message || 'Failed to delete address';
          this.cdr.detectChanges();
        }
      });
    }
  }
}