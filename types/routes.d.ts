import type { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  '(tabs)': NavigatorScreenParams<TabsParamList>;
  'vehicle-details': { id: string };
  'booking': undefined;
  'all-trips': undefined;
  'not-found': undefined;
};

export type TabsParamList = {
  index: undefined;
  schedule: undefined;
  map: undefined;
  profile: undefined;
  'vehicle-details': { id: string };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
