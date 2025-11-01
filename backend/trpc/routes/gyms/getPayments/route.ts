import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure
  .input(z.object({ 
    gymId: z.string(),
  }))
  .query(async ({ input }) => {
    console.log(`[tRPC] Fetching payments for gym: ${input.gymId}`);
    await db.init();
    
    const payments = await db.payments.getByGymId(input.gymId);
    
    console.log(`[tRPC] Found ${payments.length} payments`);
    return payments;
  });
