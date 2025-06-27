import { NavigatorScreenParams } from '@react-navigation/native';

type Routes = {
  // Tabs
  '(tabs)': NavigatorScreenParams<TabParamList>;
  
  // Auth
  'login': undefined;
  'register': undefined;
  'forgot-password': undefined;
  
  // Help & Support
  'help': undefined;
  'report-lost-item': undefined;
  'emergency': undefined;
  
  // Other screens
  [key: string]: any; // This allows any string key with any value
};

export type RootStackParamList = Routes & {
  // Tabs
  '(tabs)': NavigatorScreenParams<TabParamList>;
  
  // Auth
  'login': undefined;
  'register': undefined;
  'forgot-password': undefined;
  
  // Wallet
  'wallet': undefined;
  'transaction-history': undefined;
  'payment-methods': undefined;
  'add-payment-method': undefined;
  'send-money': undefined;
  'payment': {
    amount: number;
    rideId: string;
    type: 'ride' | 'wallet-topup';
  };
  'payment-confirmation': {
    transactionId: string;
    amount: number;
  };
  
  // Other screens
  'qr-scanner': undefined;
  'vehicle-details': { id: string };
  'settings': undefined;
  'profile': undefined;
  'notifications': undefined;
  'help': undefined;
  'report-lost-item': undefined;
  'emergency': undefined;
};

export type TabParamList = {
  'home': undefined;
  'schedule': undefined;
  'map': undefined;
  'wallet': undefined;
  'profile': undefined;
};

// This allows type checking for route names
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
