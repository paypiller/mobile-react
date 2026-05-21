/**
 * Profile completion screen
 * Shown after OTP verification for new vendor signups
 */
import React, { useMemo,  useState, useCallback } from 'react';
import { FontSize, FontWeight, Spacing, Colors } from '../../src/constants/theme';
import { useThemeStyles } from '../../src/hooks/useTheme';
import {
  StyleSheet,
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { TextInput } from '../../src/components/ui/TextInput';
import { Button } from '../../src/components/ui/Button';
import { useAuthStore } from '../../src/stores/auth.store';
import { Ionicons } from '@expo/vector-icons';

export default function CompleteProfileScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [email, setEmail] = useState('');
  const styles = useThemeStyles(createStyles);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const completeProfile = useAuthStore((s) => s.completeProfile);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!vendorName.trim()) newErrors.vendorName = 'Business name is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleComplete = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await completeProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        vendorName: vendorName.trim(),
        email: email.trim() || undefined,
      });
      // Auth guard in root layout will redirect to home
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to complete profile. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, lastName, vendorName, email, completeProfile]);

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
                  name="person-add"
                  size={32}
                  color={Colors.success}
                />
              </View>
              <Text style={styles.title}>Create your profile</Text>
              <Text style={styles.subtitle}>
                Set up your vendor account to get started
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={(t) => {
                  setFirstName(t);
                  if (errors.firstName) {
                    setErrors((e) => ({ ...e, firstName: '' }));
                  }
                }}
                error={errors.firstName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={(t) => {
                  setLastName(t);
                  if (errors.lastName) {
                    setErrors((e) => ({ ...e, lastName: '' }));
                  }
                }}
                error={errors.lastName}
                autoCapitalize="words"
                returnKeyType="next"
              />

              <TextInput
                label="Business Name"
                value={vendorName}
                onChangeText={(t) => {
                  setVendorName(t);
                  if (errors.vendorName) {
                    setErrors((e) => ({ ...e, vendorName: '' }));
                  }
                }}
                error={errors.vendorName}
                autoCapitalize="words"
                returnKeyType="next"
                rightIcon={
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={Colors.textMuted}
                  />
                }
              />

              <TextInput
                label="Email (Optional)"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (errors.email) {
                    setErrors((e) => ({ ...e, email: '' }));
                  }
                }}
                error={errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="done"
                rightIcon={
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.textMuted}
                  />
                }
              />

              <Button
                title="Complete Setup"
                onPress={handleComplete}
                loading={loading}
                style={styles.button}
              />
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
    marginBottom: Spacing.xl,
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
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: Spacing.md,
  },
});
