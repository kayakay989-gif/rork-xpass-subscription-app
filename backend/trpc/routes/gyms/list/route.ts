import { publicProcedure } from '@/backend/trpc/create-context';
import { db } from '@/backend/lib/db';

export default publicProcedure.query(async () => {
  console.log('[tRPC] Fetching all gyms');
  await db.init();
  const gyms = await db.gyms.getAll();
  console.log(`[tRPC] Found ${gyms.length} gyms`);
  return gyms;
});
