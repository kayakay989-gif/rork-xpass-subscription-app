import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronDown, User as UserIcon } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import { trpc } from '@/lib/trpc';
import Colors from '@/constants/colors';
import { useState, useMemo, useEffect } from 'react';
import MapViewComponent from '@/components/MapView';

type ViewMode = 'map' | 'list';

export default function HomeScreen() {
  const router = useRouter();
  const { user, isGuest } = useAuth();
  const { subscription } = useApp();

  useEffect(() => {
    if (!user && !isGuest) {
      router.replace('/splash');
    }
  }, [user, isGuest, router]);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [selectedCity] = useState<string>('All');
  const [selectedTier] = useState<string>('All');
  const [selectedFacility] = useState<string>('All');

  const gymsQuery = trpc.gyms.list.useQuery();
  const gyms = useMemo(() => gymsQuery.data || [], [gymsQuery.data]);

  const filteredGyms = useMemo(() => {
    return gyms.filter(gym => {
      const cityMatch = selectedCity === 'All' || gym.city === selectedCity;
      const tierMatch = selectedTier === 'All' || gym.allowedTiers.includes(selectedTier.toLowerCase() as any);
      const facilityMatch = selectedFacility === 'All' || gym.amenities.includes(selectedFacility);
      return cityMatch && tierMatch && facilityMatch;
    });
  }, [gyms, selectedCity, selectedTier, selectedFacility]);

  const spotlightGyms = useMemo(() => {
    return gyms.filter(g => g.category === 'elite' || g.category === 'diamond').slice(0, 3);
  }, [gyms]);

  const getTierName = (tier: string): string => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const initialRegion = {
    latitude: 31.9539,
    longitude: 35.9106,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/t5u7px23rxplxx8gfxveq' }} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Hello {user?.name?.split(' ')[0] || (isGuest ? 'Guest' : 'Member')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.languageButton}>
            <Text style={styles.languageText}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileButton} onPress={() => router.push('/profile')}>
            <UserIcon size={16} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.dashboardTitle}>
        <Text style={styles.dashboardText}>Home Dashboard</Text>
      </View>

      {subscription ? (
        <View style={styles.subscriptionCard}>
          <View style={styles.cardRow}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Passes Remaining</Text>
              <Text style={styles.statValue}>{subscription.maxVisitsPerMonth - subscription.visitsUsed} / {subscription.maxVisitsPerMonth}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Tier</Text>
              <Text style={styles.tierValue}>{getTierName(subscription.tier)}</Text>
            </View>
          </View>
        </View>
      ) : (
        <TouchableOpacity 
          style={styles.noSubscriptionCard}
          onPress={() => router.push('/subscription')}
        >
          <Text style={styles.noSubTitle}>No Active Subscription</Text>
          <Text style={styles.noSubText}>Tap to choose a plan</Text>
        </TouchableOpacity>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Spotlight</Text>
      </View>
      
      {gymsQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.spotlightContainer}
          contentContainerStyle={styles.spotlightContent}
        >
          {spotlightGyms.map((gym) => (
            <TouchableOpacity 
              key={gym.id} 
              style={styles.spotlightCard}
              onPress={() => {
                if (isGuest || !subscription) {
                  Alert.alert(
                    'Subscription Required',
                    'Please subscribe to access gym details and check-in features.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Subscribe', onPress: () => router.push('/subscription') },
                    ]
                  );
                } else {
                  router.push(`/gyms`);
                }
              }}
            >
              <Image 
                source={{ uri: gym.imageUrl }} 
                style={styles.spotlightImage}
                resizeMode="cover"
              />
              <View style={styles.spotlightOverlay}>
                <View style={styles.spotlightBadge}>
                  <Text style={styles.spotlightBadgeText}>{gym.category.toUpperCase()}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Discover</Text>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>Map</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>List</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <MapViewComponent 
          gyms={filteredGyms}
          initialRegion={initialRegion}
          onMarkerPress={() => router.push('/gyms')}
        />
      ) : (
        <View style={styles.listContainer}>
          {gymsQuery.isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} />
          ) : filteredGyms.length > 0 ? (
            filteredGyms.map((gym) => (
              <TouchableOpacity 
                key={gym.id} 
                style={styles.gymCard}
                onPress={() => {
                  if (isGuest || !subscription) {
                    Alert.alert(
                      'Subscription Required',
                      'Please subscribe to access gym details and check-in features.',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Subscribe', onPress: () => router.push('/subscription') },
                      ]
                    );
                  } else {
                    router.push('/gyms');
                  }
                }}
              >
                <Image source={{ uri: gym.imageUrl }} style={styles.gymImage} />
                <View style={styles.gymInfo}>
                  <Text style={styles.gymName}>{gym.name}</Text>
                  <Text style={styles.gymAddress}>{gym.address}</Text>
                  <View style={styles.gymCategory}>
                    <Text style={styles.gymCategoryText}>{gym.category}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No gyms found</Text>
          )}
        </View>
      )}

      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterLabel}>City</Text>
          <ChevronDown size={16} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterLabel}>Tier</Text>
          <ChevronDown size={16} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterLabel}>Facilities</Text>
          <ChevronDown size={16} color={Colors.text} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  dashboardTitle: {
    marginBottom: 16,
  },
  dashboardText: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBox: {
    flex: 1,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  tierValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  noSubscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noSubTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  noSubText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightContainer: {
    marginBottom: 24,
  },
  spotlightContent: {
    paddingRight: 16,
  },
  spotlightCard: {
    width: 240,
    height: 140,
    borderRadius: 16,
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
  },
  spotlightOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    padding: 12,
  },
  spotlightBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  spotlightBadgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700' as const,
  },
  spotlightText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: Colors.white,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.text,
  },

  listContainer: {
    marginBottom: 16,
  },
  gymCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gymImage: {
    width: '100%',
    height: 120,
  },
  gymInfo: {
    padding: 12,
  },
  gymName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  gymCategory: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  gymCategoryText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.text,
    textTransform: 'uppercase',
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: Colors.text,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
