import { publicProcedure } from "../../../create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default publicProcedure.query(async () => {
  console.log("[ADMIN] Getting all gyms");
  
  const gymsData = await AsyncStorage.getItem('db:gyms');
  const gyms = gymsData ? JSON.parse(gymsData) : [];
  
  const checkInsData = await AsyncStorage.getItem('db:checkIns');
  const checkIns = checkInsData ? JSON.parse(checkInsData) : [];
  
  const gymsWithStats = gyms.map((gym: any) => {
    const gymCheckIns = checkIns.filter((ci: any) => ci.gymId === gym.id);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCheckIns = gymCheckIns.filter((ci: any) => {
      const ciDate = new Date(ci.timestamp);
      ciDate.setHours(0, 0, 0, 0);
      return ciDate.getTime() === today.getTime();
    });
    
    return {
      ...gym,
      totalCheckIns: gymCheckIns.length,
      todayCheckIns: todayCheckIns.length,
    };
  });
  
  return gymsWithStats;
});
