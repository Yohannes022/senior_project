import { NavigatorScreenParams } from '@react-navigation/native';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      'vehicle-details': { id: string };
      // Add other routes here as needed
    }
  }
}

export {};
