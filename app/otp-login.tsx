import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function OtpLogin() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { sendOtp, verifyOtp, isLoading } = useAuth();
  const router = useRouter();
  const navigation = useNavigation();
  const otpInputRef = useRef<TextInput>(null);
  const countdownRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (countdown > 0) {
      countdownRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => {
      if (countdownRef.current) {
        clearTimeout(countdownRef.current);
      }
    };
  }, [countdown]);

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    const { success, message, otp: generatedOtp } = await sendOtp(phone);
    if (success) {
      setIsOtpSent(true);
      setCountdown(60); // 60 seconds countdown
      // Show OTP in alert for testing purposes
      Alert.alert('OTP Sent', `Your OTP is: ${generatedOtp}\n\n(For testing purposes)`);
      // Focus the OTP input field
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } else {
      Alert.alert('Error', message || 'Failed to send OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    const { success, message } = await verifyOtp(phone, otp);
    if (success) {
      // Navigate to home screen on successful verification
      // @ts-ignore - Expo Router types are not perfect with nested routes
      navigation.navigate('(tabs)');
    } else {
      Alert.alert('Error', message || 'Failed to verify OTP');
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    
    const { success, message, otp: newOtp } = await sendOtp(phone);
    if (success) {
      setCountdown(60);
      // Show OTP in alert for testing purposes
      Alert.alert('New OTP Sent', `Your new OTP is: ${newOtp}\n\n(For testing purposes)`);
    } else {
      Alert.alert('Error', message || 'Failed to resend OTP');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <Stack.Screen options={{ 
        title: isOtpSent ? 'Verify OTP' : 'Login / Sign Up',
        headerTitleStyle: styles.headerTitle,
        headerTitleAlign: 'center',
      }} />
      
      <View style={styles.content}>
        {!isOtpSent ? (
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="phone-portrait-outline" size={60} color="#4a90e2" />
            </View>
            <Text style={styles.title}>Enter Your Phone Number</Text>
            <Text style={styles.subtitle}>We'll send you a verification code</Text>
            
            <View style={styles.inputContainer}>
              <View style={styles.prefixContainer}>
                <Text style={styles.prefix}>+251</Text>
              </View>
              <TextInput
                style={styles.phoneInput}
                placeholder="9XXXXXXXX"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
                maxLength={9}
                autoFocus
                returnKeyType="send"
                onSubmitEditing={handleSendOtp}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, (isLoading || !phone) && styles.buttonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading || !phone}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={60} color="#4a90e2" />
            </View>
            <Text style={styles.title}>Enter Verification Code</Text>
            <Text style={styles.subtitle}>We've sent a code to +251 {phone}</Text>
            
            <View style={styles.otpContainer}>
              <TextInput
                ref={otpInputRef}
                style={styles.otpInput}
                placeholder="• • • • • •"
                placeholderTextColor="#ccc"
                keyboardType="number-pad"
                value={otp}
                onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, ''))}
                maxLength={6}
                textAlign="center"
                autoFocus
                returnKeyType="done"
                onSubmitEditing={otp.length === 6 ? handleVerifyOtp : undefined}
                selectionColor="#4a90e2"
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.button, (isLoading || otp.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyOtp}
              disabled={isLoading || otp.length !== 6}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
            
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>
                Didn't receive the code?{' '}
              </Text>
              <TouchableOpacity 
                onPress={handleResendOtp}
                disabled={countdown > 0}
              >
                <Text style={[styles.resendLink, countdown > 0 && styles.resendLinkDisabled]}>
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#333',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    color: '#2c3e50',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#7f8c8d',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
    height: 56,
  },
  prefixContainer: {
    paddingHorizontal: 16,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  prefix: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  phoneInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  otpContainer: {
    marginBottom: 32,
  },
  otpInput: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 12,
    color: '#2c3e50',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 72,
  },
  button: {
    backgroundColor: '#4a90e2',
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4a90e2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#a0c4f3',
    shadowOpacity: 0,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  resendLink: {
    color: '#4a90e2',
    fontSize: 14,
    fontWeight: '600',
  },
  resendLinkDisabled: {
    color: '#bdc3c7',
  },
});
