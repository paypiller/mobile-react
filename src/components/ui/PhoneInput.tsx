/**
 * Phone number input with country code selector
 * Reusable component for all phone number entries
 */
import React, { useMemo,  useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { BorderRadius, FontSize, Spacing, FontWeight, Colors } from '../../constants/theme';
import { useThemeStyles } from '../../hooks/useTheme';
import { Ionicons } from '@expo/vector-icons';

interface PhoneInputProps {
  label: string;
  value: string; // The 10-digit number without country code
  onChangeText: (text: string) => void;
  countryCode?: string;
  countryFlag?: string;
  error?: string;
  labelBackgroundColor?: string;
}

export function PhoneInput({
  label,
  value,
  onChangeText,
  countryCode = '+91',
  countryFlag = '🇮🇳',
  error,
  labelBackgroundColor = Colors.surface,
}: PhoneInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const styles = useThemeStyles(createStyles);
  const labelAnim = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value, labelAnim]);

  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, -10],
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

  const handleTextChange = (text: string) => {
    // Only allow digits, max 10
    const digits = text.replace(/\D/g, '').slice(0, 10);
    onChangeText(digits);
  };

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { borderColor }]}>
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
              // Background color to mask the border
              backgroundColor: labelBackgroundColor,
              paddingHorizontal: 4,
            },
          ]}
        >
          {label}
        </Animated.Text>

        <View style={styles.content}>
          {/* Country Badge */}
          <TouchableOpacity style={styles.countryBadge} activeOpacity={0.7}>
            <Text style={styles.flag}>{countryFlag}</Text>
            <Text style={styles.countryCode}>{countryCode}</Text>
            <Ionicons name="chevron-down" size={14} color={Colors.textMuted} />
          </TouchableOpacity>

          <View style={styles.separator} />

          {/* Number Input */}
          <RNTextInput
            style={styles.input}
            value={value}
            onChangeText={handleTextChange}
            keyboardType="number-pad"
            placeholder="98765 43210"
            placeholderTextColor={Colors.textMuted}
            selectionColor={Colors.primary}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={10}
          />
        </View>
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
    height: 60,
    justifyContent: 'center',
    position: 'relative',
  },
  label: {
    position: 'absolute',
    left: Spacing.md,
    zIndex: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  flag: {
    fontSize: 20,
  },
  countryCode: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  separator: {
    width: 1,
    height: '50%',
    backgroundColor: colors.surfaceBorder,
  },
  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: colors.textPrimary,
    paddingHorizontal: Spacing.md,
    height: '100%',
  },
  error: {
    color: colors.error,
    fontSize: FontSize.xs,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
});
