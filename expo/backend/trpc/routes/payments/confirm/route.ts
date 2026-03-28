import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import Stripe from 'stripe';
import { Subscription } from '@/types';
import { db } from '@/backend/lib/db';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'] || 'sk_test_51QcfItLeBPG2DmvtLmGwQaJL8qFrkAZ3n7KOKMzhKy5DWZMULQRwYVL3FJ3hF0FPgGKXHF9Yh8hB4sNkQKxfpvHp00nj2O0Z0g';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

const TIER_PRICES: Record<string, number> = {
  silver: 65,
  gold: 90,
  diamond: 125,
  elite: 250,
};

const DURATION_DISCOUNTS: Record<number, number> = {
  1: 0,
  3: 0.15,
  6: 0.20,
  9: 0.25,
  12: 0.30,
};

function calculateSubscriptionPrice(tier: string, duration: number): { monthlyPrice: number; totalPrice: number } {
  const basePrice = TIER_PRICES[tier];
  const discount = DURATION_DISCOUNTS[duration];
  const monthlyPrice = Math.round(basePrice * (1 - discount));
  const totalPrice = monthlyPrice * duration;
  
  return { monthlyPrice, totalPrice };
}

export default publicProcedure
  .input(z.object({
    paymentIntentId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log(`[tRPC] Confirming payment: ${input.paymentIntentId}`);
    await db.init();

    const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error(`Payment not successful. Status: ${paymentIntent.status}`);
    }

    const userId = paymentIntent.metadata.userId;
    const tier = paymentIntent.metadata.tier as 'silver' | 'gold' | 'diamond' | 'elite';
    const duration = parseInt(paymentIntent.metadata.duration) as 1 | 3 | 6 | 9 | 12;

    const { monthlyPrice, totalPrice } = calculateSubscriptionPrice(tier, duration);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + duration);

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId,
      tier,
      duration,
      startDate,
      endDate,
      monthlyPrice,
      totalPrice,
      visitsUsed: 0,
      maxVisitsPerMonth: 30,
      isActive: true,
    };

    await db.subscriptions.create(subscription);
    console.log(`[tRPC] Subscription created after payment: ${subscription.id}`);
    
    return {
      success: true,
      subscription,
    };
  });
