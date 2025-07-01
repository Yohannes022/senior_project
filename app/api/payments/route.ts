import { paymentService } from '@/services/paymentService';

export default async function handler(req: any, res: any) {
  // Handle POST request for payment initialization
  if (req.method === 'POST') {
    try {
      const { provider, ...paymentData } = req.body;
      
      if (!['chapa', 'flutterwave'].includes(provider)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment provider'
        });
      }

      const result = await paymentService.initializePayment(
        provider as 'chapa' | 'flutterwave',
        paymentData
      );

      return res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Payment initialization error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to initialize payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  // Handle GET request for payment verification
  if (req.method === 'GET') {
    try {
      const { tx_ref: txRef, provider } = req.query;

      if (!txRef || !provider) {
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      if (!['chapa', 'flutterwave'].includes(provider)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid payment provider'
        });
      }

      const verification = await paymentService.verifyPayment(
        provider as 'chapa' | 'flutterwave',
        txRef
      );

      // Generate receipt after successful verification
      const receipt = await paymentService.generateReceipt(verification);

      return res.status(200).json({
        success: true,
        data: {
          verification,
          receipt
        }
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to verify payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
