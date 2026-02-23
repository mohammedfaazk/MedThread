import axios from 'axios';
import { loadStripe, Stripe } from '@stripe/stripe-js';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const STRIPE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_KEY);
  }
  return stripePromise;
};

export const paymentApi = {
  /**
   * Create payment intent
   */
  async createPaymentIntent(data: {
    amount: number;
    type: 'CONSULTATION' | 'SUBSCRIPTION' | 'PREMIUM_FEATURE';
    description?: string;
    metadata?: Record<string, any>;
  }) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/create-intent`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Confirm payment
   */
  async confirmPayment(paymentIntentId: string) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/confirm`,
      { paymentIntentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Create subscription
   */
  async createSubscription(data: {
    planName: string;
    planPrice: number;
    priceId: string;
  }) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/subscription`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, cancelAtPeriodEnd: boolean = true) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/subscription/${subscriptionId}/cancel`,
      { cancelAtPeriodEnd },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Get user subscriptions
   */
  async getUserSubscriptions() {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_URL}/api/payment/subscriptions`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Create consultation fee
   */
  async createConsultationFee(data: {
    doctorId: string;
    patientId: string;
    appointmentId?: string;
    amount: number;
  }) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/consultation-fee`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Pay consultation fee
   */
  async payConsultationFee(feeId: string, paymentId: string) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/consultation-fee/pay`,
      { feeId, paymentId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Request refund
   */
  async requestRefund(data: {
    paymentId: string;
    amount?: number;
    reason: string;
  }) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.post(
      `${API_URL}/api/payment/refund`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  /**
   * Get payment history
   */
  async getPaymentHistory(page: number = 1, limit: number = 20) {
    const token = localStorage.getItem('auth_token');
    const response = await axios.get(
      `${API_URL}/api/payment/history`,
      {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },
};
