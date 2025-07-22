import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { userService } from '@/services/database';
import { User } from '@/types/database';
import { Alert } from 'react-native';

// OTP expiration time in minutes
const OTP_EXPIRY_MINUTES = 10;

// Extend the User type with OTP fields
export interface LocalUser extends User {
  otp?: string;
  otpExpires?: string;
  isPhoneVerified: boolean;
}

// Add interface for OTP response
export interface OtpResponse {
  success: boolean;
  message: string;
  otp?: string;
}

export interface AuthContextType {
  user: LocalUser | null;
  isLoading: boolean;
  sendOtp: (phone: string) => Promise<OtpResponse>;
  verifyOtp: (phone: string, otp: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (userData: Partial<LocalUser>) => Promise<boolean>;
}

// Define default values for the auth context
const defaultAuthContext: AuthContextType = {
  user: null,
  isLoading: false,
  sendOtp: async () => ({ success: false, message: 'Auth context not initialized' }),
  verifyOtp: async () => ({ success: false, message: 'Auth context not initialized' }),
  logout: async () => {},
  updateProfile: async () => false,
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Generate a random 6-digit OTP
const generateOtp = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if OTP is expired
const isOtpExpired = (otpExpires: string): boolean => {
  return new Date() > new Date(otpExpires);
};

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [otp, setOtp] = useState<string>('');
  const [otpExpires, setOtpExpires] = useState<Date | null>(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('currentUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          const userData = await userService.getById(parsedUser.id);
          if (userData) {
            setUser(userData);
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Send OTP to phone number
  const sendOtp = async (phone: string): Promise<OtpResponse> => {
    try {
      setIsLoading(true);
      
      // In a real app, you would send this OTP via SMS
      const otp = generateOtp();
      const otpExpires = new Date();
      otpExpires.setMinutes(otpExpires.getMinutes() + OTP_EXPIRY_MINUTES);
      
      setOtp(otp);
      setOtpExpires(otpExpires);
      
      // For demo purposes, we'll just log the OTP
      console.log(`OTP for ${phone}: ${otp}`);
      
      return { 
        success: true, 
        message: 'OTP sent successfully',
        otp: otp // Include the OTP in the response for testing
      };
    } catch (error) {
      console.error('Error sending OTP:', error);
      return { success: false, message: 'Failed to send OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP and log in/register user
  const verifyOtp = async (phone: string, enteredOtp: string): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);
      
      // Check if OTP matches and is not expired
      if (!otp || !otpExpires || otp !== enteredOtp) {
        return { success: false, message: 'Invalid OTP' };
      }
      
      if (isOtpExpired(otpExpires.toISOString())) {
        return { success: false, message: 'OTP has expired' };
      }
      
      // Check if user exists by getting all users and filtering by phone
      const allUsers = await userService.getAll();
      let userData = allUsers.find((u: User) => u.phone === phone);
      
      // If user doesn't exist, create a new user
      if (!userData) {
        const newUser: Omit<User, 'id'> = {
          phone,
          email: '',
          name: '',
          dateOfBirth: '',
          profilePicture: '',
          isPhoneVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        userData = await userService.create(newUser);
      }
      
      // Update user in state and secure storage
      setUser(userData);
      await SecureStore.setItemAsync('currentUser', JSON.stringify(userData));
      
      // Clear OTP after successful verification
      setOtp('');
      setOtpExpires(null);
      
      return { success: true, message: 'OTP verified successfully' };
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return { success: false, message: 'Failed to verify OTP' };
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData: Partial<LocalUser>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      setIsLoading(true);
      const updatedUser = await userService.update(user.id, {
        ...user,
        ...userData,
        updatedAt: new Date().toISOString(),
      });
      
      setUser(updatedUser);
      await SecureStore.setItemAsync('currentUser', JSON.stringify(updatedUser));
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Login function (kept for backward compatibility)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      // In a real app, you would verify the password hash
      const users = await userService.getAll();
      const foundUser = users.find((u: User) => u.email === email);
      
      if (!foundUser) {
        console.log('User not found');
        return false;
      }
      
      // For demo purposes, we'll just log in without password verification
      setUser(foundUser);
      await SecureStore.setItemAsync('currentUser', JSON.stringify(foundUser));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('currentUser');
      setUser(null);
      setOtp('');
      setOtpExpires(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Return the AuthContext provider with all the context values
  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      sendOtp,
      verifyOtp,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Define useAuth hook
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the AuthContext, AuthProvider, and useAuth hook
export { 
  AuthContext,
  AuthProvider,
  useAuth 
};
