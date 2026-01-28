import { Injectable } from '@angular/core';

/**
 * Storage Service
 * Manages localStorage for JWT tokens and user data
 */
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly TOKEN_KEY = 'saffron_auth_token';
  private readonly USER_KEY = 'saffron_user';

  constructor() {}

  // ==================== TOKEN MANAGEMENT ====================
  
  /**
   * Save JWT token to localStorage
   */
  saveToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token to localStorage:', error);
    }
  }

  /**
   * Get JWT token from localStorage
   */
  getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error reading token from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove JWT token from localStorage
   */
  removeToken(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error removing token from localStorage:', error);
    }
  }

  /**
   * Check if token exists in localStorage
   */
  hasToken(): boolean {
    return !!this.getToken();
  }

  // ==================== USER MANAGEMENT ====================
  
  /**
   * Save user object to localStorage
   */
  saveUser(user: any): void {
    try {
      const userJson = JSON.stringify(user);
      localStorage.setItem(this.USER_KEY, userJson);
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }

  /**
   * Get user object from localStorage
   */
  getUser(): any | null {
    try {
      const userJson = localStorage.getItem(this.USER_KEY);
      if (!userJson) return null;
      
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
      return null;
    }
  }

  /**
   * Remove user object from localStorage
   */
  removeUser(): void {
    try {
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Error removing user from localStorage:', error);
    }
  }

  // ==================== CLEAR ALL ====================
  
  /**
   * Clear all authentication data from localStorage
   * Use this on logout
   */
  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }

  // ==================== UTILITY METHODS ====================
  
  /**
   * Get a custom item from localStorage
   */
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Set a custom item in localStorage
   */
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  }

  /**
   * Remove a custom item from localStorage
   */
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
}
