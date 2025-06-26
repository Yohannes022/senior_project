import { NavigatorScreenParams } from '@react-navigation/native';

type StaticRoutes = "/" | "/booking" | "/all-trips" | "/not-found";
type DynamicRoutes = "/vehicle-details/[id]";

type Routes = StaticRoutes | DynamicRoutes;

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      "(tabs)": NavigatorScreenParams<{
        index: undefined;
        schedule: undefined;
        map: undefined;
        profile: undefined;
        "vehicle-details": { id: string };
      }>;
      "vehicle-details": { id: string };
      booking: undefined;
      "all-trips": undefined;
      "not-found": undefined;
    }
  }
}
