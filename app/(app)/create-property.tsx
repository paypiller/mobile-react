/**
 * Create Property screen
 * Multi-step form for creating a new property under the active vendor
 */
import React, { useMemo,  useState } from 'react';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadows, Colors } from '../../src/constants/theme';
import { useThemeStyles } from '../../src/hooks/useTheme';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { TextInput } from '../../src/components/ui/TextInput';
import { PhoneInput } from '../../src/components/ui/PhoneInput';
import { Button } from '../../src/components/ui/Button';
import { propertyService } from '../../src/services/property.service';
import { usePropertyStore } from '../../src/stores/property.store';
import { Ionicons } from '@expo/vector-icons';
import type { CreatePropertyPayload, Property } from '../../src/types';

const PROPERTY_TYPES: { value: Property['propertyType']; label: string; icon: string }[] = [
  { value: 'pg', label: 'PG', icon: 'bed-outline' },
  { value: 'apartment', label: 'Apartment', icon: 'business-outline' },
  { value: 'co_living', label: 'Co-Living', icon: 'people-outline' },
  { value: 'hostel', label: 'Hostel', icon: 'home-outline' },
  { value: 'villa', label: 'Villa', icon: 'leaf-outline' },
  { value: 'independent_house', label: 'House', icon: 'home-outline' },
];

export default function CreatePropertyScreen() {
  const router = useRouter();
  const styles = useThemeStyles(createStyles);
  const { fetchProperties } = usePropertyStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [propertyType, setPropertyType] = useState<Property['propertyType']>('pg');
  const [description, setDescription] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('India');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [caretakerName, setCaretakerName] = useState('');
  const [caretakerPhone, setCaretakerPhone] = useState('');

    const canSubmit =
    name.trim() &&
    addressLine1.trim() &&
    city.trim() &&
    state.trim() &&
    pincode.trim() &&
    country.trim();

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreatePropertyPayload = {
        name: name.trim(),
        slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'), // Basic slug for validation
        propertyType,
        description: description.trim() || undefined,
        amenities: [],
        rules: {},
        address: {
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2.trim() || undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          country: country.trim(),
          lat: lat ? parseFloat(lat) : undefined,
          lng: lng ? parseFloat(lng) : undefined,
        },
        contact: {
          phone: contactPhone.trim() ? `+91${contactPhone.trim()}` : undefined,
          email: contactEmail.trim() || undefined,
          emergencyPhone: emergencyPhone.trim() ? `+91${emergencyPhone.trim()}` : undefined,
          caretakerName: caretakerName.trim() || undefined,
          caretakerPhone: caretakerPhone.trim() ? `+91${caretakerPhone.trim()}` : undefined,
        },
      };

      await propertyService.createProperty(payload);

      // Refresh properties list and navigate back
      await fetchProperties();
      Alert.alert('Success', 'Property created successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error: any) {
      const message =
        error?.response?.data?.message || 'Failed to create property. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Property</Text>
          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Property Type Picker */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Type</Text>
              <View style={styles.typeGrid}>
                {PROPERTY_TYPES.map((type) => {
                  const isSelected = propertyType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[styles.typeCard, isSelected && styles.typeCardSelected]}
                      onPress={() => setPropertyType(type.value)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={type.icon as any}
                        size={24}
                        color={isSelected ? Colors.white : Colors.textSecondary}
                      />
                      <Text
                        style={[styles.typeLabel, isSelected && styles.typeLabelSelected]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Basic Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Info</Text>
              <View style={[styles.formCard, Shadows.sm]}>
                <TextInput
                  label="Property Name *"
                  placeholder="e.g. Lakshmi PG HSR"
                  value={name}
                  onChangeText={setName}
                />
                <TextInput
                  label="Description"
                  placeholder="Brief description of your property"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                />
              </View>
            </View>

            {/* Address */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Address</Text>
              <View style={[styles.formCard, Shadows.sm]}>
                <TouchableOpacity
                  style={styles.pickerContainer}
                  activeOpacity={0.7}
                  onPress={() => {
                    // Only India for now
                    Alert.alert('Country', 'Currently, only India is supported.');
                  }}
                >
                  <View style={styles.pickerLabelContainer}>
                    <Text style={styles.pickerLabel}>Country *</Text>
                  </View>
                  <View style={styles.pickerValueContainer}>
                    <Text style={styles.pickerValue}>{country}</Text>
                    <Ionicons name="chevron-down" size={18} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>

                <TextInput
                  label="Address Line 1 *"
                  placeholder="Street address"
                  value={addressLine1}
                  onChangeText={setAddressLine1}
                />
                <TextInput
                  label="Address Line 2"
                  placeholder="Apartment, suite, etc."
                  value={addressLine2}
                  onChangeText={setAddressLine2}
                />
                <TextInput
                  label="City *"
                  placeholder="City"
                  value={city}
                  onChangeText={setCity}
                />
                <TextInput
                  label="State *"
                  placeholder="State"
                  value={state}
                  onChangeText={setState}
                />
                <TextInput
                  label="Pincode *"
                  placeholder="560102"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="Latitude"
                      placeholder="e.g. 12.9716"
                      value={lat}
                      onChangeText={setLat}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <TextInput
                      label="Longitude"
                      placeholder="e.g. 77.5946"
                      value={lng}
                      onChangeText={setLng}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Contact (Optional) */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Contact (Optional)</Text>
              <View style={[styles.formCard, Shadows.sm]}>
                <PhoneInput
                  label="Phone"
                  value={contactPhone}
                  onChangeText={setContactPhone}
                  labelBackgroundColor={Colors.surfaceElevated}
                />
                <TextInput
                  label="Email"
                  placeholder="property@example.com"
                  value={contactEmail}
                  onChangeText={setContactEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <PhoneInput
                  label="Emergency Phone"
                  value={emergencyPhone}
                  onChangeText={setEmergencyPhone}
                  labelBackgroundColor={Colors.surfaceElevated}
                />
                <TextInput
                  label="Caretaker Name"
                  placeholder="Name of the caretaker"
                  value={caretakerName}
                  onChangeText={setCaretakerName}
                />
                <PhoneInput
                  label="Caretaker Phone"
                  value={caretakerPhone}
                  onChangeText={setCaretakerPhone}
                  labelBackgroundColor={Colors.surfaceElevated}
                />
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.submitSection}>
              <Button
                title={isSubmitting ? 'Creating...' : 'Create Property'}
                onPress={handleSubmit}
                disabled={!canSubmit || isSubmitting}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Loading overlay */}
        {isSubmitting && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
      </SafeAreaView>
    </GradientBackground>
  );
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  // Property type grid
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeCard: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: Spacing.xs,
  },
  typeCardSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  typeLabelSelected: {
    color: colors.white,
  },
  // Form
  formCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    gap: Spacing.sm,
  },
  submitSection: {
    paddingVertical: Spacing.md,
  },
  // Picker styles
  pickerContainer: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    borderColor: colors.surfaceBorder,
    backgroundColor: colors.surface,
    paddingHorizontal: Spacing.md,
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  pickerLabelContainer: {
    position: 'absolute',
    top: -10,
    left: Spacing.md,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: 4,
    zIndex: 1,
  },
  pickerLabel: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
  },
  pickerValueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerValue: {
    fontSize: FontSize.md,
    color: colors.textPrimary,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
