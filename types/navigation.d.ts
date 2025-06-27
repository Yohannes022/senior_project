import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
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
