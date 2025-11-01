import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';
import { CheckIn } from '@/types';

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    gymId: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log(`[tRPC] Creating check-in for user ${input.userId} at gym ${input.gymId}`);
    await db.init();

    const subscription = await db.subscriptions.getByUserId(input.userId);
    if (!subscription || !subscription.isActive) {
      throw new Error('No active subscription');
    }

    if (subscription.visitsUsed >= subscription.maxVisitsPerMonth) {
      throw new Error('Monthly visit limit reached');
    }

    const todayCheckIn = await db.checkIns.getTodayCheckIn(input.userId);
    if (todayCheckIn) {
      throw new Error('Already checked in today');
    }

    const gym = await db.gyms.getById(input.gymId);
    if (!gym) {
      throw new Error('Gym not found');
    }

    if (!gym.allowedTiers.includes(subscription.tier)) {
      throw new Error('This gym is not available for your tier');
    }

    const checkIn: CheckIn = {
      id: `ci-${Date.now()}`,
      userId: input.userId,
      gymId: input.gymId,
      timestamp: new Date(),
      subscriptionId: subscription.id,
    };

    await db.checkIns.create(checkIn);
    await db.subscriptions.update(subscription.id, { 
      visitsUsed: subscription.visitsUsed + 1 
    });

    console.log(`[tRPC] Check-in created successfully: ${checkIn.id}`);
    return { success: true, checkIn };
  });
