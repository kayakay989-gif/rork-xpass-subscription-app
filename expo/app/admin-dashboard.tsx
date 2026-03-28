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
} from 'react-native';
import { Stack } from 'expo-router';
import { trpc } from '@/lib/trpc';
import {
  Shield,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Search,
  TrendingUp,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

type TabType = 'overview' | 'users' | 'gyms' | 'checkins';

const TIER_COLORS = {
  silver: '#C0C0C0',
  gold: '#FFD700',
  diamond: '#B9F2FF',
  elite: '#9333EA',
  none: '#9CA3AF',
} as const;

export default function AdminDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const statsQuery = trpc.admin.getStats.useQuery();
  const usersQuery = trpc.admin.getAllUsers.useQuery();
  const gymsQuery = trpc.admin.getAllGyms.useQuery();
  const checkInsQuery = trpc.admin.getAllCheckIns.useQuery();

  const stats = statsQuery.data;
  const rawUsers = usersQuery.data || [];
  const rawGyms = gymsQuery.data || [];
  const rawCheckIns = checkInsQuery.data || [];

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return rawUsers;
    return rawUsers.filter(
      (u: any) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawUsers, searchQuery]);

  const filteredGyms = useMemo(() => {
    if (!searchQuery) return rawGyms;
    return rawGyms.filter(
      (g: any) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawGyms, searchQuery]);

  const filteredCheckIns = useMemo(() => {
    if (!searchQuery) return rawCheckIns;
    return rawCheckIns.filter(
      (ci: any) =>
        ci.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ci.gymName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rawCheckIns, searchQuery]);

  const onRefresh = () => {
    statsQuery.refetch();
    usersQuery.refetch();
    gymsQuery.refetch();
    checkInsQuery.refetch();
  };

  const isRefreshing =
    statsQuery.isRefetching ||
    usersQuery.isRefetching ||
    gymsQuery.isRefetching ||
    checkInsQuery.isRefetching;

  if (statsQuery.isLoading || usersQuery.isLoading || gymsQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Admin Dashboard',
          headerStyle: { backgroundColor: '#DC2626' },
          headerTintColor: '#fff',
        }}
      />

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        <LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.header}>
          <Shield size={32} color="#fff" />
          <Text style={styles.headerTitle}>System Dashboard</Text>
          <Text style={styles.headerSubtitle}>Complete system overview and control</Text>
        </LinearGradient>

        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <TrendingUp size={20} color={activeTab === 'overview' ? '#DC2626' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'overview' && styles.tabTextActive]}>
              Overview
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <Users size={20} color={activeTab === 'users' ? '#DC2626' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              Users
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'gyms' && styles.tabActive]}
            onPress={() => setActiveTab('gyms')}
          >
            <Building2 size={20} color={activeTab === 'gyms' ? '#DC2626' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'gyms' && styles.tabTextActive]}>Gyms</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'checkins' && styles.tabActive]}
            onPress={() => setActiveTab('checkins')}
          >
            <Calendar size={20} color={activeTab === 'checkins' ? '#DC2626' : '#6B7280'} />
            <Text style={[styles.tabText, activeTab === 'checkins' && styles.tabTextActive]}>
              Check-ins
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'overview' && (
          <View style={styles.content}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Users size={32} color="#DC2626" />
                <Text style={styles.statValue}>{stats?.totalUsers || 0}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>

              <View style={styles.statCard}>
                <Building2 size={32} color="#10B981" />
                <Text style={styles.statValue}>{stats?.totalGyms || 0}</Text>
                <Text style={styles.statLabel}>Total Gyms</Text>
              </View>

              <View style={styles.statCard}>
                <Calendar size={32} color="#F59E0B" />
                <Text style={styles.statValue}>{stats?.totalCheckIns || 0}</Text>
                <Text style={styles.statLabel}>All Check-ins</Text>
              </View>

              <View style={styles.statCard}>
                <Calendar size={32} color="#8B5CF6" />
                <Text style={styles.statValue}>{stats?.todayCheckIns || 0}</Text>
                <Text style={styles.statLabel}>Today</Text>
              </View>

              <View style={styles.statCard}>
                <DollarSign size={32} color="#EF4444" />
                <Text style={styles.statValue}>{stats?.activeSubscriptions || 0}</Text>
                <Text style={styles.statLabel}>Active Subs</Text>
              </View>

              <View style={styles.statCard}>
                <DollarSign size={32} color="#059669" />
                <Text style={styles.statValue}>${stats?.totalRevenue || 0}</Text>
                <Text style={styles.statLabel}>Revenue</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              {rawCheckIns.slice(0, 5).map((checkIn: any) => {
                const checkInDate = new Date(checkIn.timestamp);
                return (
                  <View key={checkIn.id} style={styles.activityCard}>
                    <View style={styles.activityHeader}>
                      <View
                        style={[
                          styles.tierBadge,
                          { backgroundColor: TIER_COLORS[checkIn.tier as keyof typeof TIER_COLORS] + '20' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tierText,
                            { color: TIER_COLORS[checkIn.tier as keyof typeof TIER_COLORS] },
                          ]}
                        >
                          {checkIn.tier.toUpperCase()}
                        </Text>
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityUser}>{checkIn.userName}</Text>
                        <Text style={styles.activityGym}>at {checkIn.gymName}</Text>
                      </View>
                    </View>
                    <Text style={styles.activityTime}>
                      {checkInDate.toLocaleDateString()} at {checkInDate.toLocaleTimeString()}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {activeTab === 'users' && (
          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {filteredUsers.map((user: any) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userIcon}>
                    <Users size={24} color="#DC2626" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    {user.subscription && (
                      <View
                        style={[
                          styles.tierBadge,
                          {
                            backgroundColor:
                              TIER_COLORS[user.subscription.tier as keyof typeof TIER_COLORS] + '20',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.tierText,
                            { color: TIER_COLORS[user.subscription.tier as keyof typeof TIER_COLORS] },
                          ]}
                        >
                          {user.subscription.tier.toUpperCase()} - {user.subscription.duration}mo
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.userStats}>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatLabel}>Wallet</Text>
                    <Text style={styles.userStatValue}>${user.walletBalance || 0}</Text>
                  </View>
                  <View style={styles.userStat}>
                    <Text style={styles.userStatLabel}>Code</Text>
                    <Text style={styles.userStatValue}>{user.referralCode}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'gyms' && (
          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search gyms..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {filteredGyms.map((gym: any) => (
              <View key={gym.id} style={styles.gymCard}>
                <View style={styles.gymHeader}>
                  <View style={styles.gymIcon}>
                    <Building2 size={28} color="#DC2626" />
                  </View>
                  <View style={styles.gymInfo}>
                    <Text style={styles.gymName}>{gym.name}</Text>
                    <Text style={styles.gymAddress}>{gym.address}</Text>
                  </View>
                </View>
                <View style={styles.gymStats}>
                  <View style={styles.gymStat}>
                    <Calendar size={16} color="#6B7280" />
                    <Text style={styles.gymStatText}>Today: {gym.todayCheckIns}</Text>
                  </View>
                  <View style={styles.gymStat}>
                    <Users size={16} color="#6B7280" />
                    <Text style={styles.gymStatText}>Total: {gym.totalCheckIns}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'checkins' && (
          <View style={styles.content}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search check-ins..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {filteredCheckIns.map((checkIn: any) => {
              const checkInDate = new Date(checkIn.timestamp);
              return (
                <View key={checkIn.id} style={styles.checkInCard}>
                  <View style={styles.checkInHeader}>
                    <View
                      style={[
                        styles.tierBadge,
                        { backgroundColor: TIER_COLORS[checkIn.tier as keyof typeof TIER_COLORS] + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tierText,
                          { color: TIER_COLORS[checkIn.tier as keyof typeof TIER_COLORS] },
                        ]}
                      >
                        {checkIn.tier.toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.checkInInfo}>
                      <Text style={styles.checkInUser}>{checkIn.userName}</Text>
                      <Text style={styles.checkInGym}>{checkIn.gymName}</Text>
                    </View>
                  </View>
                  <Text style={styles.checkInTime}>
                    {checkInDate.toLocaleDateString()} at {checkInDate.toLocaleTimeString()}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 32,
    alignItems: 'center' as const,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FEE2E2',
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row' as const,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingVertical: 12,
    gap: 6,
  },
  tabActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#DC2626',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#DC2626',
  },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '30%',
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
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 16,
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
  activityCard: {
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
  activityHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  activityInfo: {
    flex: 1,
  },
  activityUser: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  activityGym: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 11,
    fontWeight: 'bold' as const,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  userIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
    marginBottom: 6,
  },
  userStats: {
    flexDirection: 'row' as const,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  userStat: {
    flex: 1,
  },
  userStatLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  userStatValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  gymCard: {
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
  gymHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 12,
  },
  gymIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  gymAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  gymStats: {
    flexDirection: 'row' as const,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  gymStat: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
  },
  gymStatText: {
    fontSize: 14,
    color: '#6B7280',
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
    alignItems: 'center' as const,
    gap: 12,
    marginBottom: 8,
  },
  checkInInfo: {
    flex: 1,
  },
  checkInUser: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
  },
  checkInGym: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  checkInTime: {
    fontSize: 13,
    color: '#9CA3AF',
  },
});
