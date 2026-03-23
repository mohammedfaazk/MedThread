import { Router } from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/auth';
import { prisma } from '@medthread/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const router = Router();

const PLANS = {
  basic: {
    month: process.env.STRIPE_BASIC_MONTHLY_PRICE_ID,
    year: process.env.STRIPE_BASIC_YEARLY_PRICE_ID
  },
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    year: process.env.STRIPE_PRO_YEARLY_PRICE_ID
  },
  premium: {
    month: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID,
    year: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID
  }
};

router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { planId, interval } = req.body;

    const priceId = PLANS[planId as keyof typeof PLANS]?.[interval as 'month' | 'year'];
    
    if (!priceId) {
      return res.status(400).json({ error: 'Invalid plan or interval' });
    }

    const session = await stripe.checkout.sessions.create({
      customer_email: req.user!.email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments`,
      metadata: {
        userId,
        planId,
        interval
      }
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'] as string;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutComplete(session);
        break;

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).send('Webhook Error');
  }
});

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const { userId, planId, interval } = session.metadata!;

  await prisma.subscription.create({
    data: {
      userId,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string,
      plan: planId,
      interval,
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + (interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000)
    }
  });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    }
  });
}

router.get('/subscription', authenticate, async (req, res) => {
  try {
    const userId = req.user!.id;
    const subscription = await prisma.subscription.findFirst({
      where: { userId, status: 'active' }
    });
    res.json(subscription);
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

export default router;
