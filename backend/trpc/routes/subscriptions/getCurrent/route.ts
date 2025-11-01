import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    console.log(`[tRPC] Fetching current subscription for user: ${input.userId}`);
    await db.init();
    const subscription = await db.subscriptions.getByUserId(input.userId);
    console.log(`[tRPC] Subscription found: ${subscription ? subscription.id : 'none'}`);
    return subscription;
  });
