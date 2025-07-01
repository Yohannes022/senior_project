import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Platform, Share } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { QRCodeService } from '@/services/qrCodeService';

interface QRCodeGeneratorProps {
  ticketId: string;
  userId: string;
  expiresInHours?: number;
  size?: number;
  onError?: (error: Error) => void;
  onSuccess?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  ticketId,
  userId,
  expiresInHours = 24,
  size = 200,
  onError,
  onSuccess,
}) => {
  const [qrData, setQrData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();

  // Generate QR code data
  const generateQRCode = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await QRCodeService.generateQRCodeData(
        ticketId,
        userId,
        expiresInHours
      );
      
      setQrData(data);
      onSuccess?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate QR code';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, userId, expiresInHours, onError, onSuccess]);

  // Generate QR code on mount
  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  // Save QR code to device
  const saveQRCode = async () => {
    if (!qrData) return;
    
    try {
      setIsLoading(true);
      
      // Generate a filename with the ticket ID and current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `ticket-${ticketId}-${date}.png`;
      
      // Save the QR code image
      const fileUri = await QRCodeService.saveQRCode(qrData, filename);
      
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required to save the QR code');
      }
      
      // Save to media library
      await MediaLibrary.saveToLibraryAsync(fileUri);
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      return fileUri;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save QR code';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Share QR code
  const shareQRCode = async () => {
    try {
      setIsLoading(true);
      
      // First save the QR code
      const fileUri = await saveQRCode();
      
      if (!fileUri) return;
      
      // Share the saved file
      await Share.share({
        url: fileUri,
        title: `Ticket ${ticketId}`,
        message: `Here's your ticket ${ticketId} for Sheger Transit+`,
      });
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to share QR code';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Generate offline validation token
  const generateOfflineToken = async () => {
    try {
      setIsLoading(true);
      
      const token = await QRCodeService.generateOfflineToken(ticketId);
      
      // In a real app, you would send this token to your backend
      // to be used for offline validation
      console.log('Offline validation token:', token);
      
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      return token;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate offline token';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !qrData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, { color: colors.text, marginTop: 16 }]}>
          Generating QR Code...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.card }]}>
        <MaterialIcons name="error-outline" size={48} color={colors.notification} />
        <Text style={[styles.text, { color: colors.text, marginVertical: 16 }]}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={generateQRCode}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>
            {isLoading ? 'Generating...' : 'Try Again'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={[styles.qrContainer, { width: size, height: size }]}>
        <QRCode
          value={qrData}
          size={size - 20}
          color={colors.text}
          backgroundColor={colors.card}
          quietZone={8}
        />
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={saveQRCode}
          disabled={isLoading}
        >
          <MaterialIcons name="save-alt" size={24} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>
            Save
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={shareQRCode}
          disabled={isLoading}
        >
          <MaterialIcons name="share" size={24} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>
            Share
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={generateOfflineToken}
          disabled={isLoading}
        >
          <MaterialIcons name="offline-bolt" size={24} color="#fff" />
          <Text style={[styles.actionButtonText, { color: '#fff' }]}>
            Offline
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.hint, { color: colors.text }]}>
        Show this QR code to the inspector when boarding
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 150,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  hint: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
});
