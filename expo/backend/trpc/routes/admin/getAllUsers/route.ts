import { publicProcedure } from "../../../create-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default publicProcedure.query(async () => {
  console.log("[ADMIN] Getting all users");
  
  const data = await AsyncStorage.getItem('db:users');
  const users = data ? JSON.parse(data) : [];
  
  const subscriptionsData = await AsyncStorage.getItem('db:subscriptions');
  const subscriptions = subscriptionsData ? JSON.parse(subscriptionsData) : [];
  
  const usersWithSubscriptions = users.map((user: any) => {
    const userSubscription = subscriptions.find((s: any) => s.userId === user.id && s.isActive);
    return {
      ...user,
      subscription: userSubscription || null,
    };
  });
  
  return usersWithSubscriptions;
});
