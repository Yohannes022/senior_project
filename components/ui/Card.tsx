import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import theme from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevation?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  elevation = 'small',
  padding = 'medium',
  borderRadius = 'medium'
}) => {
  const getElevationStyle = () => {
    switch (elevation) {
      case 'none':
        return {};
      case 'small':
        return theme.shadows.small;
      case 'large':
        return theme.shadows.large;
      default: // medium
        return theme.shadows.medium;
    }
  };

  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'small':
        return { padding: theme.spacing.sm };
      case 'large':
        return { padding: theme.spacing.lg };
      default: // medium
        return { padding: theme.spacing.md };
    }
  };

  const getBorderRadiusStyle = () => {
    switch (borderRadius) {
      case 'none':
        return { borderRadius: 0 };
      case 'small':
        return { borderRadius: theme.borderRadius.sm };
      case 'large':
        return { borderRadius: theme.borderRadius.lg };
      default: // medium
        return { borderRadius: theme.borderRadius.md };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getElevationStyle(),
        getPaddingStyle(),
        getBorderRadiusStyle(),
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    overflow: 'hidden',
  },
});

export default Card;