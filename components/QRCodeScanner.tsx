import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '@react-navigation/native';
import * as Network from 'expo-network';
import { QRCodeService } from '@/services/qrCodeService';
import { useAuth } from '@/contexts/AuthContext';

interface QRCodeScannerProps {
  onScanComplete: (result: { 
    success: boolean; 
    message: string; 
    ticketId?: string;
    isOffline?: boolean;
  }) => void;
  onClose: () => void;
  offlineMode?: boolean;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ 
  onScanComplete, 
  onClose, 
  offlineMode = false 
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const { user } = useAuth();
  const { colors } = useTheme();

  // Check network status
  // const checkNetworkStatus = useCallback(async () => {
  //   try {
  //     const networkState = await Network.getNetworkStateAsync();
  //     setIsOnline(networkState.isConnected && networkState.isInternetReachable);
      
  //     if (!networkState.isConnected && !offlineMode) {
  //       Alert.alert(
  //         'Offline Mode',
  //         'You are currently offline. Some features may be limited.',
  //         [{ text: 'Continue in Offline Mode' }]
  //       );
  //     }
      
  //     return networkState.isConnected && networkState.isInternetReachable;
  //   } catch (error) {
  //     console.error('Error checking network status:', error);
  //     return false;
  //   }
  // }, [offlineMode]);

  const checkNetworkStatus = useCallback(async () => {
    try {
      const networkState = await Network.getNetworkStateAsync();
      // Add nullish coalescing to ensure boolean value
      const isOnline = !!(networkState.isConnected && networkState.isInternetReachable);
      setIsOnline(isOnline);
      
      if (!isOnline && !offlineMode) {
        Alert.alert(
          'Offline Mode',
          'You are currently offline. Some features may be limited.',
          [{ text: 'Continue in Offline Mode' }]
        );
      }
      
      return isOnline;
    } catch (error) {
      console.error('Error checking network status:', error);
      setIsOnline(false);
      return false;
    }
  }, [offlineMode]);

  useEffect(() => {
    const setupScanner = async () => {
      // Request camera permissions
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
      
      // Check network status
      await checkNetworkStatus();
      
      // Set up network status listener
      if (Platform.OS !== 'web') {
        const subscription = Network.addNetworkStateListener(({ isConnected, isInternetReachable }) => {
          setIsOnline(!!(isConnected && isInternetReachable));
        });
        
        return () => {
          subscription && subscription.remove();
        };
      }
    };
    
    setupScanner();
  }, [checkNetworkStatus]);

  const handleBarCodeScanned = async ({ data }: BarCodeScannerResult) => {
    if (!isScanning) return;
    
    try {
      setIsScanning(false);
      
      // Check if we're in offline mode or online
      const isConnected = await checkNetworkStatus();
      
      if (offlineMode || !isConnected) {
        // Offline validation
        const validation = await QRCodeService.validateOfflineToken(data);
        
        if (validation.isValid && validation.ticketId) {
          onScanComplete({
            success: true,
            message: 'QR Code is valid!',
            ticketId: validation.ticketId,
            isOffline: true
          });
        } else {
          onScanComplete({
            success: false,
            message: validation.error || 'Invalid QR code',
            isOffline: true
          });
        }
      } else {
        // Online validation
        const validation = await QRCodeService.validateQRCode(data);
        
        if (validation.isValid && validation.data) {
          onScanComplete({
            success: true,
            message: 'QR Code is valid!',
            ticketId: validation.data.ticketId,
            isOffline: false
          });
        } else {
          onScanComplete({
            success: false,
            message: validation.error || 'Invalid QR code',
            isOffline: false
          });
        }
      }
    } catch (error) {
      console.error('Error validating QR code:', error);
      onScanComplete({
        success: false,
        message: 'Error validating subscription. Please try again.',
      });
    } finally {
      // Reset scanner after a short delay
      setTimeout(() => {
        setIsScanning(true);
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.text, { color: colors.text, marginTop: 16 }]}>
          Requesting camera permission...
        </Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <MaterialIcons name="no-photography" size={64} color={colors.notification} />
        <Text style={[styles.text, { color: colors.text, marginVertical: 16 }]}>
          Camera permission is required to scan QR codes
        </Text>
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: '#fff' }]}>Close</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BarCodeScanner
        onBarCodeScanned={isScanning ? handleBarCodeScanned : undefined}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />
      <View style={styles.overlay}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={28} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Scan QR Code</Text>
          <View style={{ width: 28 }} />
        </View>
        
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        
        <Text style={styles.instructionText}>
          Align the QR code within the frame to scan
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: 'white',
    backgroundColor: 'transparent',
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  instructionText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  text: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  permissionSubtext: {
    marginTop: 8,
    textAlign: 'center',
    fontSize: 14,
    opacity: 0.8,
  },
});
