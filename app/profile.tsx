import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, User, Mail, Phone, CreditCard, LogOut, Share2 } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout, isGuest } = useAuth();
  const { subscription } = useApp();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/splash');
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert(
      'Share Referral Code',
      `Your referral code: ${user?.referralCode || 'N/A'}\n\nShare this code with friends to earn rewards!`,
      [{ text: 'OK' }]
    );
  };

  const getTierName = (tier: string): string => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={48} color={Colors.white} />
              </View>
            </View>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            {!isGuest && user?.email && (
              <Text style={styles.userEmail}>{user.email}</Text>
            )}
          </View>

          {!isGuest && subscription && (
            <View style={styles.subscriptionCard}>
              <Text style={styles.cardTitle}>Active Subscription</Text>
              <View style={styles.subscriptionDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tier</Text>
                  <Text style={styles.detailValue}>{getTierName(subscription.tier)}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Visits Used</Text>
                  <Text style={styles.detailValue}>
                    {subscription.visitsUsed} / {subscription.maxVisitsPerMonth}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Valid Until</Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!isGuest && user && (
            <View style={styles.infoCard}>
              <Text style={styles.cardTitle}>Personal Information</Text>
              
              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Mail size={20} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user.email || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <Phone size={20} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user.phone || 'Not provided'}</Text>
                </View>
              </View>

              <View style={styles.infoItem}>
                <View style={styles.infoIconContainer}>
                  <CreditCard size={20} color={Colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Wallet Balance</Text>
                  <Text style={styles.infoValue}>{user.walletBalance || 0} JOD</Text>
                </View>
              </View>
            </View>
          )}

          {!isGuest && user?.referralCode && (
            <View style={styles.referralCard}>
              <Text style={styles.cardTitle}>Referral Code</Text>
              <View style={styles.referralCodeContainer}>
                <Text style={styles.referralCode}>{user.referralCode}</Text>
              </View>
              <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
                <Share2 size={20} color={Colors.white} />
                <Text style={styles.shareButtonText}>Share Code</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.actionsSection}>
            {isGuest ? (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => router.push('/login')}
              >
                <User size={20} color={Colors.white} />
                <Text style={styles.actionButtonText}>Login / Register</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, styles.logoutButton]}
                onPress={handleLogout}
              >
                <LogOut size={20} color={Colors.white} />
                <Text style={styles.actionButtonText}>Logout</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  subscriptionCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  subscriptionDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  referralCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  referralCodeContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.text,
    letterSpacing: 2,
  },
  shareButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  actionsSection: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
});
