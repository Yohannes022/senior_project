import { paymentService } from '@/services/paymentService';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionId, amount, reason } = req.body;
    
    if (!transactionId || amount === undefined) {
      return res.status(400).json({
        error: 'Missing required parameters',
        success: false
      });
    }

    const result = await paymentService.processRefund(
      transactionId,
      amount,
      reason
    );

    return res.status(200).json({
      success: result.success,
      message: result.message
    });
  } catch (error) {
    console.error('Refund processing error:', error);
    return res.status(500).json({
      error: 'Failed to process refund',
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
