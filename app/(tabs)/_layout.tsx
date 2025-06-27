import React from "react";
import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

// These imports are for type checking and IDE support
// The actual components will be loaded via file-system based routing
import type { StackScreenProps } from "@react-navigation/stack";
type RootStackParamList = {
  index: undefined;
  schedule: undefined;
  wallet: undefined;
  map: undefined;
  profile: undefined;
  'vehicle-details': { id: string };
  payment: { amount: number; rideId: string };
  'payment-confirmation': { transactionId: string; amount: number };
  'qr-scanner': undefined;
  'transaction-history': undefined;
  'payment-methods': undefined;
  'add-payment-method': undefined;
  'send-money': undefined;
};

type Props = StackScreenProps<RootStackParamList>;

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.inactive,
          tabBarStyle: {
            borderTopWidth: 1,
            borderTopColor: Colors.border,
            height: 60,
            paddingBottom: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "500",
          },
          headerShown: false,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <Ionicons name="wallet" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Ionicons name="map" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
      </Tabs>
      
      {/* Non-tab screens */}
      <Stack.Screen 
        name="vehicle-details" 
        options={{ 
          title: 'Vehicle Details',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="payment" 
        options={{ 
          title: 'Payment',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }} 
      />
      <Stack.Screen 
        name="payment-confirmation" 
        options={{ 
          title: 'Payment Confirmation',
          headerShown: false,
          presentation: 'modal',
        }} 
      />
      <Stack.Screen 
        name="qr-scanner" 
        options={{ 
          title: 'Scan QR Code',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="transaction-history"
        options={{ 
          title: 'Transaction History',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="payment-methods"
        options={{ 
          title: 'Payment Methods',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="add-payment-method"
        options={{ 
          title: 'Add Payment Method',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="send-money" 
        options={{ 
          title: 'Send Money',
          headerShown: true,
          headerBackTitle: 'Back',
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </>
  );
}
