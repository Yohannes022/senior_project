import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Mail, CheckCircle } from "lucide-react-native";
import Colors from "@/constants/colors";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");

  const handleResetPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Simulate API call to send reset password email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success state
      setEmailSent(true);
    } catch (error: any) {
      setError(error.message || "Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView style={[styles.container, styles.successContainer]} edges={["top"]}>
        <Stack.Screen 
          options={{
            title: "",
            headerShown: false,
          }} 
        />
        
        <View style={styles.successContent}>
          <View style={styles.successIconContainer}>
            <CheckCircle size={80} color={Colors.success} />
          </View>
          
          <Text style={styles.successTitle}>Check Your Email</Text>
          
          <Text style={styles.successText}>
            We've sent a password reset link to {" "}
            <Text style={styles.emailText}>{email}</Text>
          </Text>
          
          <Text style={styles.instructions}>
            Please check your email and follow the instructions to reset your password.
          </Text>
          
          <TouchableOpacity 
            style={styles.backToLoginButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
          
          <Text style={styles.resendText}>
            Didn't receive the email?{" "}
            <Text style={styles.resendLink} onPress={handleResetPassword}>
              Resend
            </Text>
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Stack.Screen 
        options={{
          title: "",
          headerShown: false,
        }} 
      />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ChevronLeft size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Forgot Password</Text>
            <View style={{ width: 24 }} />
          </View>
          
          {/* Illustration */}
          <View style={styles.illustrationContainer}>
            <Image 
              source={require("@/assets/images/icon.png")} 
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>
          
          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
            
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Mail size={20} color={Colors.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.textLight}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError("");
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
            
            {/* Reset Password Button */}
            <TouchableOpacity 
              style={[styles.resetButton, (loading || !email) && styles.resetButtonDisabled]}
              onPress={handleResetPassword}
              disabled={loading || !email}
            >
              {loading ? (
                <Text style={styles.resetButtonText}>Sending...</Text>
              ) : (
                <Text style={styles.resetButtonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
            
            {/* Back to Login */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Remember your password? </Text>
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.loginText}>Log In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    marginTop: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
  },
  illustrationContainer: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 16,
  },
  illustration: {
    width: 250,
    height: 200,
  },
  form: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    color: Colors.text,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  resetButtonDisabled: {
    opacity: 0.6,
  },
  resetButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    color: Colors.textLight,
    fontSize: 14,
  },
  loginText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  // Success state styles
  successContainer: {
    justifyContent: "center",
  },
  successContent: {
    padding: 24,
    alignItems: "center",
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 24,
  },
  emailText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  instructions: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  backToLoginButton: {
    backgroundColor: Colors.primary,
    height: 56,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    maxWidth: 280,
    marginBottom: 16,
  },
  backToLoginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  resendText: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
  },
  resendLink: {
    color: Colors.primary,
    fontWeight: "600",
  },
});
