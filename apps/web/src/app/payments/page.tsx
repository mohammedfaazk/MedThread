'use client';

import { useState } from 'react';
import { CreditCard, Check, Zap, Star, Crown } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
  icon: any;
  color: string;
}

export default function PaymentsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');

  const plans: Plan[] = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingInterval === 'month' ? 9.99 : 99.99,
      interval: billingInterval,
      icon: Check,
      color: 'gray',
      features: [
        'Unlimited posts and comments',
        'Join communities',
        'Basic health tracking',
        'Search doctors',
        'In-app messaging',
        'Email support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingInterval === 'month' ? 19.99 : 199.99,
      interval: billingInterval,
      icon: Zap,
      color: 'blue',
      popular: true,
      features: [
        'Everything in Basic',
        'Priority doctor matching',
        'AI health risk predictor',
        'Medication tracker',
        'Symptom diary',
        'Health timeline',
        'Priority support',
        'Ad-free experience'
      ]
    },
    {
      id: 'premium',
      name: 'Premium',
      price: billingInterval === 'month' ? 39.99 : 399.99,
      interval: billingInterval,
      icon: Crown,
      color: 'purple',
      features: [
        'Everything in Pro',
        'Personalized AI diet plans',
        'Video consultations',
        'Health challenges',
        'Advanced analytics',
        'Export health data',
        'Dedicated support',
        'Early access to features'
      ]
    }
  ];

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    
    try {
      const response = await fetch('/api/v1/payments/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          planId,
          interval: billingInterval
        })
      });

      const { sessionId } = await response.json();
      
      const stripe = await stripePromise;
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId });
        
        if (error) {
          console.error('Stripe error:', error);
          alert('Payment failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Unlock premium features and take control of your health
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm">
            <button
              onClick={() => setBillingInterval('month')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                billingInterval === 'month'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                billingInterval === 'year'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isPopular = plan.popular;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-transform hover:scale-105 ${
                  isPopular ? 'ring-2 ring-blue-600' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                    Most Popular
                  </div>
                )}

                <div className="p-8">
                  <div className={`inline-flex p-3 bg-${plan.color}-100 rounded-xl mb-4`}>
                    <Icon className={`h-8 w-8 text-${plan.color}-600`} />
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                    <span className="text-gray-600">/{plan.interval}</span>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loading === plan.id}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors mb-6 ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading === plan.id ? 'Processing...' : 'Get Started'}
                  </button>

                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, debit cards, and digital wallets through Stripe.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my payment information secure?</h3>
              <p className="text-gray-600 text-sm">
                Yes, all payments are processed securely through Stripe. We never store your payment information.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I upgrade or downgrade my plan?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can change your plan at any time. Changes will be prorated based on your billing cycle.
              </p>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">Trusted by thousands of users worldwide</p>
          <div className="flex items-center justify-center gap-8 text-gray-400">
            <div className="flex items-center gap-2">
              <CreditCard className="h-6 w-6" />
              <span className="text-sm">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-6 w-6" />
              <span className="text-sm">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-6 w-6" />
              <span className="text-sm">4.9/5 Rating</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
