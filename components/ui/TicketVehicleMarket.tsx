import React from 'react';
import { View, StyleSheet } from 'react-native';
import { TransitVehicle, TransitRoute } from '@/types';
import { Bus, Train, Tram, Ship } from 'lucide-react-native';
import theme from '@/constants/theme';

interface TransitVehicleMarkerProps {
  vehicle: TransitVehicle;
  route: TransitRoute;
  size?: number;
}

const TransitVehicleMarker: React.FC<TransitVehicleMarkerProps> = ({
  vehicle,
  route,
  size = 32
}) => {
  const getVehicleIcon = () => {
    const iconColor = '#FFFFFF';
    const iconSize = size * 0.6;
    
    switch (route.type) {
      case 'bus':
        return <Bus size={iconSize} color={iconColor} />;
      case 'train':
      case 'subway':
        return <Train size={iconSize} color={iconColor} />;
      case 'tram':
        return <Tram size={iconSize} color={iconColor} />;
      case 'ferry':
        return <Ship size={iconSize} color={iconColor} />;
      default:
        return <Bus size={iconSize} color={iconColor} />;
    }
  };

  const getOccupancyColor = () => {
    switch (vehicle.occupancy) {
      case 'low':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'high':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: route.color || theme.colors.primary,
        transform: [{ rotate: `${vehicle.heading}deg` }]
      }
    ]}>
      <View style={styles.iconContainer}>
        {getVehicleIcon()}
      </View>
      <View style={[
        styles.occupancyIndicator,
        {
          width: size / 4,
          height: size / 4,
          borderRadius: size / 8,
          backgroundColor: getOccupancyColor()
        }
      ]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.medium,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  occupancyIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
});

export default TransitVehicleMarker;