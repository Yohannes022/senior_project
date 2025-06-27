import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function VehicleDetailsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="[id]" 
        options={{ 
          title: 'Vehicle Details',
          headerStyle: {
            backgroundColor: Colors.primary,
          },
          headerTintColor: '#fff',
        }} 
      />
    </Stack>
  );
}
