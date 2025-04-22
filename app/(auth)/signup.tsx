import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, X, ArrowRight } from 'lucide-react-native';
import theme from '@/constants/theme';
import useAppStore from '@/store/useAppStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function SignupScreen() {
  const router = useRouter();
  const { login } = useAppStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      // In a real app, this would call an API to create a new user
      // For this demo, we'll just use the login function
      const success = await login(email, password);
      if (success) {
        router.replace('/');
      } else {
        setError('Failed to create account. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
          >
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Sign up to get started with Transit Share</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              leftIcon={<User size={20} color={theme.colors.subtext} />}
            />
            
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon={<Mail size={20} color={theme.colors.subtext} />}
            />
            
            <Input
              label="Password"
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={theme.colors.subtext} />}
            />
            
            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              leftIcon={<Lock size={20} color={theme.colors.subtext} />}
            />
            
            {error ? (
              <Text style={styles.errorText}>{error}</Text>
            ) : null}
            
            <Text style={styles.termsText}>
              By signing up, you agree to our Terms of Service and Privacy Policy
            </Text>
            
            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              style={styles.signupButton}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginText}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.sm,
  },
  header: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSizes.xxxl,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  form: {
    marginBottom: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
  },
  termsText: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginBottom: theme.spacing.lg,
    lineHeight: 18,
  },
  signupButton: {
    marginTop: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 'auto',
    paddingVertical: theme.spacing.lg,
  },
  footerText: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.subtext,
  },
  loginText: {
    fontSize: theme.fontSizes.md,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
});