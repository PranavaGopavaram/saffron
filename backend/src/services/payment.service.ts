import { config } from '../config/env';
import { pool } from '../config/database';
import { BadRequestError } from '../utils/api-response';

export interface PaymentIntent {
  success: boolean;
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
  status: 'completed' | 'failed';
  transactionId?: string;
  error?: string;
  errorCode?: string;
  timestamp?: string;
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface RefundResult {
  success: boolean;
  refundId: string;
  status: 'completed' | 'failed';
  timestamp?: string;
  error?: string;
  errorCode?: string;
}

export interface PaymentTransaction {
  id: number;
  orderId: number;
  buyerId: number;
  amount: number;
  paymentMethod: string;
  paymentGateway: string;
  transactionReference: string;
  status: string;
  createdAt: Date;
}

interface BeeceptorPaymentResponse {
  success: boolean;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  clientToken: string;
  transactionId?: string;
  timestamp?: string;
  error?: string;
  errorCode?: string;
}

interface BeeceptorRefundResponse {
  success: boolean;
  refundId: string;
  status: string;
  timestamp?: string;
  error?: string;
  errorCode?: string;
}

class PaymentService {
  private readonly gatewayUrl = config.payment.gatewayUrl;
  private readonly paymentMode = config.payment.mode;

  private mapTransactionStatus(status: PaymentConfirmation['status']): 'pending' | 'success' | 'failed' {
    // DB enum for payment_transactions.status is: pending | success | failed
    if (status === 'completed') return 'success';
    if (status === 'failed') return 'failed';
    return 'pending';
  }

  async createPaymentIntent(
    buyerId: number,
    amount: number,
    currency: string = 'INR',
    metadata?: { orderId?: number; description?: string }
  ): Promise<PaymentIntent> {
    try {
      const response = await fetch(`${this.gatewayUrl}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          buyerId,
          metadata,
        }),
      });

      if (!response.ok) {
        throw new BadRequestError('Failed to create payment intent');
      }

      const data = await response.json() as BeeceptorPaymentResponse;
      return {
        success: data.success,
        paymentId: data.paymentId,
        amount: data.amount,
        currency: data.currency,
        status: data.status as 'pending' | 'completed' | 'failed',
        clientToken: data.clientToken,
      };
    } catch (error) {
      console.error('Payment intent creation error:', error);
      if (this.paymentMode === 'mock') {
        return this.createMockPaymentIntent(amount, currency);
      }
      throw new BadRequestError('Payment gateway unavailable');
    }
  }

  private createMockPaymentIntent(amount: number, currency: string): PaymentIntent {
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return {
      success: true,
      paymentId,
      amount,
      currency,
      status: 'pending',
      clientToken: `mock_token_${Date.now()}`,
    };
  }

  async confirmPayment(
    paymentId: string,
    cardDetails: CardDetails
  ): Promise<PaymentConfirmation> {
    if (cardDetails.cardNumber.replace(/\s/g, '').endsWith('0000')) {
      return {
        success: false,
        paymentId,
        status: 'failed',
        error: 'Card declined',
        errorCode: 'CARD_DECLINED',
      };
    }

    try {
      const response = await fetch(`${this.gatewayUrl}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentId,
          cardNumber: cardDetails.cardNumber,
          expiryMonth: cardDetails.expiryMonth,
          expiryYear: cardDetails.expiryYear,
          cardHolderName: cardDetails.cardHolderName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as BeeceptorPaymentResponse;
        return {
          success: false,
          paymentId,
          status: 'failed',
          error: errorData.error || 'Payment failed',
          errorCode: errorData.errorCode || 'PAYMENT_FAILED',
        };
      }

      const data = await response.json() as BeeceptorPaymentResponse;
      return {
        success: data.success,
        paymentId: data.paymentId,
        status: data.status as 'completed' | 'failed',
        transactionId: data.transactionId,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('Payment confirmation error:', error);
      if (this.paymentMode === 'mock') {
        return this.createMockPaymentConfirmation(paymentId);
      }
      return {
        success: false,
        paymentId,
        status: 'failed',
        error: 'Payment gateway unavailable',
        errorCode: 'GATEWAY_UNAVAILABLE',
      };
    }
  }

  private createMockPaymentConfirmation(paymentId: string): PaymentConfirmation {
    return {
      success: true,
      paymentId,
      status: 'completed',
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      timestamp: new Date().toISOString(),
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      const response = await fetch(`${this.gatewayUrl}/api/payments/status/${paymentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new BadRequestError('Failed to get payment status');
      }

      const data = await response.json() as { paymentId: string; status: string };
      return {
        paymentId: data.paymentId,
        status: data.status as 'pending' | 'completed' | 'failed',
      };
    } catch (error) {
      console.error('Payment status check error:', error);
      if (this.paymentMode === 'mock') {
        return {
          paymentId,
          status: 'completed',
        };
      }
      throw new BadRequestError('Payment gateway unavailable');
    }
  }

  async refundPayment(
    transactionReference: string,
    amount: number,
    reason: string = 'order_cancelled'
  ): Promise<RefundResult> {
    try {
      const response = await fetch(`${this.gatewayUrl}/api/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionReference,
          amount,
          reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as Partial<BeeceptorRefundResponse>;
        return {
          success: false,
          refundId: errorData.refundId || `refund_${Date.now()}`,
          status: 'failed',
          error: errorData.error || 'Refund failed',
          errorCode: errorData.errorCode || 'REFUND_FAILED',
          timestamp: errorData.timestamp,
        };
      }

      const data = await response.json() as BeeceptorRefundResponse;
      return {
        success: data.success,
        refundId: data.refundId,
        status: data.status as 'completed' | 'failed',
        timestamp: data.timestamp,
        error: data.error,
        errorCode: data.errorCode,
      };
    } catch (error) {
      console.error('Refund error:', error);
      if (this.paymentMode === 'mock') {
        return {
          success: true,
          refundId: `refund_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          status: 'completed',
          timestamp: new Date().toISOString(),
        };
      }
      return {
        success: false,
        refundId: `refund_${Date.now()}`,
        status: 'failed',
        error: 'Payment gateway unavailable',
        errorCode: 'GATEWAY_UNAVAILABLE',
      };
    }
  }

  async recordTransaction(
    orderId: number,
    buyerId: number,
    amount: number,
    paymentConfirmation: PaymentConfirmation
  ): Promise<PaymentTransaction> {
    const transactionStatus = this.mapTransactionStatus(paymentConfirmation.status);
    const [result] = await pool.query(
      `INSERT INTO payment_transactions 
       (order_id, buyer_id, amount, payment_method, payment_gateway, transaction_reference, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        buyerId,
        amount,
        'card',
        'beeceptor_mock',
        paymentConfirmation.transactionId || paymentConfirmation.paymentId,
        transactionStatus,
      ]
    );

    const insertId = (result as any).insertId;
    
    const [rows] = await pool.query(
      'SELECT * FROM payment_transactions WHERE id = ?',
      [insertId]
    );

    const transaction = (rows as any[])[0];
    return {
      id: transaction.id,
      orderId: transaction.order_id,
      buyerId: transaction.buyer_id,
      amount: transaction.amount,
      paymentMethod: transaction.payment_method,
      paymentGateway: transaction.payment_gateway,
      transactionReference: transaction.transaction_reference,
      status: transaction.status,
      createdAt: transaction.created_at,
    };
  }

  async recordRefundTransaction(
    orderId: number,
    buyerId: number,
    amount: number,
    refund: RefundResult
  ): Promise<PaymentTransaction> {
    const status: 'pending' | 'success' | 'failed' = refund.success ? 'success' : 'failed';
    const [result] = await pool.query(
      `INSERT INTO payment_transactions 
       (order_id, buyer_id, amount, payment_method, payment_gateway, transaction_reference, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        buyerId,
        amount,
        'refund',
        'beeceptor_mock',
        refund.refundId,
        status,
      ]
    );

    const insertId = (result as any).insertId;
    const [rows] = await pool.query(
      'SELECT * FROM payment_transactions WHERE id = ?',
      [insertId]
    );

    const transaction = (rows as any[])[0];
    return {
      id: transaction.id,
      orderId: transaction.order_id,
      buyerId: transaction.buyer_id,
      amount: transaction.amount,
      paymentMethod: transaction.payment_method,
      paymentGateway: transaction.payment_gateway,
      transactionReference: transaction.transaction_reference,
      status: transaction.status,
      createdAt: transaction.created_at,
    };
  }

  async updateOrderPaymentStatus(
    orderId: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  ): Promise<void> {
    await pool.query(
      'UPDATE orders SET payment_status = ? WHERE id = ?',
      [status, orderId]
    );
  }

  async getOrderTransactions(orderId: number): Promise<PaymentTransaction[]> {
    const [rows] = await pool.query(
      'SELECT * FROM payment_transactions WHERE order_id = ? ORDER BY created_at DESC',
      [orderId]
    );

    return (rows as any[]).map(row => ({
      id: row.id,
      orderId: row.order_id,
      buyerId: row.buyer_id,
      amount: row.amount,
      paymentMethod: row.payment_method,
      paymentGateway: row.payment_gateway,
      transactionReference: row.transaction_reference,
      status: row.status,
      createdAt: row.created_at,
    }));
  }
}

export const paymentService = new PaymentService();




 



