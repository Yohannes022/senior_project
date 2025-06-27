import { NavigatorScreenParams } from '@react-navigation/native';
import 'react';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      '(tabs)': NavigatorScreenParams<TabsParamList>;
      'vehicle-details': { id: string };
    }
  }
}

type TabsParamList = {
  index: undefined;
  schedule: undefined;
  map: undefined;
  profile: undefined;
  'vehicle-details': { id: string };
};

declare const _default: () => JSX.Element;
export default _default;
