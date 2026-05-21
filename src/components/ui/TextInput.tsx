/**
 * Styled text input with floating label effect
 */
import React, { useMemo,  useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  TextInput as RNTextInput,
  Text,
  Animated,
  TextInputProps as RNTextInputProps,
  TouchableOpacity,
} from 'react-native';
import { BorderRadius, FontSize, Spacing, Colors } from '../../constants/theme';
import { useThemeStyles } from '../../hooks/useTheme';

interface TextInputProps extends RNTextInputProps {
  label: string;
  error?: string;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

export function TextInput({
  label,
  error,
  value,
  rightIcon,
  onRightIconPress,
  onFocus,
  onBlur,
  ...rest
}: TextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const labelAnim = useRef(new Animated.Value(value ? 1 : 0)).current;
  const styles = useThemeStyles(createStyles);

  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, labelAnim]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 8],
  });

  const labelSize = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [FontSize.md, FontSize.xs],
  });

  const borderColor = error
    ? Colors.error
    : isFocused
      ? Colors.primary
      : Colors.surfaceBorder;

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.container,
          {
            borderColor,
            height: rest.multiline ? undefined : 60,
            paddingTop: rest.multiline ? Spacing.lg : 0,
            justifyContent: rest.multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelSize,
              color: error
                ? Colors.error
                : isFocused
                  ? Colors.primary
                  : Colors.textMuted,
            },
          ]}
        >
          {label}
        </Animated.Text>
        <RNTextInput
          style={[
            styles.input,
            {
              paddingTop: rest.multiline ? Spacing.sm : 12,
              minHeight: rest.multiline ? 80 : '100%',
              textAlignVertical: rest.multiline ? 'top' : 'center',
            },
          ]}
          value={value}
          placeholderTextColor={Colors.textMuted}
          selectionColor={Colors.primary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightIcon && (
          <TouchableOpacity
            style={styles.rightIcon}
            onPress={onRightIconPress}
            activeOpacity={0.7}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.md,
  },
  container: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.md,
    minHeight: 60,
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: Spacing.md,
    backgroundColor: colors.surface,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  input: {
    fontSize: FontSize.md,
    color: colors.textPrimary,
  },
  rightIcon: {
    position: 'absolute',
    right: Spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  error: {
    color: colors.error,
    fontSize: FontSize.xs,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
});
