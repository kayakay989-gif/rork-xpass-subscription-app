import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure
  .input(z.object({ 
    userId: z.string(),
    amount: z.number(),
  }))
  .mutation(async ({ input }) => {
    console.log(`[tRPC] Updating wallet for user ${input.userId}: ${input.amount}`);
    await db.init();
    
    const user = await db.users.getById(input.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updatedUser = await db.users.update(input.userId, {
      walletBalance: user.walletBalance + input.amount,
    });

    if (!updatedUser) {
      throw new Error('Failed to update wallet');
    }

    console.log(`[tRPC] Wallet updated successfully. New balance: ${updatedUser.walletBalance}`);
    return updatedUser;
  });
