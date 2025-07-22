import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { useSegments, Href } from 'expo-router';
import Colors from "@/constants/colors";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ActivityIndicator } from "react-native";

// Auth wrapper component to handle authentication state
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const segments = useSegments() as string[];

  useEffect(() => {
    if (isLoading) return;

    // Get the current route segments
    const inAuthGroup = segments[0] === '(auth)';
    const isOtpLogin = segments[segments.length - 1] === 'otp-login';
    const isSignup = segments[segments.length - 1] === 'signup';
    const isPublicRoute = isOtpLogin || isSignup;

    if (!user && !isPublicRoute) {
      // User is not signed in and not on a public page
      router.replace('/otp-login' as Href<never>);
    } else if (user && (segments.length === 0 || isOtpLogin || isSignup)) {
      // User is signed in and either at root or on a public page they shouldn't see when logged in
      router.replace('/(tabs)' as Href<never>);
    }

    // Only hide splash screen when we're done with auth check
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [user, isLoading, segments, router]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'right', 'left', 'bottom']}>
      <AuthProvider>
        <AuthWrapper>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: styles.screenContent,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="otp-login" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="booking" />
            <Stack.Screen name="map-screen" options={{ headerShown: true, title: 'Map' }} />
            <Stack.Screen name="trip-planner" options={{ headerShown: true, title: 'Plan Your Trip' }} />
            <Stack.Screen name="search" options={{ headerShown: true, title: 'Search' }} />
            <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
            <Stack.Screen name="edit-profile" options={{ headerShown: true, title: 'Edit Profile' }} />
            <Stack.Screen name="vehicle-details" options={{ headerShown: true, title: 'Vehicle Details' }} />
            <Stack.Screen name="signup" options={{ headerShown: false, animation: 'fade' }} />
          </Stack>
        </AuthWrapper>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    width: '100%',
    height: '100%',
  },
  screenContent: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
