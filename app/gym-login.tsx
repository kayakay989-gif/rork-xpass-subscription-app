import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { Building2, ChevronRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GymLoginScreen() {
  const gymsQuery = trpc.gyms.list.useQuery();
  const gyms = gymsQuery.data || [];

  if (gymsQuery.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading gyms...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Gym Owner Portal',
          headerStyle: { backgroundColor: '#4F46E5' },
          headerTintColor: '#fff',
        }}
      />

      <LinearGradient colors={['#4F46E5', '#7C3AED']} style={styles.header}>
        <Building2 size={48} color="#fff" />
        <Text style={styles.headerTitle}>Select Your Gym</Text>
        <Text style={styles.headerSubtitle}>Choose which gym to manage</Text>
      </LinearGradient>

      <View style={styles.content}>
        <FlatList
          data={gyms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gymCard}
              onPress={() => router.push(`/gym-dashboard?gymId=${item.id}`)}
            >
              <View style={styles.gymIcon}>
                <Building2 size={32} color="#4F46E5" />
              </View>
              <View style={styles.gymInfo}>
                <Text style={styles.gymName}>{item.name}</Text>
                <Text style={styles.gymAddress}>{item.address}</Text>
                <Text style={styles.gymCategory}>{item.category.toUpperCase()}</Text>
              </View>
              <ChevronRight size={24} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    padding: 32,
    alignItems: 'center' as const,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold' as const,
    color: '#fff',
    marginTop: 16,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0E7FF',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  listContainer: {
    padding: 16,
  },
  gymCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gymIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginRight: 16,
  },
  gymInfo: {
    flex: 1,
  },
  gymName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  gymCategory: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: '#4F46E5',
  },
});
