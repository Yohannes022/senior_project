import { NavigatorScreenParams } from '@react-navigation/native';

type StaticRoutes = 
  | "/" 
  | "/booking" 
  | "/all-trips" 
  | "/not-found"
  | "/help"
  | "/report-lost-item"
  | "/emergency";

type DynamicRoutes = 
  | "/vehicle-details/[id]"
  | `/destination/[id]`
  | `${string}/[id]`;

type Routes = StaticRoutes | DynamicRoutes;

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "(tabs)": NavigatorScreenParams<{
        index: undefined;
        schedule: undefined;
        map: undefined;
        profile: undefined;
        wallet: undefined;
      }>;
      "vehicle-details": { id: string };
      "destination/[id]": { id: string };
      booking: undefined;
      "all-trips": undefined;
      "not-found": undefined;
      "help": undefined;
      "report-lost-item": undefined;
      "emergency": undefined;
      [key: string]: any; // Allow any string key for dynamic routes
    }
  }
}
