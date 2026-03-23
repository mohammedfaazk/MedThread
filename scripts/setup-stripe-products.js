#!/usr/bin/env node

/**
 * Setup Stripe Products and Prices
 * Run this script to create products and pricing in Stripe
 */

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function setupStripeProducts() {
  console.log('🚀 Setting up Stripe products...\n');

  try {
    // 1. Premium Patient Subscription
    console.log('Creating Premium Patient subscription...');
    const premiumProduct = await stripe.products.create({
      name: 'MedThread Premium',
      description: 'Premium features for patients including AI health predictions, priority support, and advanced analytics',
      metadata: {
        type: 'patient_premium'
      }
    });

    const premiumPrice = await stripe.prices.create({
      product: premiumProduct.id,
      unit_amount: 1999, // $19.99
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`✅ Premium Patient: ${premiumProduct.id} / ${premiumPrice.id}\n`);

    // 2. Doctor Professional Subscription
    console.log('Creating Doctor Professional subscription...');
    const doctorProduct = await stripe.products.create({
      name: 'MedThread Doctor Pro',
      description: 'Professional tools for doctors including analytics dashboard, patient management, and priority listing',
      metadata: {
        type: 'doctor_professional'
      }
    });

    const doctorPrice = await stripe.prices.create({
      product: doctorProduct.id,
      unit_amount: 4900, // $49.00
      currency: 'usd',
      recurring: {
        interval: 'month'
      }
    });

    console.log(`✅ Doctor Professional: ${doctorProduct.id} / ${doctorPrice.id}\n`);

    // 3. Consultation Fee (One-time)
    console.log('Creating Consultation product...');
    const consultationProduct = await stripe.products.create({
      name: 'Doctor Consultation',
      description: 'One-time consultation fee',
      metadata: {
        type: 'consultation'
      }
    });

    const consultationPrice = await stripe.prices.create({
      product: consultationProduct.id,
      unit_amount: 2500, // $25.00
      currency: 'usd'
    });

    console.log(`✅ Consultation: ${consultationProduct.id} / ${consultationPrice.id}\n`);

    // Print summary
    console.log('📋 SUMMARY - Add these to your .env file:\n');
    console.log(`STRIPE_PREMIUM_PRICE_ID=${premiumPrice.id}`);
    console.log(`STRIPE_DOCTOR_PRICE_ID=${doctorPrice.id}`);
    console.log(`STRIPE_CONSULTATION_PRICE_ID=${consultationPrice.id}`);
    console.log('\n✅ Stripe setup complete!');

  } catch (error) {
    console.error('❌ Error setting up Stripe:', error.message);
    process.exit(1);
  }
}

// Run setup
setupStripeProducts();
