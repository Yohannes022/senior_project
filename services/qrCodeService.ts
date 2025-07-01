import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

type QRCodeData = {
  ticketId: string;
  userId: string;
  expiresAt: number;
  signature: string;
};

export const QRCodeService = {
  // Generate a secure signature for the QR code data
  async generateSignature(data: Omit<QRCodeData, 'signature'>, secret: string): Promise<string> {
    const str = `${data.ticketId}:${data.userId}:${data.expiresAt}:${secret}`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      str
    );
  },

  // Generate QR code data with signature
  async generateQRCodeData(
    ticketId: string,
    userId: string,
    expiresInHours: number = 24
  ): Promise<string> {
    const secret = await SecureStore.getItemAsync('QR_CODE_SECRET') || 
                  await this.generateAndStoreSecret();
    
    const expiresAt = Date.now() + (expiresInHours * 60 * 60 * 1000);
    const data: Omit<QRCodeData, 'signature'> = {
      ticketId,
      userId,
      expiresAt,
    };

    const signature = await this.generateSignature(data, secret);
    const qrData: QRCodeData = { ...data, signature };
    
    return JSON.stringify(qrData);
  },

  // Validate QR code data
  async validateQRCode(qrDataString: string): Promise<{
    isValid: boolean;
    isExpired: boolean;
    data?: QRCodeData;
    error?: string;
  }> {
    try {
      const qrData = JSON.parse(qrDataString) as QRCodeData;
      
      // Check if QR code is expired
      if (Date.now() > qrData.expiresAt) {
        return { isValid: false, isExpired: true, error: 'QR code has expired' };
      }

      // Get the secret from secure storage
      const secret = await SecureStore.getItemAsync('QR_CODE_SECRET');
      if (!secret) {
        return { isValid: false, isExpired: false, error: 'Validation error' };
      }

      // Verify the signature
      const { signature, ...data } = qrData;
      const expectedSignature = await this.generateSignature(data, secret);
      
      const isValid = signature === expectedSignature;
      return {
        isValid,
        isExpired: false,
        data: qrData,
        error: isValid ? undefined : 'Invalid QR code signature'
      };
    } catch (error) {
      return { 
        isValid: false, 
        isExpired: false, 
        error: 'Invalid QR code format' 
      };
    }
  },

  // Generate and store a new secret if one doesn't exist
  async generateAndStoreSecret(): Promise<string> {
    const secret = Array.from(Crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    await SecureStore.setItemAsync('QR_CODE_SECRET', secret);
    return secret;
  },

  // Save QR code as an image
  async saveQRCode(data: string, fileName: string = 'ticket-qr.png'): Promise<string> {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    const fileUri = `${FileSystem.documentDirectory}${fileName}`;
    
    const { uri } = await FileSystem.downloadAsync(qrCodeUrl, fileUri);
    return uri;
  },

  // Share QR code
  async shareQRCode(data: string): Promise<void> {
    const uri = await this.saveQRCode(data, 'share-qr.png');
    await Sharing.shareAsync(uri);
  },

  // Request camera permissions for scanning
  async requestCameraPermission(): Promise<boolean> {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    return status === 'granted';
  },

  // Generate a secure token for offline validation
  async generateOfflineToken(ticketId: string, validityInHours: number = 1): Promise<string> {
    const secret = await SecureStore.getItemAsync('QR_CODE_SECRET') || 
                  await this.generateAndStoreSecret();
    
    const expiresAt = Date.now() + (validityInHours * 60 * 60 * 1000);
    const data = `${ticketId}:${expiresAt}`;
    const signature = await this.generateSignature(
      { ticketId, userId: 'offline', expiresAt },
      secret
    );
    
    return `${data}:${signature}`;
  },

  // Validate offline token
  async validateOfflineToken(token: string): Promise<{
    isValid: boolean;
    isExpired: boolean;
    ticketId?: string;
    error?: string;
  }> {
    try {
      const [ticketId, expiresAtStr, signature] = token.split(':');
      const expiresAt = parseInt(expiresAtStr, 10);
      
      // Check if token is expired
      if (Date.now() > expiresAt) {
        return { isValid: false, isExpired: true, error: 'Token has expired' };
      }

      // Get the secret from secure storage
      const secret = await SecureStore.getItemAsync('QR_CODE_SECRET');
      if (!secret) {
        return { isValid: false, isExpired: false, error: 'Validation error' };
      }

      // Verify the signature
      const expectedSignature = await this.generateSignature(
        { ticketId, userId: 'offline', expiresAt },
        secret
      );
      
      const isValid = signature === expectedSignature;
      return {
        isValid,
        isExpired: false,
        ticketId: isValid ? ticketId : undefined,
        error: isValid ? undefined : 'Invalid token signature'
      };
    } catch (error) {
      return { 
        isValid: false, 
        isExpired: false, 
        error: 'Invalid token format' 
      };
    }
  }
};

export default QRCodeService;
