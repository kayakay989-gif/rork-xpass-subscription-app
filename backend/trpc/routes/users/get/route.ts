import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    console.log(`[tRPC] Fetching user: ${input.userId}`);
    await db.init();
    const user = await db.users.getById(input.userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    console.log(`[tRPC] User found: ${user.name}`);
    return user;
  });
