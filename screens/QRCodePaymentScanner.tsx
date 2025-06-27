import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { BarCodeScanner, BarCodeScannerResult } from 'expo-barcode-scanner';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { walletService } from '@/services/walletService';
import { formatCurrency } from '@/utils/formatters';

const QRCodePaymentScanner: React.FC = () => {
  const { user } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [lastScannedData, setLastScannedData] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = async (result: BarCodeScannerResult) => {
    if (!isScanning || !user || processing) return;
    
    try {
      setIsScanning(false);
      setProcessing(true);
      
      // Parse the QR code data
      let qrData;
      try {
        qrData = JSON.parse(result.data);
        setLastScannedData(qrData);
      } catch (error) {
        console.error('Error parsing QR code data:', error);
        Alert.alert('Error', 'Invalid QR code format');
        return;
      }
      
      // Process the payment
      const paymentResult = await walletService.processQRPayment(result.data, user.id);
      
      if (paymentResult.success) {
        Alert.alert(
          'Payment Successful',
          `You've received ${formatCurrency(qrData.amount)} from the passenger.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setLastScannedData(null);
                setTimeout(() => setIsScanning(true), 2000);
              }
            }
          ]
        );
      } else {
        Alert.alert('Payment Failed', paymentResult.message || 'Failed to process payment');
        setTimeout(() => setIsScanning(true), 2000);
      }
    } catch (error) {
      console.error('Error processing QR code:', error);
      Alert.alert('Error', 'Failed to process QR code. Please try again.');
      setTimeout(() => setIsScanning(true), 2000);
    } finally {
      setProcessing(false);
    }
  };

  const renderCamera = () => {
    if (hasPermission === null) {
      return (
        <View style={styles.centered}>
          <Text>Requesting camera permission...</Text>
        </View>
      );
    }

    if (hasPermission === false) {
      return (
        <View style={styles.centered}>
          <MaterialIcons name="no-photography" size={64} color="#9E9E9E" />
          <Text style={styles.permissionText}>No access to camera</Text>
          <Text style={styles.permissionSubtext}>
            Please enable camera access in your device settings to scan QR codes.
          </Text>
        </View>
      );
    }

    return (
      <BarCodeScanner
        onBarCodeScanned={isScanning ? handleBarCodeScanned : undefined}
        style={StyleSheet.absoluteFillObject}
        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
      />
    );
  };

  const renderProcessingIndicator = () => {
    if (!processing) return null;
    
    return (
      <View style={styles.processingOverlay}>
        <View style={styles.processingContent}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.processingText}>Processing payment...</Text>
        </View>
      </View>
    );
  };

  const renderScannedData = () => {
    if (!lastScannedData) return null;
    
    return (
      <View style={styles.scannedDataContainer}>
        <Text style={styles.scanTitle}>Payment Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount:</Text>
          <Text style={styles.detailValue}>{formatCurrency(lastScannedData.amount)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ride ID:</Text>
          <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
            {lastScannedData.rideId}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>User ID:</Text>
          <Text style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
            {lastScannedData.userId}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderCamera()}
      {renderProcessingIndicator()}
      
      <View style={styles.overlay}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Scan Payment QR Code</Text>
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
        
        {renderScannedData()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    color: '#212121',
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    width: '100%',
    paddingTop: 40,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
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
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  processingContent: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#212121',
  },
  scannedDataContainer: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#212121',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#757575',
  },
  detailValue: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
    maxWidth: '60%',
  },
});

export default QRCodePaymentScanner;
