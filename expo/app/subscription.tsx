import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Check, Crown, Gem, Star, Zap } from 'lucide-react-native';
import { useApp, calculateSubscriptionPrice } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { SubscriptionTier, SubscriptionDuration } from '@/types';

const TIERS: {
  tier: SubscriptionTier;
  name: string;
  icon: typeof Crown;
  colors: [string, string];
  features: string[];
}[] = [
  {
    tier: 'silver',
    name: 'Silver',
    icon: Zap,
    colors: ['#C0C0C0', '#E8E8E8'],
    features: ['Access to Standard & Premium gyms', '30 visits per month', 'Basic amenities', 'Mobile app support'],
  },
  {
    tier: 'gold',
    name: 'Gold',
    icon: Star,
    colors: ['#FFD700', '#FFA500'],
    features: ['All Silver benefits', 'Access to Diamond gyms', 'Priority booking', 'Guest passes (2/month)'],
  },
  {
    tier: 'diamond',
    name: 'Diamond',
    icon: Gem,
    colors: ['#B9F2FF', '#00D4FF'],
    features: ['All Gold benefits', 'Premium gym access', 'Personal training sessions', 'Nutrition consultation'],
  },
  {
    tier: 'elite',
    name: 'Elite',
    icon: Crown,
    colors: ['#9C27B0', '#E040FB'],
    features: ['All Diamond benefits', 'Exclusive Elite gyms', 'Unlimited guest passes', 'VIP concierge service'],
  },
];

const DURATIONS: { duration: SubscriptionDuration; label: string; discount: string }[] = [
  { duration: 1, label: '1 Month', discount: '' },
  { duration: 3, label: '3 Months', discount: 'Save 15%' },
  { duration: 6, label: '6 Months', discount: 'Save 20%' },
  { duration: 9, label: '9 Months', discount: 'Save 25%' },
  { duration: 12, label: '12 Months', discount: 'Save 30%' },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { createSubscription } = useApp();
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>('gold');
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(3);

  const { monthlyPrice, totalPrice } = calculateSubscriptionPrice(selectedTier, selectedDuration);

  const handleSubscribe = (): void => {
    createSubscription(selectedTier, selectedDuration);
    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Choose Your Plan</Text>
      <Text style={styles.subtitle}>Select a tier and duration that fits your fitness goals</Text>

      <View style={styles.tiersContainer}>
        {TIERS.map((tierData) => {
          const isSelected = selectedTier === tierData.tier;
          const Icon = tierData.icon;
          
          return (
            <TouchableOpacity
              key={tierData.tier}
              onPress={() => setSelectedTier(tierData.tier)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={tierData.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.tierCard,
                  isSelected && styles.tierCardSelected
                ]}
              >
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Check size={16} color={Colors.background} />
                  </View>
                )}
                
                <Icon size={32} color="#FFF" />
                <Text style={styles.tierName}>{tierData.name}</Text>
                
                <View style={styles.featuresContainer}>
                  {tierData.features.map((feature, index) => (
                    <View key={index} style={styles.featureRow}>
                      <Check size={14} color="rgba(255,255,255,0.9)" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.durationSection}>
        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.durationGrid}>
          {DURATIONS.map((durationData) => {
            const isSelected = selectedDuration === durationData.duration;
            
            return (
              <TouchableOpacity
                key={durationData.duration}
                style={[
                  styles.durationCard,
                  isSelected && styles.durationCardSelected
                ]}
                onPress={() => setSelectedDuration(durationData.duration)}
              >
                <Text style={[
                  styles.durationLabel,
                  isSelected && styles.durationLabelSelected
                ]}>
                  {durationData.label}
                </Text>
                {durationData.discount && (
                  <Text style={[
                    styles.discountText,
                    isSelected && styles.discountTextSelected
                  ]}>
                    {durationData.discount}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Monthly Price</Text>
          <Text style={styles.summaryValue}>{monthlyPrice} JOD</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Duration</Text>
          <Text style={styles.summaryValue}>{selectedDuration} {selectedDuration === 1 ? 'Month' : 'Months'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{totalPrice} JOD</Text>
        </View>
        {user && user.walletBalance > 0 && (
          <View style={styles.walletInfo}>
            <Text style={styles.walletText}>
              Wallet Balance: {user.walletBalance} JOD available
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        By subscribing, you agree to our Terms of Service and Privacy Policy. Subscription will auto-renew unless cancelled.
      </Text>
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
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
    lineHeight: 22,
  },
  tiersContainer: {
    marginBottom: 32,
  },
  tierCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    position: 'relative',
  },
  tierCardSelected: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
  selectedBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.text,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#FFF',
    marginTop: 12,
    marginBottom: 16,
  },
  featuresContainer: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
  },
  durationSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  durationCard: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  durationCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.text,
  },
  durationLabel: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  durationLabelSelected: {
    color: Colors.text,
  },
  discountText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600' as const,
  },
  discountTextSelected: {
    color: 'rgba(255,255,255,0.9)',
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  walletInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  walletText: {
    fontSize: 13,
    color: Colors.gold,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  disclaimer: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
