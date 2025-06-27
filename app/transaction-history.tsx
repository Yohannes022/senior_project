import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function TransactionHistoryScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          title: 'Transaction History',
          headerShown: true,
        }}
      />
      <Text>Transaction History Screen</Text>
    </View>
  );
}
