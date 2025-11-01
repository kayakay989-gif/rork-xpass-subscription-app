import { publicProcedure } from "../../../create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default publicProcedure.query(async () => {
  console.log("[ADMIN] Getting all check-ins");
  
  const checkInsData = await AsyncStorage.getItem('db:checkIns');
  const checkIns = checkInsData ? JSON.parse(checkInsData) : [];
  
  const usersData = await AsyncStorage.getItem('db:users');
  const users = usersData ? JSON.parse(usersData) : [];
  
  const gymsData = await AsyncStorage.getItem('db:gyms');
  const gyms = gymsData ? JSON.parse(gymsData) : [];
  
  const subscriptionsData = await AsyncStorage.getItem('db:subscriptions');
  const subscriptions = subscriptionsData ? JSON.parse(subscriptionsData) : [];
  
  const enrichedCheckIns = checkIns.map((checkIn: any) => {
    const user = users.find((u: any) => u.id === checkIn.userId);
    const gym = gyms.find((g: any) => g.id === checkIn.gymId);
    const subscription = subscriptions.find((s: any) => s.id === checkIn.subscriptionId);
    
    return {
      ...checkIn,
      userName: user?.name || 'Unknown',
      userEmail: user?.email || '',
      gymName: gym?.name || 'Unknown Gym',
      tier: subscription?.tier || 'none',
    };
  });
  
  return enrichedCheckIns.sort((a: any, b: any) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
});
