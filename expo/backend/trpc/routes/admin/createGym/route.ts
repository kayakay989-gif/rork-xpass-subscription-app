import { publicProcedure } from "../../../create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";

export default publicProcedure
  .input(z.object({
    name: z.string(),
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    category: z.enum(['gym', 'crossfit', 'yoga', 'pilates', 'boxing', 'mma']),
  }))
  .mutation(async ({ input }) => {
    console.log("[ADMIN] Creating new gym:", input);
    
    const gymsData = await AsyncStorage.getItem('db:gyms');
    const gyms = gymsData ? JSON.parse(gymsData) : [];
    
    const newId = String(gyms.length + 1);
    const newGym = {
      id: newId,
      ...input,
    };
    
    gyms.push(newGym);
    await AsyncStorage.setItem('db:gyms', JSON.stringify(gyms));
    
    return newGym;
  });
