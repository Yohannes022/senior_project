import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function PaymentMethodsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          title: 'Payment Methods',
          headerShown: true,
        }}
      />
      <Text>Payment Methods Screen</Text>
    </View>
  );
}
