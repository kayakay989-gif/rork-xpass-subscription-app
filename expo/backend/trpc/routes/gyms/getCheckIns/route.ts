import { z } from 'zod';
import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';
import { CheckIn } from '@/types';

type CheckInWithDetails = CheckIn & {
  userName: string;
  userEmail?: string;
  tier: 'silver' | 'gold' | 'diamond' | 'elite';
};

export default publicProcedure
  .input(z.object({ 
    gymId: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }))
  .query(async ({ input }) => {
    console.log(`[tRPC] Fetching check-ins for gym: ${input.gymId}`);
    await db.init();
    
    const allCheckIns = await db.checkIns.getByGymId(input.gymId);
    
    let filteredCheckIns = allCheckIns;
    
    if (input.startDate || input.endDate) {
      filteredCheckIns = allCheckIns.filter((ci: CheckIn) => {
        const ciDate = new Date(ci.timestamp);
        const start = input.startDate ? new Date(input.startDate) : null;
        const end = input.endDate ? new Date(input.endDate) : null;
        
        if (start && ciDate < start) return false;
        if (end && ciDate > end) return false;
        
        return true;
      });
    }
    
    const checkInsWithDetails: CheckInWithDetails[] = await Promise.all(
      filteredCheckIns.map(async (ci: CheckIn) => {
        const user = await db.users.getById(ci.userId);
        const subscription = await db.subscriptions.getByUserId(ci.userId);
        
        return {
          ...ci,
          userName: user?.name || 'Unknown',
          userEmail: user?.email,
          tier: subscription?.tier || 'silver',
        } as CheckInWithDetails;
      })
    );
    
    console.log(`[tRPC] Found ${checkInsWithDetails.length} check-ins`);
    return checkInsWithDetails;
  });
