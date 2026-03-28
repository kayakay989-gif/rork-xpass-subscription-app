import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { Subscription, Gym, CheckIn, SubscriptionTier, SubscriptionDuration } from '@/types';
import { trpc } from '@/lib/trpc';
import { useAuth } from './AuthContext';

const TIER_PRICES: Record<SubscriptionTier, number> = {
  silver: 65,
  gold: 90,
  diamond: 125,
  elite: 250,
};

const DURATION_DISCOUNTS: Record<SubscriptionDuration, number> = {
  1: 0,
  3: 0.15,
  6: 0.20,
  9: 0.25,
  12: 0.30,
};

export function calculateSubscriptionPrice(tier: SubscriptionTier, duration: SubscriptionDuration): { monthlyPrice: number; totalPrice: number } {
  const basePrice = TIER_PRICES[tier];
  const discount = DURATION_DISCOUNTS[duration];
  const monthlyPrice = Math.round(basePrice * (1 - discount));
  const totalPrice = monthlyPrice * duration;
  
  return { monthlyPrice, totalPrice };
}

export const [AppProvider, useApp] = createContextHook(() => {
  const { user } = useAuth();
  const userId = user?.id || '1';

  const subscriptionQuery = trpc.subscriptions.getCurrent.useQuery(
    { userId },
    { enabled: !!userId }
  );
  
  const gymsQuery = trpc.gyms.list.useQuery();
  
  const checkInsQuery = trpc.checkIns.list.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const subscription = subscriptionQuery.data || null;
  const gyms = gymsQuery.data || [];
  const checkIns = checkInsQuery.data || [];

  const [selectedGymFilter, setSelectedGymFilter] = useState<SubscriptionTier | 'all'>('all');

  const checkInMutation = trpc.checkIns.create.useMutation({
    onSuccess: () => {
      console.log('[AppContext] Check-in successful, refetching data...');
      checkInsQuery.refetch();
      subscriptionQuery.refetch();
    },
  });

  const checkIn = useCallback(async (gymId: string): Promise<{ success: boolean; message: string }> => {
    try {
      const result = await checkInMutation.mutateAsync({ userId, gymId });
      return { success: true, message: 'Check-in successful!' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Check-in failed';
      console.error('[AppContext] Check-in error:', errorMessage);
      return { success: false, message: errorMessage };
    }
  }, [userId, checkInMutation]);

  const createSubscriptionMutation = trpc.subscriptions.create.useMutation({
    onSuccess: () => {
      console.log('[AppContext] Subscription created, refetching data...');
      subscriptionQuery.refetch();
    },
  });

  const createSubscription = useCallback(async (tier: SubscriptionTier, duration: SubscriptionDuration): Promise<void> => {
    try {
      await createSubscriptionMutation.mutateAsync({ userId, tier, duration });
    } catch (error) {
      console.error('[AppContext] Create subscription error:', error);
      throw error;
    }
  }, [userId, createSubscriptionMutation]);

  const filteredGyms = useMemo(() => {
    if (selectedGymFilter === 'all') return gyms;
    return gyms.filter(gym => gym.allowedTiers.includes(selectedGymFilter));
  }, [gyms, selectedGymFilter]);

  return useMemo(() => {
    return {
      subscription,
      gyms,
      filteredGyms,
      checkIns,
      selectedGymFilter,
      setSelectedGymFilter,
      checkIn,
      createSubscription,
      isLoading: subscriptionQuery.isLoading || gymsQuery.isLoading || checkInsQuery.isLoading,
      isCheckingIn: checkInMutation.isPending,
    };
  }, [subscription, gyms, filteredGyms, checkIns, selectedGymFilter, checkIn, createSubscription, subscriptionQuery.isLoading, gymsQuery.isLoading, checkInsQuery.isLoading, checkInMutation.isPending]);
});
