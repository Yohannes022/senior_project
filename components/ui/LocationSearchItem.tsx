import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Location } from '@/types';
import theme from '@/constants/theme';
import { MapPin, Clock, Star, StarOff } from 'lucide-react-native';

interface LocationSearchItemProps {
  location: Location;
  onPress: (location: Location) => void;
  isRecent?: boolean;
  isFavorite?: boolean;
  onToggleFavorite?: (location: Location) => void;
}

const LocationSearchItem: React.FC<LocationSearchItemProps> = ({
  location,
  onPress,
  isRecent = false,
  isFavorite = false,
  onToggleFavorite
}) => {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(location)}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {isRecent ? (
          <Clock size={20} color={theme.colors.subtext} />
        ) : (
          <MapPin size={20} color={theme.colors.primary} />
        )}
      </View>
      
      <View style={styles.textContainer}>
        <Text style={styles.name}>{location.name || 'Location'}</Text>
        {location.address && (
          <Text style={styles.address} numberOfLines={1}>
            {location.address}
          </Text>
        )}
      </View>
      
      {onToggleFavorite && (
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => onToggleFavorite(location)}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          {isFavorite ? (
            <Star size={20} color={theme.colors.warning} fill={theme.colors.warning} />
          ) : (
            <StarOff size={20} color={theme.colors.subtext} />
          )}
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSizes.md,
    fontWeight: '500',
    color: theme.colors.text,
  },
  address: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.subtext,
    marginTop: 2,
  },
  favoriteButton: {
    padding: theme.spacing.xs,
  },
});

export default LocationSearchItem;