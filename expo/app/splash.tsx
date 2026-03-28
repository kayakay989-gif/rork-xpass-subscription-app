import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function SplashScreen() {
  const router = useRouter();
  const { continueAsGuest } = useAuth();

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={['#8B0000', '#4B0000', '#1a0000', '#000000']}
        locations={[0, 0.3, 0.6, 1]}
        style={styles.container}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/t5u7px23rxplxx8gfxveq' }} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>XPASS</Text>
            <Text style={styles.tagline}>YOUR FITNESS PASSPORT</Text>
          </View>

          <View style={styles.buttonsContainer}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginButtonText}>Login/Register</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.discoverButton}
              onPress={() => {
                continueAsGuest();
                router.replace('/(tabs)/home');
              }}
            >
              <Text style={styles.discoverButtonText}>Discover</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingTop: 100,
    paddingBottom: 60,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#DC143C',
    letterSpacing: 2,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: '#DC143C',
    letterSpacing: 1.5,
  },
  buttonsContainer: {
    gap: 16,
  },
  loginButton: {
    borderWidth: 2,
    borderColor: '#DC143C',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC143C',
  },
  discoverButton: {
    borderWidth: 2,
    borderColor: '#DC143C',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  discoverButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#DC143C',
  },
});
