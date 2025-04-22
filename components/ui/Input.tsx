import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  StyleProp,
  ViewStyle,
  TextStyle,
  TextInputProps
} from 'react-native';
import theme from '@/constants/theme';
import { X } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  clearable?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  clearable = false,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  value,
  onChangeText,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onChangeText) {
      onChangeText('');
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, labelStyle]}>
          {label}
        </Text>
      )}
      
      <View style={[
        styles.inputContainer,
        isFocused && styles.inputContainerFocused,
        error && styles.inputContainerError
      ]}>
        {leftIcon && (
          <View style={styles.leftIconContainer}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || (clearable && value)) && styles.inputWithRightIcon,
            inputStyle
          ]}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={theme.colors.subtext}
          {...rest}
        />
        
        {clearable && value && value.length > 0 ? (
          <TouchableOpacity 
            style={styles.rightIconContainer} 
            onPress={handleClear}
          >
            <X size={18} color={theme.colors.subtext} />
          </TouchableOpacity>
        ) : rightIcon ? (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        ) : null}
      </View>
      
      {error && (
        <Text style={[styles.error, errorStyle]}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSizes.sm,
    marginBottom: theme.spacing.xs,
    color: theme.colors.text,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.card,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.fontSizes.md,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.xs,
  },
  leftIconContainer: {
    paddingLeft: theme.spacing.md,
  },
  rightIconContainer: {
    paddingRight: theme.spacing.md,
  },
  error: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
});

export default Input;