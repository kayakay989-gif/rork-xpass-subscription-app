import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';
import { Subscription, SubscriptionTier, SubscriptionDuration } from '@/types';

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
    console.log(`[tRPC] Creating subscription for user ${input.userId}: ${input.tier} - ${input.duration} months`);
    await db.init();

    const { monthlyPrice, totalPrice } = calculateSubscriptionPrice(input.tier, input.duration);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + input.duration);

    const subscription: Subscription = {
      id: `sub-${Date.now()}`,
      userId: input.userId,
      tier: input.tier,
      duration: input.duration,
      startDate,
      endDate,
      monthlyPrice,
      totalPrice,
      visitsUsed: 0,
      maxVisitsPerMonth: 30,
      isActive: true,
    };

    await db.subscriptions.create(subscription);
    console.log(`[tRPC] Subscription created: ${subscription.id}`);
    
    return subscription;
  });
