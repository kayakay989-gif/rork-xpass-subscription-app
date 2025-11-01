import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';

type Package = {
  name: string;
  description: string[];
  price: number;
  headerColor: string;
  buttonColor: string;
};

const PACKAGES: Package[] = [
  {
    name: 'Silver Package',
    description: ['Access to Silver Tier Gyms only.', 'Access over 100 gyms'],
    price: 65,
    headerColor: '#6B7280',
    buttonColor: '#6B7280',
  },
  {
    name: 'Gold Package',
    description: ['Access to Gold & Silver Tier Gyms.', 'Access over 150 gyms'],
    price: 90,
    headerColor: '#F59E0B',
    buttonColor: '#F59E0B',
  },
  {
    name: 'Diamond Package',
    description: ['Access to Diamond, Gold & Silver Tier Gyms.', 'Access over 200 gyms'],
    price: 125,
    headerColor: '#6B7280',
    buttonColor: '#6B7280',
  },
  {
    name: 'Elite Package',
    description: ['Access to all Gym Tiers including Elite gyms.'],
    price: 250,
    headerColor: '#2563EB',
    buttonColor: '#2563EB',
  },
];

const DURATIONS = [
  { label: '1', subLabel: 'Month', value: 1 },
  { label: '3', subLabel: 'Months', value: 3 },
  { label: '6', subLabel: 'Months', value: 6 },
  { label: '12', subLabel: 'Months', value: 12 },
];

const DURATION_DISCOUNTS: Record<number, number> = {
  1: 0,
  3: 0.15,
  6: 0.20,
  12: 0.30,
};

export default function SubscriptionScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [selectedDuration, setSelectedDuration] = useState<number>(1);
  const insets = useSafeAreaInsets();

  const calculatePrice = useMemo(() => {
    return (basePrice: number) => {
      const discount = DURATION_DISCOUNTS[selectedDuration] || 0;
      const monthlyPrice = Math.round(basePrice * (1 - discount));
      return monthlyPrice * selectedDuration;
    };
  }, [selectedDuration]);

  const handleSelectPackage = (tier: string, basePrice: number) => {
    const totalPrice = calculatePrice(basePrice);
    console.log('[Subscription] Selected package:', { tier, duration: selectedDuration, totalPrice });
    
    router.push({
      pathname: '/payment',
      params: {
        tier,
        duration: selectedDuration.toString(),
        price: totalPrice.toString(),
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Image 
          source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/t5u7px23rxplxx8gfxveq' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.headerRight}>
          <Text style={styles.greeting}>Hello {user?.name?.split(' ')[0] || 'User'}</Text>
          <View style={styles.iconsContainer}>
            <View style={styles.languageButton}>
              <Text style={styles.languageText}>EN</Text>
            </View>
            <View style={styles.profileButton}>
              <Text style={styles.profileIcon}>👤</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>XPass Packages</Text>

        <View style={styles.durationsContainer}>
          {DURATIONS.map((duration) => (
            <TouchableOpacity
              key={duration.value}
              style={[
                styles.durationButton,
                selectedDuration === duration.value && styles.durationButtonSelected
              ]}
              onPress={() => setSelectedDuration(duration.value)}
            >
              <Text style={[
                styles.durationLabel,
                selectedDuration === duration.value && styles.durationLabelSelected
              ]}>
                {duration.label}
              </Text>
              <Text style={[
                styles.durationSubLabel,
                selectedDuration === duration.value && styles.durationSubLabelSelected
              ]}>
                {duration.subLabel}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {PACKAGES.map((pkg, index) => (
          <View key={index} style={styles.packageCard}>
            <View style={[styles.packageHeader, { backgroundColor: pkg.headerColor }]} />
            
            <View style={styles.packageContent}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              
              {pkg.description.map((desc, i) => (
                <Text key={i} style={styles.packageDescription}>
                  {desc}
                </Text>
              ))}
              
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{calculatePrice(pkg.price)} JOD</Text>
                {selectedDuration > 1 && (
                  <Text style={styles.priceDetail}>
                    {pkg.price} JOD/month × {selectedDuration} months
                  </Text>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.selectButton, { backgroundColor: pkg.buttonColor }]}
                onPress={() => handleSelectPackage(pkg.name.toLowerCase().replace(' package', ''), pkg.price)}
              >
                <Text style={styles.selectButtonText}>Select Package</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  logo: {
    width: 40,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  greeting: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  iconsContainer: {
    flexDirection: 'row',
    gap: 8,
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
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700' as const,
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
    fontSize: 18,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  durationsContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  durationButton: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  durationButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  durationLabel: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  durationLabelSelected: {
    color: Colors.white,
  },
  durationSubLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  durationSubLabelSelected: {
    color: Colors.white,
  },
  packageCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  packageHeader: {
    height: 32,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  packageContent: {
    padding: 24,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  packageDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 4,
  },
  priceContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignSelf: 'center',
  },
  price: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#6B7280',
  },
  selectButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  priceDetail: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
