/**
 * Vendor setup screen
 * Shown for existing users who don't have a vendor account yet
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

export default function VendorSetupScreen() {
  const [vendorName, setVendorName] = useState('');
  const styles = useThemeStyles(createStyles);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const completeVendorSetup = useAuthStore((s) => s.completeVendorSetup);

  const validate = (): boolean => {
    if (!vendorName.trim()) {
      setError('Business name is required');
      return false;
    }
    setError('');
    return true;
  };

  const handleComplete = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await completeVendorSetup({
        vendorName: vendorName.trim(),
      });
      // Auth guard in root layout will redirect to home
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || 'Failed to set up vendor. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorName, completeVendorSetup]);

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
                  name="business"
                  size={32}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.title}>Vendor Setup</Text>
              <Text style={styles.subtitle}>
                You already have a user account. Let's set up your business details.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                label="Business Name"
                placeholder="e.g. Paypiller Rentals"
                value={vendorName}
                onChangeText={(t) => {
                  setVendorName(t);
                  if (error) setError('');
                }}
                error={error}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleComplete}
                rightIcon={
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={Colors.textMuted}
                  />
                }
              />

              <Button
                title="Create Vendor Profile"
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
    paddingHorizontal: Spacing.md,
    lineHeight: 22,
  },
  form: {
    flex: 1,
  },
  button: {
    marginTop: Spacing.md,
  },
});
