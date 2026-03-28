import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure
  .input(z.object({ userId: z.string() }))
  .query(async ({ input }) => {
    console.log(`[tRPC] Fetching check-ins for user: ${input.userId}`);
    await db.init();
    const checkIns = await db.checkIns.getByUserId(input.userId);
    console.log(`[tRPC] Found ${checkIns.length} check-ins`);
    return checkIns;
  });
