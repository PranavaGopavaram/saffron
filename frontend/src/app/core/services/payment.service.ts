import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  PaymentIntent,
  PaymentConfirmation,
  PaymentProcessResult,
  ProcessOrderPaymentRequest,
  PaymentTransaction,
  ApiResponse
} from '../models/marketplace.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  /**
   * Initiates a payment intent
   */
  initiatePayment(amount: number, currency: string = 'INR'): Observable<ApiResponse<PaymentIntent>> {
    return this.http.post<ApiResponse<PaymentIntent>>(
      `${this.apiUrl}/initiate`,
      { amount, currency }
    ).pipe(
      tap(response => {
        console.log('Payment intent created:', response.data?.paymentId);
      }),
      catchError(error => {
        console.error('Error creating payment intent:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Confirms a payment with card details
   */
  confirmPayment(
    paymentId: string,
    cardNumber: string,
    expiryMonth: string,
    expiryYear: string,
    cvv: string,
    cardHolderName: string,
    orderId?: number,
    amount?: number
  ): Observable<ApiResponse<PaymentConfirmation>> {
    return this.http.post<ApiResponse<PaymentConfirmation>>(
      `${this.apiUrl}/confirm`,
      {
        paymentId,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvv,
        cardHolderName,
        orderId,
        amount
      }
    ).pipe(
      tap(response => {
        console.log('Payment confirmation:', response.data?.status);
      }),
      catchError(error => {
        console.error('Error confirming payment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Process payment and create order in one step
   */
  processOrderPayment(request: ProcessOrderPaymentRequest): Observable<ApiResponse<PaymentProcessResult>> {
    return this.http.post<ApiResponse<PaymentProcessResult>>(
      `${this.apiUrl}/process-order`,
      {
        shippingAddressId: request.shippingAddressId,
        shippingCost: request.shippingCost,
        cardNumber: request.cardNumber,
        expiryMonth: request.expiryMonth,
        expiryYear: request.expiryYear,
        cvv: request.cvv,
        cardHolderName: request.cardHolderName,
        amount: request.amount
      }
    ).pipe(
      tap(response => {
        if (response.data?.success) {
          console.log('Payment processed and order created:', response.data.order?.order.orderNumber);
        } else {
          console.log('Payment failed:', response.data?.error);
        }
      }),
      catchError(error => {
        console.error('Error processing order payment:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets the status of a payment
   */
  getPaymentStatus(paymentId: string): Observable<ApiResponse<{ paymentId: string; status: string }>> {
    return this.http.get<ApiResponse<{ paymentId: string; status: string }>>(
      `${this.apiUrl}/${paymentId}/status`
    ).pipe(
      catchError(error => {
        console.error('Error getting payment status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Gets payment transactions for an order
   */
  getOrderTransactions(orderId: number): Observable<ApiResponse<PaymentTransaction[]>> {
    return this.http.get<ApiResponse<PaymentTransaction[]>>(
      `${this.apiUrl}/order/${orderId}/transactions`
    ).pipe(
      catchError(error => {
        console.error('Error getting order transactions:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Formats card number with spaces (for display)
   */
  formatCardNumber(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  }

  /**
   * Validates card number (basic Luhn check)
   */
  validateCardNumber(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cleaned)) return false;
    
    // Luhn algorithm
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }

  /**
   * Validates expiry date
   */
  validateExpiry(month: string, year: string): boolean {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;
    
    const expMonth = parseInt(month, 10);
    const expYear = parseInt(year, 10);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
  }

  /**
   * Validates CVV
   */
  validateCVV(cvv: string): boolean {
    return /^\d{3,4}$/.test(cvv);
  }

  /**
   * Gets card type from number
   */
  getCardType(cardNumber: string): string {
    const cleaned = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) return 'visa';
    if (/^5[1-5]/.test(cleaned)) return 'mastercard';
    if (/^3[47]/.test(cleaned)) return 'amex';
    if (/^6(?:011|5)/.test(cleaned)) return 'discover';
    if (/^(?:2131|1800|35)/.test(cleaned)) return 'jcb';
    
    return 'unknown';
  }
}
