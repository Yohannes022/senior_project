import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function AddPaymentMethodScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          title: 'Add Payment Method',
          headerShown: true,
        }}
      />
      <Text>Add Payment Method Screen</Text>
    </View>
  );
}
