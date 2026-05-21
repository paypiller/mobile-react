/**
 * OTP input component with individual digit boxes
 */
import React, { useMemo,  useRef, useState, useEffect } from 'react';
import { FontSize, FontWeight, Spacing, BorderRadius, Colors } from '../../constants/theme';
import { useThemeStyles } from '../../hooks/useTheme';
import {
  StyleSheet,
  View,
  TextInput,
  Animated,
  Pressable,
} from 'react-native';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  error = false,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);
  const styles = useThemeStyles(createStyles);

  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [error, shakeAnim]);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateX: shakeAnim }] }]}
    >
      <Pressable style={styles.boxRow} onPress={handlePress}>
        {Array.from({ length }).map((_, i) => {
          const isActive = i === value.length && isFocused;
          const isFilled = i < value.length;

          return (
            <View
              key={i}
              style={[
                styles.box,
                isActive && styles.boxActive,
                isFilled && styles.boxFilled,
                error && styles.boxError,
              ]}
            >
              <Animated.Text style={[styles.digit, error && styles.digitError]}>
                {value[i] || ''}
              </Animated.Text>
              {isActive && <View style={styles.cursor} />}
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={(text) => {
          if (text.length <= length && /^\d*$/.test(text)) {
            onChange(text);
          }
        }}
        keyboardType="number-pad"
        maxLength={length}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus
      />
    </Animated.View>
  );
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  boxRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  boxActive: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  boxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceElevated,
  },
  boxError: {
    borderColor: colors.error,
  },
  digit: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  digitError: {
    color: colors.error,
  },
  cursor: {
    position: 'absolute',
    bottom: 12,
    width: 2,
    height: 22,
    backgroundColor: colors.primary,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
});
