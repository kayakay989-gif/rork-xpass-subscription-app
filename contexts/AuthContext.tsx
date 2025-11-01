import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { User } from '@/types';
import { trpc } from '@/lib/trpc';
import AsyncStorage from '@react-native-async-storage/async-storage';

function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const savedUserId = await AsyncStorage.getItem('userId');
        const savedIsGuest = await AsyncStorage.getItem('isGuest');
        if (savedUserId) {
          setUserId(savedUserId);
        }
        if (savedIsGuest === 'true') {
          setIsGuest(true);
        }
      } catch (error) {
        console.error('[AuthContext] Error loading auth:', error);
      } finally {
        setIsLoadingAuth(false);
      }
    };
    loadAuth();
  }, []);

  const userQuery = trpc.users.get.useQuery(
    { userId: userId || '' },
    { enabled: !!userId }
  );

  const user = userQuery.data || null;
  const isLoading = isLoadingAuth || userQuery.isLoading;

  const login = useCallback(async (newUserId: string): Promise<void> => {
    console.log('[AuthContext] Login with userId:', newUserId);
    setUserId(newUserId);
    setIsGuest(false);
    await AsyncStorage.setItem('userId', newUserId);
    await AsyncStorage.setItem('isGuest', 'false');
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    console.log('[AuthContext] Logout');
    setUserId(null);
    setIsGuest(false);
    await AsyncStorage.removeItem('userId');
    await AsyncStorage.removeItem('isGuest');
  }, []);

  const updateWalletMutation = trpc.users.updateWallet.useMutation({
    onSuccess: () => {
      console.log('[AuthContext] Wallet updated, refetching user...');
      userQuery.refetch();
    },
  });

  const updateWalletBalance = useCallback(async (amount: number): Promise<void> => {
    if (!userId) return;
    try {
      await updateWalletMutation.mutateAsync({ userId, amount });
    } catch (error) {
      console.error('[AuthContext] Update wallet error:', error);
      throw error;
    }
  }, [userId, updateWalletMutation]);

  const continueAsGuest = useCallback(async () => {
    console.log('[AuthContext] Continue as guest');
    setIsGuest(true);
    setUserId(null);
    await AsyncStorage.setItem('isGuest', 'true');
    await AsyncStorage.removeItem('userId');
  }, []);

  return useMemo(() => {
    return {
      user,
      isLoading,
      isAuthenticated: !!user,
      isGuest,
      login,
      logout,
      updateWalletBalance,
      continueAsGuest,
    };
  }, [user, isLoading, isGuest, login, logout, updateWalletBalance, continueAsGuest]);
});
