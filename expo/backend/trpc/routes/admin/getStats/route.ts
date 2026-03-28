import { publicProcedure } from "../../../create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default publicProcedure.query(async () => {
  console.log("[ADMIN] Getting system stats");
  
  const usersData = await AsyncStorage.getItem('db:users');
  const users = usersData ? JSON.parse(usersData) : [];
  
  const gymsData = await AsyncStorage.getItem('db:gyms');
  const gyms = gymsData ? JSON.parse(gymsData) : [];
  
  const checkInsData = await AsyncStorage.getItem('db:checkIns');
  const checkIns = checkInsData ? JSON.parse(checkInsData) : [];
  
  const subscriptionsData = await AsyncStorage.getItem('db:subscriptions');
  const subscriptions = subscriptionsData ? JSON.parse(subscriptionsData) : [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayCheckIns = checkIns.filter((ci: any) => {
    const ciDate = new Date(ci.timestamp);
    ciDate.setHours(0, 0, 0, 0);
    return ciDate.getTime() === today.getTime();
  });
  
  const activeSubscriptions = subscriptions.filter((s: any) => s.isActive);
  
  const totalRevenue = subscriptions.reduce((sum: number, sub: any) => sum + (sub.totalPrice || 0), 0);
  
  return {
    totalUsers: users.length,
    totalGyms: gyms.length,
    totalCheckIns: checkIns.length,
    todayCheckIns: todayCheckIns.length,
    activeSubscriptions: activeSubscriptions.length,
    totalRevenue,
  };
});
