import { StyleSheet, Text, View, TouchableOpacity, TextInput, Image, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

type AuthMode = 'login' | 'signup';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<AuthMode>('login');
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const registerMutation = trpc.auth.register.useMutation();
  const loginMutation = trpc.auth.login.useMutation();
  const googleLoginMutation = trpc.auth.googleLogin.useMutation();

  const validatePhone = (phoneNum: string): boolean => {
    const jordanPhoneRegex = /^[0-9]{9}$/;
    return jordanPhoneRegex.test(phoneNum);
  };

  const handleSignUp = async () => {
    if (!name || !email || !phone || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    if (!validatePhone(phone)) {
      Alert.alert('Error', 'Please enter a valid 9-digit Jordan phone number (without +962)');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        phone: `+962${phone}`,
        password,
      });

      if (result.success && result.user) {
        await login(result.user.id);
        Alert.alert('Success', 'Account created successfully!', [
          { text: 'OK', onPress: () => router.replace('/(tabs)/home') }
        ]);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message) {
        if (error.message.includes('Email already registered')) {
          errorMessage = 'This email is already registered. Please login instead.';
        } else if (error.message.includes('Phone number already registered')) {
          errorMessage = 'This phone number is already registered. Please login instead.';
        } else if (error.message.includes('HTTP')) {
          errorMessage = 'Server connection error. Please make sure the backend is running.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email/phone and password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await loginMutation.mutateAsync({
        identifier: email,
        password,
      });

      if (result.success && result.user) {
        await login(result.user.id);
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      Alert.alert('Error', error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const mockGoogleUser = {
        email: 'user@gmail.com',
        name: 'Google User',
        googleId: `google-${Date.now()}`,
      };

      const result = await googleLoginMutation.mutateAsync(mockGoogleUser);

      if (result.success && result.user) {
        await login(result.user.id);
        router.replace('/(tabs)/home');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      Alert.alert('Error', 'Google login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
            <Image 
              source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/t5u7px23rxplxx8gfxveq' }} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandText}>XPASS</Text>
            <View style={styles.spacer} />
            <TouchableOpacity style={styles.languageButton}>
              <Text style={styles.languageText}>EN</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </Text>
            <Text style={styles.subtitle}>
              {mode === 'login' 
                ? 'Login to access your gym pass' 
                : 'Sign up to get started with XPASS'}
            </Text>

            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <User size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    placeholderTextColor={Colors.textMuted}
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Mail size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {mode === 'signup' && (
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Phone size={20} color={Colors.textMuted} style={styles.inputIcon} />
                  <Text style={styles.countryCode}>+962</Text>
                  <TextInput
                    style={[styles.input, { paddingLeft: 50 }]}
                    placeholder="Phone (9 digits)"
                    placeholderTextColor={Colors.textMuted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    maxLength={9}
                  />
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity 
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={Colors.textMuted} />
                  ) : (
                    <Eye size={20} color={Colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.continueButton, isLoading && styles.continueButtonDisabled]}
              onPress={mode === 'login' ? handleLogin : handleSignUp}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Lock size={18} color={Colors.white} />
                  <Text style={styles.continueButtonText}>
                    {mode === 'login' ? 'Login' : 'Sign Up'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.googleButton}
              onPress={handleGoogleLogin}
              disabled={isLoading}
            >
              <Text style={styles.googleIcon}>G</Text>
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.toggleContainer}>
              <TouchableOpacity onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                <Text style={styles.toggleText}>
                  {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                  <Text style={styles.toggleTextBold}>
                    {mode === 'login' ? 'Sign Up' : 'Login'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>
              By continuing you agree to Terms & Privacy
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logo: {
    width: 32,
    height: 32,
  },
  brandText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginLeft: 8,
  },
  spacer: {
    flex: 1,
  },
  languageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingLeft: 46,
    fontSize: 16,
    color: Colors.text,
  },
  countryCode: {
    position: 'absolute',
    left: 46,
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    zIndex: 1,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  continueButton: {
    backgroundColor: '#DC143C',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    marginTop: 8,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '600' as const,
  },
  googleButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 24,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#4285F4',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  toggleTextBold: {
    fontWeight: '700' as const,
    color: '#DC143C',
  },
  termsText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
