"use strict";
// Payment service with Stripe integration
// Handles consultation payments, refunds, and payment history
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
class PaymentService {
    constructor() {
        this.stripeEnabled = false;
        this.stripeEnabled = !!process.env.STRIPE_SECRET_KEY;
    }
    /**
     * Create payment intent for consultation
     */
    async createPaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            if (!this.stripeEnabled) {
                // Mock payment for development
                return {
                    success: true,
                    paymentIntentId: `pi_mock_${Date.now()}`,
                    clientSecret: `mock_secret_${Date.now()}`
                };
            }
            // Uncomment when Stripe is installed
            /*
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            
            const paymentIntent = await stripe.paymentIntents.create({
              amount: Math.round(amount * 100), // Convert to cents
              currency,
              metadata,
              automatic_payment_methods: {
                enabled: true
              }
            });
      
            return {
              success: true,
              paymentIntentId: paymentIntent.id,
              clientSecret: paymentIntent.client_secret
            };
            */
            console.log('[PAYMENT] Creating payment intent:', { amount, currency, metadata });
            return {
                success: true,
                paymentIntentId: `pi_mock_${Date.now()}`,
                clientSecret: `mock_secret_${Date.now()}`
            };
        }
        catch (error) {
            console.error('[PAYMENT] Error creating payment intent:', error);
            return {
                success: false,
                error: 'Failed to create payment intent'
            };
        }
    }
    /**
     * Confirm payment
     */
    async confirmPayment(paymentIntentId) {
        try {
            if (!this.stripeEnabled) {
                // Mock confirmation
                return {
                    success: true,
                    paymentIntentId
                };
            }
            // Uncomment when Stripe is installed
            /*
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            return {
              success: paymentIntent.status === 'succeeded',
              paymentIntentId: paymentIntent.id
            };
            */
            console.log('[PAYMENT] Confirming payment:', paymentIntentId);
            return {
                success: true,
                paymentIntentId
            };
        }
        catch (error) {
            console.error('[PAYMENT] Error confirming payment:', error);
            return {
                success: false,
                error: 'Failed to confirm payment'
            };
        }
    }
    /**
     * Process refund
     */
    async processRefund(paymentIntentId, amount, reason) {
        try {
            if (!this.stripeEnabled) {
                // Mock refund
                return {
                    success: true,
                    paymentIntentId: `re_mock_${Date.now()}`
                };
            }
            // Uncomment when Stripe is installed
            /*
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            
            const refund = await stripe.refunds.create({
              payment_intent: paymentIntentId,
              amount: amount ? Math.round(amount * 100) : undefined,
              reason: reason || 'requested_by_customer'
            });
      
            return {
              success: refund.status === 'succeeded',
              paymentIntentId: refund.id
            };
            */
            console.log('[PAYMENT] Processing refund:', { paymentIntentId, amount, reason });
            return {
                success: true,
                paymentIntentId: `re_mock_${Date.now()}`
            };
        }
        catch (error) {
            console.error('[PAYMENT] Error processing refund:', error);
            return {
                success: false,
                error: 'Failed to process refund'
            };
        }
    }
    /**
     * Get payment details
     */
    async getPaymentDetails(paymentIntentId) {
        try {
            if (!this.stripeEnabled) {
                // Mock payment details
                return {
                    id: paymentIntentId,
                    amount: 5000,
                    currency: 'usd',
                    status: 'succeeded',
                    created: Date.now()
                };
            }
            // Uncomment when Stripe is installed
            /*
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            return paymentIntent;
            */
            return {
                id: paymentIntentId,
                amount: 5000,
                currency: 'usd',
                status: 'succeeded',
                created: Date.now()
            };
        }
        catch (error) {
            console.error('[PAYMENT] Error getting payment details:', error);
            return null;
        }
    }
    /**
     * Calculate consultation fee
     */
    calculateConsultationFee(consultationType) {
        const fees = {
            'PAID_CONSULTATION': 50,
            'FOLLOW_UP': 30,
            'EMERGENCY': 100,
            'FREE_THREAD_RESPONSE': 0
        };
        return fees[consultationType] || 50;
    }
    /**
     * Create checkout session (for hosted checkout page)
     */
    async createCheckoutSession(amount, successUrl, cancelUrl, metadata = {}) {
        try {
            if (!this.stripeEnabled) {
                // Mock checkout session
                return {
                    sessionId: `cs_mock_${Date.now()}`,
                    url: successUrl
                };
            }
            // Uncomment when Stripe is installed
            /*
            const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
            
            const session = await stripe.checkout.sessions.create({
              payment_method_types: ['card'],
              line_items: [
                {
                  price_data: {
                    currency: 'usd',
                    product_data: {
                      name: 'Medical Consultation',
                      description: metadata.description || 'Online medical consultation'
                    },
                    unit_amount: Math.round(amount * 100)
                  },
                  quantity: 1
                }
              ],
              mode: 'payment',
              success_url: successUrl,
              cancel_url: cancelUrl,
              metadata
            });
      
            return {
              sessionId: session.id,
              url: session.url
            };
            */
            console.log('[PAYMENT] Creating checkout session:', { amount, metadata });
            return {
                sessionId: `cs_mock_${Date.now()}`,
                url: successUrl
            };
        }
        catch (error) {
            console.error('[PAYMENT] Error creating checkout session:', error);
            return {
                error: 'Failed to create checkout session'
            };
        }
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
