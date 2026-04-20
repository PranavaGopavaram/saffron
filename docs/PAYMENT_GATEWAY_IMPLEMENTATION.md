# Mock Payment Gateway Implementation Plan

## Overview

This document outlines the implementation plan for integrating a mock payment gateway using Beeceptor's free tier for the Saffron marketplace project.

---

## Beeceptor Free Plan Specifications

| Feature | Limit |
|---------|-------|
| Requests per day | 50 (per endpoint, resets daily) |
| Mock rules | 3 maximum |
| Endpoint type | Public |
| Dynamic responses | Supported |
| Stateful mocks | Supported |
| CORS | Auto-handled |

**Note:** Sufficient for development/testing but not for production use.

---

## Phase 1: Beeceptor Setup (Manual)

### 1.1 Create Endpoint

1. Go to https://beeceptor.com
2. Create a new endpoint with name: `saffron-payments`
3. Your endpoint URL will be: `https://saffron-payments.free.beeceptor.com`

### 1.2 Configure Mock Rules

#### Rule 1: Create Payment Intent

| Setting | Value |
|---------|-------|
| Method | `POST` |
| Path | `/api/payments/create-intent` |
| Status | `200` |

**Response Body:**
```json
{
  "success": true,
  "paymentId": "pay_{{uuid}}",
  "amount": {{body 'amount'}},
  "currency": "{{body 'currency'}}",
  "status": "pending",
  "clientToken": "mock_{{timestamp}}"
}
```

#### Rule 2: Confirm Payment (with failure simulation)

| Setting | Value |
|---------|-------|
| Method | `POST` |
| Path | `/api/payments/confirm` |

**Success Response (Status 200):**
```json
{
  "success": true,
  "paymentId": "{{body 'paymentId'}}",
  "status": "completed",
  "transactionId": "txn_{{uuid}}",
  "timestamp": "{{isoTimestamp}}"
}
```

**Failure Response (Status 400)** - Configure conditional matching for card numbers ending in `0000`:
```json
{
  "success": false,
  "paymentId": "{{body 'paymentId'}}",
  "status": "failed",
  "error": "Card declined",
  "errorCode": "CARD_DECLINED"
}
```

#### Rule 3: Get Payment Status

| Setting | Value |
|---------|-------|
| Method | `GET` |
| Path | `/api/payments/status/*` |
| Status | `200` |

**Response Body:**
```json
{
  "paymentId": "{{request.path.[3]}}",
  "status": "completed"
}
```

#### Rule 4: Refund Payment

| Setting | Value |
|---------|-------|
| Method | `POST` |
| Path | `/api/payments/refund` |

**Success Response (Status 200):**
```json
{
  "success": true,
  "refundId": "refund_{{uuid}}",
  "status": "completed",
  "timestamp": "{{isoTimestamp}}"
}
```

**Failure Response (Status 400)** (optional):
```json
{
  "success": false,
  "refundId": "refund_{{uuid}}",
  "status": "failed",
  "error": "Refund failed",
  "errorCode": "REFUND_FAILED"
}
```

---

## Phase 2: Backend Implementation

### 2.1 Environment Configuration

**File:** `backend/src/config/env.ts`

Add the following environment variables:

```typescript
PAYMENT_GATEWAY_URL: string;  // Beeceptor URL
PAYMENT_MODE: 'mock' | 'live'; // Payment mode
```

**Example `.env` additions:**
```
PAYMENT_GATEWAY_URL=https://saffron-payments.free.beeceptor.com
PAYMENT_MODE=mock
```

### 2.2 Payment Service

**File:** `backend/src/services/payment.service.ts` (New)

```typescript
// Methods to implement:

/**
 * Creates a payment intent with the payment gateway
 */
createPaymentIntent(buyerId: number, amount: number, currency: string, metadata: object): Promise<PaymentIntent>

/**
 * Confirms a payment with card details
 */
confirmPayment(paymentId: string, cardDetails: CardDetails): Promise<PaymentConfirmation>

/**
 * Retrieves the status of a payment
 */
getPaymentStatus(paymentId: string): Promise<PaymentStatus>

/**
 * Records a transaction in the database
 */
recordTransaction(orderId: number, paymentData: PaymentData): Promise<Transaction>
```

### 2.3 Payment Controller

**File:** `backend/src/controllers/payment.controller.ts` (New)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/payments/initiate` | POST | Creates a payment intent |
| `/api/payments/confirm` | POST | Confirms a payment |
| `/api/payments/:id/status` | GET | Gets payment status |

### 2.4 Payment Routes

**File:** `backend/src/routes/payment.routes.ts` (New)

Register all payment endpoints with authentication middleware.

### 2.5 Order Service Modifications

**File:** `backend/src/services/order.service.ts`

- Add `createOrderWithPayment()` method
- Only create order after payment confirmation
- Link order to payment transaction in `payment_transactions` table

---

## Phase 3: Frontend Implementation

### 3.1 Payment Models

**File:** `frontend/src/app/core/models/marketplace.model.ts`

```typescript
export interface PaymentIntent {
  paymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  clientToken: string;
}

export interface CardDetails {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardHolderName: string;
}

export interface PaymentConfirmation {
  success: boolean;
  paymentId: string;
  status: string;
  transactionId?: string;
  error?: string;
  errorCode?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
}
```

### 3.2 Payment Service

**File:** `frontend/src/app/core/services/payment.service.ts` (New)

```typescript
// Methods to implement:

/**
 * Initiates a payment with the given amount
 */
initiatePayment(amount: number, currency: string): Observable<PaymentIntent>

/**
 * Confirms a payment with card details
 */
confirmPayment(paymentId: string, cardDetails: CardDetails): Observable<PaymentConfirmation>

/**
 * Gets the status of a payment
 */
getPaymentStatus(paymentId: string): Observable<PaymentStatus>
```

### 3.3 Checkout Component Updates

**File:** `frontend/src/app/features/buyer/checkout/checkout.component.ts`

- Add new step to checkout flow: `currentStep: 'address' | 'review' | 'payment' | 'confirmation'`
- Add payment form fields (card number, expiry, CVV)
- Add payment processing logic
- Handle success and failure scenarios

**File:** `frontend/src/app/features/buyer/checkout/checkout.component.html`

Add payment step UI:

```html
<!-- Payment Step -->
<div *ngIf="currentStep === 'payment'" class="payment-step">
  <h2>Payment Details</h2>
  
  <div class="payment-form">
    <div class="form-group">
      <label>Card Number</label>
      <input type="text" 
             placeholder="1234 5678 9012 3456" 
             [(ngModel)]="cardNumber"
             maxlength="19">
    </div>
    
    <div class="form-row">
      <div class="form-group">
        <label>Expiry Date</label>
        <input type="text" 
               placeholder="MM/YY" 
               [(ngModel)]="expiry"
               maxlength="5">
      </div>
      
      <div class="form-group">
        <label>CVV</label>
        <input type="password" 
               placeholder="123" 
               [(ngModel)]="cvv"
               maxlength="4">
      </div>
    </div>
    
    <div class="form-group">
      <label>Cardholder Name</label>
      <input type="text" 
             placeholder="John Doe" 
             [(ngModel)]="cardHolderName">
    </div>
    
    <p class="test-hint">
      Test Cards: Use any card number for success. 
      Use card ending in 0000 to simulate failure.
    </p>
    
    <button class="pay-btn" (click)="processPayment()" [disabled]="isProcessing">
      {{ isProcessing ? 'Processing...' : 'Pay Now' }}
    </button>
  </div>
</div>
```

**File:** `frontend/src/app/features/buyer/checkout/checkout.component.css`

Add styles for payment form.

### 3.4 Updated Checkout Flow

| Step | Current Flow | New Flow |
|------|--------------|----------|
| 1 | Address Selection | Address Selection |
| 2 | Review Order | Review Order |
| 3 | Place Order | Payment |
| 4 | - | Order Confirmation |

---

## Phase 4: Testing Scenarios

### Test Card Numbers

| Card Number | Expected Result |
|-------------|-----------------|
| 4111111111111111 | Success |
| 5500000000000004 | Success |
| 4000000000000000 | Failure (ends in 0000) |
| 1234567890000000 | Failure (ends in 0000) |
| Any other valid format | Success |

### Test Cases

1. **Successful Payment**
   - Enter valid card details
   - Verify payment processes successfully
   - Verify order is created
   - Verify transaction is recorded in database

2. **Failed Payment**
   - Enter card ending in 0000
   - Verify error message is displayed
   - Verify order is NOT created
   - Verify user can retry with different card

3. **Payment Status Check**
   - After successful payment, verify status endpoint returns correct status

---

## Files Summary

### Files to Create

| File Path | Description |
|-----------|-------------|
| `backend/src/services/payment.service.ts` | Payment business logic |
| `backend/src/controllers/payment.controller.ts` | Payment API endpoints |
| `backend/src/routes/payment.routes.ts` | Payment route definitions |
| `frontend/src/app/core/services/payment.service.ts` | Frontend payment API service |

### Files to Modify

| File Path | Changes |
|-----------|---------|
| `backend/src/config/env.ts` | Add payment gateway config |
| `backend/src/routes/index.ts` | Register payment routes |
| `backend/src/services/order.service.ts` | Integrate payment with order creation |
| `frontend/src/app/core/models/marketplace.model.ts` | Add payment interfaces |
| `frontend/src/app/features/buyer/checkout/checkout.component.ts` | Add payment step logic |
| `frontend/src/app/features/buyer/checkout/checkout.component.html` | Add payment UI |
| `frontend/src/app/features/buyer/checkout/checkout.component.css` | Add payment styles |

---

## Database Schema Reference

The `payment_transactions` table already exists in the schema:

```sql
CREATE TABLE payment_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  payment_gateway TEXT,
  transaction_reference TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);
```

---

## Important Notes

1. **Free Tier Limitations**: 50 requests/day is sufficient for development but not for production or load testing.

2. **No Signup Required**: Beeceptor free tier does not require account creation.

3. **CORS Handling**: Beeceptor automatically handles CORS headers.

4. **Stateful Mocks**: Available if you need to track payment state across requests.

5. **Production Migration**: When moving to production, replace the Beeceptor URL with a real payment gateway (Razorpay, Stripe, PayPal, etc.). The service layer abstraction will make this transition easier.

6. **Security**: This is a mock implementation. Never use this pattern with real card data. Real payment gateways use tokenization and PCI-compliant methods.

---

## References

- [Beeceptor Documentation](https://beeceptor.com/docs/beeceptor-features/)
- [Beeceptor Template Engine](https://beeceptor.com/docs/template-engine/)
- [Beeceptor Stateful Mocks](https://beeceptor.com/docs/template-stateful-mocks/)
