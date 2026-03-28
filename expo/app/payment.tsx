import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/contexts/AuthContext';
import Colors from '@/constants/colors';
import { ArrowLeft, CreditCard, CheckCircle2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PaymentScreen() {
  const { tier, duration, price } = useLocalSearchParams<{ tier: string; duration: string; price: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [paymentProcessing, setPaymentProcessing] = useState<boolean>(false);
  const [cardNumber, setCardNumber] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [cvv, setCvv] = useState<string>('');
  const [cardholderName, setCardholderName] = useState<string>('');

  const createIntentMutation = trpc.payments.createIntent.useMutation();
  const confirmPaymentMutation = trpc.payments.confirm.useMutation();

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiryDate = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
    }
    return cleaned;
  };

  const isCardValid = () => {
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    return (
      cleanCardNumber.length === 16 &&
      expiryDate.length === 5 &&
      cvv.length === 3 &&
      cardholderName.length > 0
    );
  };

  const handlePayment = async () => {
    if (!isCardValid()) {
      Alert.alert('Error', 'Please complete all card details');
      return;
    }

    setPaymentProcessing(true);

    try {
      console.log('[Payment] Creating payment intent...');
      
      const intentResult = await createIntentMutation.mutateAsync({
        userId: user!.id,
        tier: tier as 'silver' | 'gold' | 'diamond' | 'elite',
        duration: parseInt(duration) as 1 | 3 | 6 | 9 | 12,
      });

      console.log('[Payment] Payment intent created');
      console.log('[Payment] Processing payment with card details...');
      console.log('[Payment] Card:', cardNumber.substring(0, 4) + ' **** **** ' + cardNumber.substring(cardNumber.length - 4));
      console.log('[Payment] Expiry:', expiryDate);
      
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('[Payment] Payment processed successfully');
      console.log('[Payment] Confirming payment on backend...');
      
      await confirmPaymentMutation.mutateAsync({
        paymentIntentId: intentResult.paymentIntentId,
      });

      Alert.alert(
        'Payment Successful',
        `Your ${tier} subscription has been activated for ${duration} month(s)!\n\nAmount: ${price} JOD\n\nYou can now access all gyms in your tier.`,
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('[Payment] Error:', error);
      Alert.alert(
        'Payment Failed',
        'There was an error processing your payment. Please check your card details and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPaymentProcessing(false);
    }
  };

  const getTierName = () => {
    const tierNames: Record<string, string> = {
      silver: 'Silver Package',
      gold: 'Gold Package',
      diamond: 'Diamond Package',
      elite: 'Elite Package',
    };
    return tierNames[tier] || tier;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <CreditCard size={48} color={Colors.primary} style={styles.icon} />
          <Text style={styles.packageName}>{getTierName()}</Text>
          <Text style={styles.durationText}>{duration} Month{parseInt(duration) > 1 ? 's' : ''}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Total Amount</Text>
            <Text style={styles.price}>{price} JOD</Text>
          </View>
        </View>

        <View style={styles.cardFieldContainer}>
          <Text style={styles.label}>Cardholder Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Smith"
            placeholderTextColor={Colors.textSecondary}
            value={cardholderName}
            onChangeText={setCardholderName}
            autoCapitalize="words"
            testID="cardholder-name-input"
          />
        </View>

        <View style={styles.cardFieldContainer}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="4242 4242 4242 4242"
            placeholderTextColor={Colors.textSecondary}
            value={cardNumber}
            onChangeText={(text) => {
              const cleaned = text.replace(/\s/g, '');
              if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
                setCardNumber(formatCardNumber(cleaned));
              }
            }}
            keyboardType="numeric"
            maxLength={19}
            testID="card-number-input"
          />
          <Text style={styles.hint}>Note: This is currently in test mode. Use any valid card number for testing.</Text>
        </View>

        <View style={styles.row}>
          <View style={[styles.cardFieldContainer, { flex: 1, marginRight: 12 }]}>
            <Text style={styles.label}>Expiry Date</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor={Colors.textSecondary}
              value={expiryDate}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '');
                if (cleaned.length <= 4) {
                  setExpiryDate(formatExpiryDate(cleaned));
                }
              }}
              keyboardType="numeric"
              maxLength={5}
              testID="expiry-date-input"
            />
          </View>

          <View style={[styles.cardFieldContainer, { flex: 1 }]}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="123"
              placeholderTextColor={Colors.textSecondary}
              value={cvv}
              onChangeText={(text) => {
                if (text.length <= 3 && /^\d*$/.test(text)) {
                  setCvv(text);
                }
              }}
              keyboardType="numeric"
              maxLength={3}
              secureTextEntry
              testID="cvv-input"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.payButton,
            (!isCardValid() || paymentProcessing) && styles.payButtonDisabled,
          ]}
          onPress={handlePayment}
          disabled={!isCardValid() || paymentProcessing}
          testID="pay-button"
        >
          {paymentProcessing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <>
              <CheckCircle2 size={20} color={Colors.white} />
              <Text style={styles.payButtonText}>Pay {price} JOD</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.securityNote}>
          <Text style={styles.securityText}>🔒 Secure Payment</Text>
          <Text style={styles.securitySubtext}>Your payment information is encrypted and secure</Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  icon: {
    marginBottom: 16,
  },
  packageName: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  durationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  priceContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  price: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  cardFieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  payButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  payButtonDisabled: {
    backgroundColor: Colors.border,
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  securityNote: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  securityText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  securitySubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
