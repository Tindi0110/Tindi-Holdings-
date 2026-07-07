export type PaymentGateway = 'stripe' | 'mpesa' | 'paypal' | 'cod';
export type PaymentStatus = 'pending' | 'processing' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';
export interface PaymentIntent {
  id: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: PaymentStatus;
  redirectUrl: string | null;
}
export interface PaymentResult {
  success: boolean;
  transactionId: string | null;
  status: PaymentStatus;
  message: string;
}