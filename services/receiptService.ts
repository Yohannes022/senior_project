import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { Platform } from 'react-native';
import { formatCurrency } from '@/utils/formatters';

interface ReceiptData {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  date: Date;
  customer: {
    email: string;
    name?: string;
  };
  items?: Array<{
    description: string;
    quantity: number;
    amount: number;
  }>;
  metadata?: Record<string, any>;
}

export const receiptService = {
  async generateReceiptPdf(receiptData: ReceiptData): Promise<string> {
    const html = generateReceiptHtml(receiptData);
    
    try {
      const { uri } = await Print.printToFileAsync({
        html,
        width: 612,  // 8.5in in points (72dpi)
        height: 792, // 11in in points
        base64: false,
      });
      
      return uri;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      throw new Error('Failed to generate receipt');
    }
  },

  async shareReceipt(pdfUri: string): Promise<void> {
    if (!(await Sharing.isAvailableAsync())) {
      throw new Error('Sharing is not available on this device');
    }

    try {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Receipt',
        UTI: 'com.adobe.pdf',
      });
    } catch (error) {
      console.error('Error sharing receipt:', error);
      throw new Error('Failed to share receipt');
    }
  },

  async saveReceiptLocally(pdfUri: string, fileName: string): Promise<string> {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    
    if (!permissions.granted) {
      throw new Error('Storage permission not granted');
    }

    try {
      const fileUri = `${permissions.directoryUri || FileSystem.documentDirectory}${fileName}.pdf`;
      await FileSystem.copyAsync({
        from: pdfUri,
        to: fileUri,
      });
      return fileUri;
    } catch (error) {
      console.error('Error saving receipt:', error);
      throw new Error('Failed to save receipt');
    }
  },
};

function generateReceiptHtml(receipt: ReceiptData): string {
  const formattedDate = receipt.date.toLocaleDateString('en-ET', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const itemsHtml = receipt.items?.map(item => `
    <tr>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.amount, receipt.currency)}</td>
      <td>${formatCurrency(item.amount * item.quantity, receipt.currency)}</td>
    </tr>
  `).join('') || '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Receipt #${receipt.id}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 20px; }
        .logo { max-width: 150px; margin-bottom: 10px; }
        h1 { margin: 0; font-size: 24px; color: #2c3e50; }
        .receipt-info { margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .info-label { font-weight: bold; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #777; }
        .status { 
          display: inline-block; 
          padding: 5px 10px; 
          border-radius: 4px; 
          font-weight: bold;
          background-color: ${receipt.status === 'success' ? '#d4edda' : '#f8d7da'}; 
          color: ${receipt.status === 'success' ? '#155724' : '#721c24'};
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Sheger Transit+</h1>
        <p>Receipt #${receipt.id}</p>
        <p><span class="status">${receipt.status.toUpperCase()}</span></p>
      </div>
      
      <div class="receipt-info">
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span>${formattedDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Transaction ID:</span>
          <span>${receipt.transactionId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Payment Method:</span>
          <span>${receipt.paymentMethod}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Customer:</span>
          <span>${receipt.customer.name || receipt.customer.email}</span>
        </div>
      </div>
      
      ${receipt.items ? `
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Qty</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div class="total">
        Total: ${formatCurrency(receipt.amount, receipt.currency)}
      </div>
      ` : ''}
      
      ${receipt.metadata?.note ? `
      <div class="note">
        <p><strong>Note:</strong> ${receipt.metadata.note}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Thank you for choosing Sheger Transit+</p>
        <p>For inquiries, please contact support@shegertransit.com</p>
      </div>
    </body>
    </html>
  `;
}
