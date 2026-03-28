import { publicProcedure } from "../../../create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

export default publicProcedure
  .input(z.object({
    id: z.string(),
  }))
  .mutation(async ({ input }) => {
    console.log("[ADMIN] Deleting gym:", input.id);
    
    const gymsData = await AsyncStorage.getItem('db:gyms');
    const gyms = gymsData ? JSON.parse(gymsData) : [];
    
    const filteredGyms = gyms.filter((g: any) => g.id !== input.id);
    await AsyncStorage.setItem('db:gyms', JSON.stringify(filteredGyms));
    
    return { success: true };
  });
