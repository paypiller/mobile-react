/**
 * Login screen — phone number entry
 * Sends OTP via vendor context to backend
 * Country code is fixed to India (+91) only
 */
import React, { useMemo,  useState, useCallback } from 'react';
import { FontSize, FontWeight, Spacing, BorderRadius, Colors } from '../../src/constants/theme';
import { useThemeStyles } from '../../src/hooks/useTheme';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput as RNTextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';

const COUNTRY_CODE = '+91';
const COUNTRY_FLAG = '🇮🇳';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const styles = useThemeStyles(createStyles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const router = useRouter();
  const requestOtp = useAuthStore((s) => s.requestOtp);

  /** Accept only digits, max 10 */
  const handlePhoneChange = (raw: string) => {
    const digits = raw.replace(/\D/g, '').slice(0, 10);
    setPhone(digits);
    if (error) setError('');
  };

  const handleSendOtp = useCallback(async () => {
    if (phone.length !== 10) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    // Build E.164 format
    const e164 = `${COUNTRY_CODE}${phone}`;

    setError('');
    setLoading(true);

    try {
      const purpose = await requestOtp(e164);
      router.push({
        pathname: '/(auth)/otp',
        params: { phone: e164, purpose },
      });
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to send OTP. Please try again.';
      setError(message);
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }, [phone, requestOtp, router]);

  const borderColor = error
    ? Colors.error
    : isFocused
      ? Colors.primary
      : Colors.surfaceBorder;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo / Branding */}
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <View style={styles.logoCircle}>
                  <Ionicons
                    name="storefront"
                    size={36}
                    color={Colors.white}
                  />
                </View>
              </View>
              <Text style={styles.appName}>PayPiller</Text>
              <Text style={styles.tagline}>Vendor Portal</Text>
            </View>

            {/* Welcome text */}
            <View style={styles.welcomeSection}>
              <Text style={styles.welcomeTitle}>Welcome back</Text>
              <Text style={styles.welcomeSubtitle}>
                Enter your phone number to sign in or create a new vendor
                account
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Label */}
              <Text
                style={[
                  styles.inputLabel,
                  {
                    color: error
                      ? Colors.error
                      : isFocused
                        ? Colors.primary
                        : Colors.textMuted,
                  },
                ]}
              >
                Phone Number
              </Text>

              {/* Phone input row: country badge + number field */}
              <View style={[styles.phoneRow, { borderColor }]}>
                {/* Fixed India country code badge */}
                <View style={styles.countryBadge}>
                  <Text style={styles.flag}>{COUNTRY_FLAG}</Text>
                  <Text style={styles.countryCodeText}>{COUNTRY_CODE}</Text>
                </View>

                {/* Separator */}
                <View style={styles.separator} />

                {/* Number input */}
                <RNTextInput
                  style={styles.phoneInput}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="number-pad"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  placeholderTextColor={Colors.textMuted}
                  selectionColor={Colors.primary}
                  maxLength={10}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />

                {/* Phone icon */}
                <View style={styles.rightIcon}>
                  <Ionicons
                    name="call-outline"
                    size={20}
                    color={Colors.textMuted}
                  />
                </View>
              </View>

              {/* Error message */}
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Button
                title="Send OTP"
                onPress={handleSendOtp}
                loading={loading}
                disabled={phone.length !== 10}
                style={styles.button}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.link}>Terms of Service</Text> and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 12,
  },
  appName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSize.md,
    color: colors.primary,
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xxs,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  welcomeSection: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  form: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xxs,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    backgroundColor: colors.surface,
    height: 56,
    overflow: 'hidden',
  },
  countryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    gap: 6,
  },
  flag: {
    fontSize: 22,
  },
  countryCodeText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: colors.surfaceBorder,
  },
  phoneInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: colors.textPrimary,
    paddingHorizontal: Spacing.sm,
    height: '100%',
    letterSpacing: 0.5,
  },
  rightIcon: {
    paddingRight: Spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: FontSize.xs,
    marginTop: Spacing.xxs,
    marginLeft: Spacing.xs,
  },
  button: {
    marginTop: Spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.primary,
    fontWeight: FontWeight.medium,
  },
});
