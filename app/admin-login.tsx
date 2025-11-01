import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Shield, Lock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLoginScreen() {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      router.push('/admin-dashboard' as any);
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Stack.Screen
        options={{
          title: 'Admin Login',
          headerStyle: { backgroundColor: '#DC2626' },
          headerTintColor: '#fff',
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.header}>
          <Shield size={64} color="#fff" />
          <Text style={styles.headerTitle}>Admin Portal</Text>
          <Text style={styles.headerSubtitle}>System Administrator Access</Text>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Login to Continue</Text>

            <View style={styles.inputContainer}>
              <User size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.inputContainer}>
              <Lock size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <LinearGradient colors={['#DC2626', '#B91C1C']} style={styles.loginGradient}>
                <Text style={styles.loginText}>Login</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.demoCredentials}>
              <Text style={styles.demoTitle}>Demo Credentials:</Text>
              <Text style={styles.demoText}>Username: admin</Text>
              <Text style={styles.demoText}>Password: admin123</Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  keyboardView: {
    flex: 1,
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
    color: '#FEE2E2',
    marginTop: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center' as const,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: '#1F2937',
    marginBottom: 24,
    textAlign: 'center' as const,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    paddingVertical: 14,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center' as const,
  },
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
  },
  loginGradient: {
    paddingVertical: 16,
    alignItems: 'center' as const,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  demoCredentials: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#92400E',
    marginBottom: 8,
  },
  demoText: {
    fontSize: 13,
    color: '#92400E',
    marginBottom: 4,
  },
});
