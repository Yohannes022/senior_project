import React from "react";
import { Stack, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { StyleSheet } from "react-native";
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
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: Colors.border,
            height: 75,
            paddingTop: 8,
            paddingBottom: 8,
            paddingHorizontal: 14,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
          headerShown: true,
        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Schedule",
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: "Wallet",
          tabBarIcon: ({ color }) => <Ionicons name="wallet" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color }) => <Ionicons name="map" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <Ionicons name="person" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="vehicle-details"
        options={{
          title: "Vehicle\nDetails",
          tabBarIcon: ({ color }) => <Ionicons name="car" size={22} color={color} />,
        }}  
      />
      </Tabs>
    </>
  );
}
