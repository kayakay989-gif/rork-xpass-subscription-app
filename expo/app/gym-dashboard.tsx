import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Users, Calendar, DollarSign, Filter, QrCode } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';


const TIER_COLORS = {
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
  elite: '#9333EA',
} as const;

export default function GymDashboardScreen() {
  const { gymId } = useLocalSearchParams<{ gymId: string }>();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'week'>('all');
  const [showQR, setShowQR] = useState<boolean>(false);

  const gymQuery = trpc.gyms.getById.useQuery({ id: gymId || '1' });
  const checkInsQuery = trpc.gyms.getCheckIns.useQuery(
    { gymId: gymId || '1' },
    { refetchInterval: 10000 }
  );
  const paymentsQuery = trpc.gyms.getPayments.useQuery({ gymId: gymId || '1' });

  const gym = gymQuery.data;
  const checkIns = checkInsQuery.data || [];
  const payments = paymentsQuery.data || [];

  const safeCheckIns = useMemo(() => checkIns, [checkIns]);
  const safePayments = useMemo(() => payments, [payments]);

  const filteredCheckIns = useMemo(() => {
    let filtered = safeCheckIns;

    if (searchQuery) {
      filtered = filtered.filter(
        (ci) =>
          ci.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ci.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const now = new Date();
    if (selectedFilter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((ci) => {
        const ciDate = new Date(ci.timestamp);
        ciDate.setHours(0, 0, 0, 0);
        return ciDate.getTime() === today.getTime();
      });
    } else if (selectedFilter === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter((ci) => new Date(ci.timestamp) >= weekAgo);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [safeCheckIns, searchQuery, selectedFilter]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCheckIns = safeCheckIns.filter((ci) => {
      const ciDate = new Date(ci.timestamp);
      ciDate.setHours(0, 0, 0, 0);
      return ciDate.getTime() === today.getTime();
    });

    return {
      totalToday: todayCheckIns.length,
      totalWeek: safeCheckIns.filter(
        (ci) => new Date(ci.timestamp) >= new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      totalMonth: safeCheckIns.filter(
        (ci) => new Date(ci.timestamp) >= new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      ).length,
      pendingPayments: safePayments.filter((p) => p.status === 'pending').length,
    };
  }, [safeCheckIns, safePayments]);

  const onRefresh = () => {
    checkInsQuery.refetch();
    paymentsQuery.refetch();
    gymQuery.refetch();
  };

  if (gymQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  if (!gym) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Gym not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Dashboard',
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#fff',
          headerRight: () => (
            <TouchableOpacity onPress={() => setShowQR(!showQR)} style={styles.headerButton}>
              <QrCode size={24} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={checkInsQuery.isRefetching} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
          <Text style={styles.gymName}>{gym.name}</Text>
          <Text style={styles.gymAddress}>{gym.address}</Text>
        </LinearGradient>

        {showQR && (
          <View style={styles.qrContainer}>
            <Text style={styles.qrTitle}>Gym QR Code</Text>
            <View style={styles.qrBox}>
              <Image
                source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(gymId || '1')}` }}
                style={styles.qrImage}
              />
            </View>
            <Text style={styles.qrSubtitle}>Members scan this to check in</Text>
            <Text style={styles.qrCode}>Code: {gymId || '1'}</Text>
          </View>
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Users size={28} color="#4F46E5" />
            <Text style={styles.statValue}>{stats.totalToday}</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={28} color="#10B981" />
            <Text style={styles.statValue}>{stats.totalWeek}</Text>
            <Text style={styles.statLabel}>This Week</Text>
          </View>

          <View style={styles.statCard}>
            <Calendar size={28} color="#F59E0B" />
            <Text style={styles.statValue}>{stats.totalMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>

          <View style={styles.statCard}>
            <DollarSign size={28} color="#EF4444" />
            <Text style={styles.statValue}>{stats.pendingPayments}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-ins</Text>

          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'all' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('all')}
            >
              <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'today' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('today')}
            >
              <Text style={[styles.filterText, selectedFilter === 'today' && styles.filterTextActive]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, selectedFilter === 'week' && styles.filterButtonActive]}
              onPress={() => setSelectedFilter('week')}
            >
              <Text style={[styles.filterText, selectedFilter === 'week' && styles.filterTextActive]}>This Week</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Filter size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {checkInsQuery.isLoading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={styles.loader} />
          ) : filteredCheckIns.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No check-ins found</Text>
            </View>
          ) : (
            filteredCheckIns.map((checkIn) => {
              const checkInDate = new Date(checkIn.timestamp);
              return (
                <View key={checkIn.id} style={styles.checkInCard}>
                  <View style={styles.checkInHeader}>
                    <View style={styles.checkInUser}>
                      <View
                        style={[
                          styles.tierBadge,
                          { backgroundColor: TIER_COLORS[checkIn.tier] + '20' },
                        ]}
                      >
                        <Text style={[styles.tierText, { color: TIER_COLORS[checkIn.tier] }]}>
                          {checkIn.tier.toUpperCase()}
                        </Text>
                      </View>
                      <View>
                        <Text style={styles.checkInName}>{checkIn.userName}</Text>
                        {checkIn.userEmail && (
                          <Text style={styles.checkInEmail}>{checkIn.userEmail}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.checkInFooter}>
                    <Text style={styles.checkInTime}>
                      {checkInDate.toLocaleDateString()} at {checkInDate.toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F9FAFB',
  },
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  headerButton: {
    marginRight: 16,
    padding: 8,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  gymName: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginBottom: 8,
  },
  gymAddress: {
    fontSize: 16,
    color: '#E0E7FF',
  },
  qrContainer: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  qrBox: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrCode: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#4F46E5',
    marginTop: 8,
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 16,
    textAlign: 'center' as const,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row' as const,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
  },
  loader: {
    marginVertical: 32,
  },
  emptyState: {
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 16,
  },
  checkInCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  checkInHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 12,
  },
  checkInUser: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontWeight: 'bold' as const,
  },
  checkInName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  checkInEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  checkInFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  checkInTime: {
    fontSize: 14,
    color: '#6B7280',
  },
});
