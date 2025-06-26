import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { View, Text } from "react-native";
import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import Colors from "@/constants/colors";

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

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
            title: 'Sheger Transit',
          }} 
        />
        <Stack.Screen 
          name="vehicle-details/[id]" 
          options={{ 
            title: 'Vehicle Details',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="booking" 
          options={{ 
            title: 'Book a Ride',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="all-trips" 
          options={{ 
            title: 'My Trips',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: '#fff',
          }} 
        />
        <Stack.Screen 
          name="not-found" 
          options={{ 
            title: 'Not Found',
            headerStyle: {
              backgroundColor: Colors.primary,
            },
            headerTintColor: '#fff',
          }} 
        />
      </Stack>
    </>
  );
}
