/**
 * Primary button component with loading state and glow effect
 */
import React, { useMemo } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, FontSize, FontWeight, Spacing, Shadows, Colors } from '../../constants/theme';
import { useThemeStyles } from '../../hooks/useTheme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  style,
  textStyle,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = useThemeStyles(createStyles);

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'ghost' && styles.ghost,
        isDisabled && styles.disabled,
        variant === 'primary' && !isDisabled && Shadows.glow,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? Colors.white : Colors.primary}
          size="small"
        />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <View
              style={[
                styles.iconCircle,
                variant === 'primary' && styles.iconCirclePrimary,
                variant === 'secondary' && styles.iconCircleSecondary,
                variant === 'ghost' && styles.iconCircleGhost,
              ]}
            >
              <Ionicons
                name={icon}
                size={18}
                color={
                  variant === 'primary'
                    ? Colors.buttonPrimary
                    : variant === 'secondary'
                      ? Colors.white
                      : Colors.buttonPrimary
                }
              />
            </View>
          )}
          <Text
            style={[
              styles.text,
              variant === 'secondary' && styles.secondaryText,
              variant === 'ghost' && styles.ghostText,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  base: {
    height: 56,
    borderRadius: BorderRadius.lg, // 16px is a good fit for the rounded look
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCirclePrimary: {
    backgroundColor: colors.white,
  },
  iconCircleSecondary: {
    backgroundColor: colors.primary,
  },
  iconCircleGhost: {
    backgroundColor: colors.surfaceBorder,
  },
  primary: {
    backgroundColor: colors.buttonPrimary,
  },
  secondary: {
    backgroundColor: colors.transparent,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  ghost: {
    backgroundColor: colors.transparent,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  secondaryText: {
    color: colors.primary,
  },
  ghostText: {
    color: colors.buttonPrimary,
  },
});
