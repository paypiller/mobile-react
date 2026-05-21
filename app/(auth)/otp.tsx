import React, { useMemo,  useState, useCallback, useEffect } from 'react';
import { FontSize, FontWeight, Spacing, Colors } from '../../src/constants/theme';
import { useThemeStyles } from '../../src/hooks/useTheme';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { OtpInput } from '../../src/components/ui/OtpInput';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';

export default function OtpScreen() {
  const { phone, purpose } = useLocalSearchParams<{
    phone: string;
    purpose: string;
  }>();
  const [otp, setOtp] = useState('');
  const styles = useThemeStyles(createStyles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const router = useRouter();
  const { verifyOtp, requestOtp } = useAuthStore();
  
  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6 || !phone || !purpose) return;

    setError(false);
    setLoading(true);

    try {
      const result = await verifyOtp(phone, otp, purpose);

      if (result === 'signup') {
        router.replace({
          pathname: '/(auth)/complete-profile',
          params: { phone },
        });
      } else if (result === 'vendor_setup') {
        router.replace({
          pathname: '/(auth)/vendor-setup',
          params: { phone },
        });
      }
      // If 'login', the root layout's auth guard will redirect to home
    } catch (err: unknown) {
      setError(true);
      setOtp('');
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Verification Failed', message);
    } finally {
      setLoading(false);
    }
  }, [otp, phone, purpose, verifyOtp, router]);

  const handleResend = useCallback(async () => {
    if (!phone || countdown > 0) return;
    try {
      await requestOtp(phone);
      setCountdown(60);
      setOtp('');
      setError(false);
      Alert.alert('OTP Resent', 'A new OTP has been sent to your phone.');
    } catch {
      Alert.alert('Error', 'Failed to resend OTP.');
    }
  }, [phone, countdown, requestOtp]);

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
            {/* Back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons
                  name="shield-checkmark"
                  size={32}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.title}>Verify your number</Text>
              <Text style={styles.subtitle}>
                We've sent a 6-digit code to{"\n"}
                <Text style={styles.phoneNumber}>{phone}</Text>
              </Text>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <OtpInput
                value={otp}
                onChange={setOtp}
                error={error}
              />
            </View>

            {/* Verify button */}
            <Button
              title="Verify & Continue"
              onPress={handleVerify}
              loading={loading}
              disabled={otp.length !== 6}
              style={styles.button}
            />

            {/* Resend */}
            <View style={styles.resendContainer}>
              <Text style={styles.resendText}>Didn't receive the code? </Text>
              {countdown > 0 ? (
                <Text style={styles.countdown}>
                  Resend in {countdown}s
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              )}
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    color: colors.primary,
    fontWeight: FontWeight.semibold,
  },
  otpContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  button: {
    marginBottom: Spacing.lg,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    fontSize: FontSize.sm,
    color: colors.textMuted,
  },
  countdown: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  resendLink: {
    fontSize: FontSize.sm,
    color: colors.primary,
    fontWeight: FontWeight.semibold,
  },
});
