'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';

interface SubscriptionTier {
  id: number;
  tier_name: string;
  display_name: string;
  description: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  priority_matching: boolean;
  advanced_analytics: boolean;
  featured_listing: boolean;
  top_search_placement: boolean;
  custom_branding: boolean;
  max_consultations_per_month: number;
}

export default function SubscriptionPlans() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<number | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);

  useEffect(() => {
    fetchTiers();
    fetchCurrentSubscription();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await apiClient.get('/revenue/subscription-tiers');
      if (response.data.success) {
        setTiers(response.data.data.tiers);
      }
    } catch (error) {
      console.error('Error fetching tiers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSubscription = async () => {
    try {
      const response = await apiClient.get('/revenue/my-subscription');
      if (response.data.success) {
        setCurrentSubscription(response.data.data.subscription);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    }
  };

  const handleSubscribe = async (tierId: number) => {
    setSubscribing(tierId);

    try {
      const response = await apiClient.post('/revenue/subscribe', {
        tierId,
        billingCycle,
        paymentMethod: 'credit_card'
      });

      if (response.data.success) {
        alert('Subscription successful!');
        fetchCurrentSubscription();
      }
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to subscribe');
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading plans...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-xl text-gray-600 mb-8">
          Unlock premium features and grow your practice
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'monthly'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              billingCycle === 'annual'
                ? 'bg-white text-blue-600 shadow'
                : 'text-gray-600'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Current Subscription Banner */}
      {currentSubscription && (
        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            <span className="font-medium">Current Plan:</span>{' '}
            {currentSubscription.display_name} •{' '}
            <span className="text-sm">
              Renews on {new Date(currentSubscription.next_billing_date).toLocaleDateString()}
            </span>
          </p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tiers.map((tier) => {
          const price = billingCycle === 'monthly' ? tier.monthly_price : tier.annual_price;
          const isCurrentPlan = currentSubscription?.tier_name === tier.tier_name;
          const isPopular = tier.tier_name === 'professional';

          return (
            <div
              key={tier.id}
              className={`relative bg-white rounded-xl shadow-lg p-6 ${
                isPopular ? 'ring-2 ring-blue-600' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{tier.display_name}</h3>
                <p className="text-gray-600 text-sm mb-4">{tier.description}</p>
                
                <div className="mb-4">
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-gray-600">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </div>

                {tier.max_consultations_per_month > 0 && (
                  <p className="text-sm text-gray-500">
                    Up to {tier.max_consultations_per_month} consultations/month
                  </p>
                )}
                {tier.max_consultations_per_month === -1 && (
                  <p className="text-sm text-gray-500">Unlimited consultations</p>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <svg
                      className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}

                {tier.priority_matching && (
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Priority in patient matching</span>
                  </li>
                )}

                {tier.featured_listing && (
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Featured profile listing</span>
                  </li>
                )}

                {tier.top_search_placement && (
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Top search placement</span>
                  </li>
                )}

                {tier.custom_branding && (
                  <li className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom branding</span>
                  </li>
                )}
              </ul>

              {/* CTA Button */}
              <button
                onClick={() => handleSubscribe(tier.id)}
                disabled={subscribing === tier.id || isCurrentPlan}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isCurrentPlan
                    ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                    : isPopular
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                } disabled:opacity-50`}
              >
                {subscribing === tier.id
                  ? 'Processing...'
                  : isCurrentPlan
                  ? 'Current Plan'
                  : tier.tier_name === 'free'
                  ? 'Get Started'
                  : 'Upgrade Now'}
              </button>
            </div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-center mb-8">Feature Comparison</h2>
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Feature</th>
                {tiers.map((tier) => (
                  <th key={tier.id} className="px-6 py-3 text-center text-sm font-medium text-gray-900">
                    {tier.display_name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Priority Matching</td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {tier.priority_matching ? '✓' : '−'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Advanced Analytics</td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {tier.advanced_analytics ? '✓' : '−'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Featured Listing</td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {tier.featured_listing ? '✓' : '−'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Top Search Placement</td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {tier.top_search_placement ? '✓' : '−'}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="px-6 py-4 text-sm text-gray-900">Custom Branding</td>
                {tiers.map((tier) => (
                  <td key={tier.id} className="px-6 py-4 text-center">
                    {tier.custom_branding ? '✓' : '−'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
