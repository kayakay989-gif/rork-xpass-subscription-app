import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input }) => {
    console.log(`[tRPC] Fetching gym with id: ${input.id}`);
    await db.init();
    const gym = await db.gyms.getById(input.id);
    
    if (!gym) {
      throw new Error('Gym not found');
    }
    
    return gym;
  });
