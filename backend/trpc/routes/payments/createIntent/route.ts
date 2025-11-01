import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import Stripe from 'stripe';
import { Payment, SubscriptionTier, SubscriptionDuration } from '@/types';
import { db } from '@/backend/lib/db';

const STRIPE_SECRET_KEY = process.env['STRIPE_SECRET_KEY'] || 'sk_test_51QcfItLeBPG2DmvtLmGwQaJL8qFrkAZ3n7KOKMzhKy5DWZMULQRwYVL3FJ3hF0FPgGKXHF9Yh8hB4sNkQKxfpvHp00nj2O0Z0g';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
});

const TIER_PRICES: Record<SubscriptionTier, number> = {
  silver: 65,
  gold: 90,
  diamond: 125,
  elite: 250,
};

const DURATION_DISCOUNTS: Record<SubscriptionDuration, number> = {
  1: 0,
  3: 0.15,
  6: 0.20,
  9: 0.25,
  12: 0.30,
};

function calculateSubscriptionPrice(
  tier: SubscriptionTier,
  duration: SubscriptionDuration
): { monthlyPrice: number; totalPrice: number } {
  const basePrice = TIER_PRICES[tier];
  const discount = DURATION_DISCOUNTS[duration];
  const monthlyPrice = Math.round(basePrice * (1 - discount));
  const totalPrice = monthlyPrice * duration;
  
  return { monthlyPrice, totalPrice };
}

export default publicProcedure
  .input(z.object({
    userId: z.string(),
    tier: z.enum(['silver', 'gold', 'diamond', 'elite']),
    duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(9), z.literal(12)]),
  }))
  .mutation(async ({ input }) => {
    console.log(`[tRPC] Creating payment intent for user ${input.userId}: ${input.tier} - ${input.duration} months`);
    await db.init();

    const { totalPrice } = calculateSubscriptionPrice(input.tier, input.duration);
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100),
      currency: 'jod',
      metadata: {
        userId: input.userId,
        tier: input.tier,
        duration: input.duration.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    const payment: Payment = {
      id: `pay-${Date.now()}`,
      userId: input.userId,
      subscriptionId: '',
      amount: totalPrice,
      currency: 'JOD',
      status: 'pending',
      paymentIntentId: paymentIntent.id,
      tier: input.tier,
      duration: input.duration,
      createdAt: new Date(),
    };

    console.log(`[tRPC] Payment intent created: ${paymentIntent.id}`);
    
    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      payment,
    };
  });
