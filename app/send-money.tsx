import { View, Text } from 'react-native';
import { Stack } from 'expo-router';

export default function SendMoneyScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Stack.Screen
        options={{
          title: 'Send Money',
          headerShown: true,
        }}
      />
      <Text>Send Money Screen</Text>
    </View>
  );
}
