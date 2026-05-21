/**
 * Home screen — property-centric dashboard
 *
 * Top bar: [🏢 Property Name ▼]  ─────  [👤 Profile Icon]
 * Tapping the property name opens a bottom sheet to switch properties.
 * Tapping the profile icon navigates to the account/profile screen.
 * Dashboard features are driven by the active property.
 */
import React, { useMemo,  useEffect, useState } from 'react';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadows, Colors } from '../../src/constants/theme';
import { useThemeStyles } from '../../src/hooks/useTheme';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { Button } from '../../src/components/ui/Button';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { useAuthStore } from '../../src/stores/auth.store';
import { usePropertyStore } from '../../src/stores/property.store';
import { Ionicons } from '@expo/vector-icons';
import type { Property } from '../../src/types';

export default function HomeScreen() {
  const { user, activeVendorId, forceLogout, fetchVendors, switchVendor } = useAuthStore();
  const styles = useThemeStyles(createStyles);
  const {
    properties,
    activePropertyId,
    isLoadingProperties,
    isFetchingMoreProperties,
    propertyHasMore,
    fetchProperties,
    selectProperty,
  } = usePropertyStore();
  const [showPropertyPicker, setShowPropertyPicker] = useState(false);
  const router = useRouter();

  const activeProperty = properties.find((p) => p.id === activePropertyId);

  // Fetch properties on mount and when vendor changes
  useEffect(() => {
    const ensureContext = async () => {
      if (activeVendorId) {
        await fetchProperties().catch(() => {});
      } else {
        // No vendor selected? Try fetching them first (e.g. after fresh login)
        try {
          const vendors = await fetchVendors();
          if (vendors.length > 0) {
            // Switch to first vendor automatically
            await switchVendor(vendors[0].vendor.id);
          } else {
            // Truly no vendors? Logout.
            forceLogout();
          }
        } catch {
          forceLogout();
        }
      }
    };

    ensureContext();
  }, [activeVendorId, fetchVendors, switchVendor, fetchProperties, forceLogout]);

  const handlePropertySelect = (propertyId: number) => {
    selectProperty(propertyId);
    setShowPropertyPicker(false);
  };

  const renderPropertyItem = ({ item }: { item: Property }) => {
    const isActive = item.id === activePropertyId;
    return (
      <TouchableOpacity
        style={[styles.propertyCard, isActive && styles.propertyCardActive]}
        onPress={() => handlePropertySelect(item.id)}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.propertyIcon,
            isActive && styles.propertyIconActive,
          ]}
        >
          <Ionicons
            name="business-outline"
            size={22}
            color={isActive ? Colors.white : Colors.primary}
          />
        </View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyName}>{item.name}</Text>
          <Text style={styles.propertyType}>{formatPropertyType(item.propertyType)}</Text>
        </View>
        {isActive && (
          <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          {/* Left: Property selector */}
          <TouchableOpacity
            style={styles.propertySelector}
            onPress={() => setShowPropertyPicker(true)}
            activeOpacity={0.7}
          >
            <View style={styles.propertySelectorIcon}>
              <Ionicons name="business" size={20} color={Colors.white} />
            </View>
            <Text style={styles.propertySelectorName} numberOfLines={1}>
              {activeProperty?.name || 'Select Property'}
            </Text>
            <Ionicons
              name="chevron-down"
              size={18}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Right: Profile avatar */}
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
          >
            <Ionicons name="person-circle-outline" size={34} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {/* ── Dashboard Content ── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Greeting */}
          <View style={styles.greetingSection}>
            <Text style={styles.greetingText}>
              Hello, {user?.profile?.firstName}!
            </Text>
            {activeProperty && (
              <Text style={styles.greetingSubtext}>
                Managing {activeProperty.name}
              </Text>
            )}
          </View>

          {/* Quick Stats */}
          {activeProperty && (
            <View style={[styles.statsCard, Shadows.lg]}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Units</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Tenants</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>—</Text>
                  <Text style={styles.statLabel}>Revenue</Text>
                </View>
              </View>
            </View>
          )}

          {/* Property Info Card */}
          {activeProperty && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Property Details</Text>
              <View style={[styles.infoCard, Shadows.sm]}>
                <View style={styles.infoRow}>
                  <Ionicons name="home-outline" size={18} color={Colors.textMuted} />
                  <Text style={styles.infoLabel}>Type</Text>
                  <Text style={styles.infoValue}>
                    {formatPropertyType(activeProperty.propertyType)}
                  </Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Ionicons name="shield-checkmark-outline" size={18} color={Colors.textMuted} />
                  <Text style={styles.infoLabel}>Verified</Text>
                  <Text
                    style={[
                      styles.infoValue,
                      { color: activeProperty.isVerified ? Colors.success : Colors.warning },
                    ]}
                  >
                    {activeProperty.isVerified ? 'Yes' : 'Pending'}
                  </Text>
                </View>
                {activeProperty.description && (
                  <>
                    <View style={styles.infoDivider} />
                    <View style={styles.infoRow}>
                      <Ionicons name="document-text-outline" size={18} color={Colors.textMuted} />
                      <Text style={styles.infoLabel}>Description</Text>
                    </View>
                    <Text style={styles.descriptionText}>
                      {activeProperty.description}
                    </Text>
                  </>
                )}
              </View>
            </View>
          )}

          {/* Empty state when no property */}
          {!activeProperty && !isLoadingProperties && (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No Property Selected</Text>
              <Text style={styles.emptySubtext}>
                Tap the property selector above to pick or create a property
              </Text>
              <Button
                title="Create First Property"
                onPress={() => router.push('/create-property')}
                style={{ marginTop: Spacing.lg, width: '100%' }}
              />
            </View>
          )}

          {isLoadingProperties && !activeProperty && (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.emptySubtext}>Loading properties...</Text>
            </View>
          )}
        </ScrollView>

        {/* ── Property Picker Bottom Sheet ── */}
        <BottomSheet
          isVisible={showPropertyPicker}
          onClose={() => setShowPropertyPicker(false)}
          title="Select Property"
        >
          {isLoadingProperties ? (
            <View style={styles.sheetEmptyState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.sheetEmptyText}>Loading...</Text>
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.sheetEmptyState}>
              <Ionicons name="home-outline" size={48} color={Colors.textMuted} />
              <Text style={styles.sheetEmptyText}>No properties yet</Text>
              <Text style={styles.sheetEmptySubtext}>
                Create your first property to get started
              </Text>
            </View>
          ) : (
            <FlatList
              data={properties}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderPropertyItem}
              contentContainerStyle={styles.sheetList}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (!isFetchingMoreProperties && propertyHasMore) {
                  fetchProperties();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                <>
                  {isFetchingMoreProperties && (
                    <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.sm }} />
                  )}
                  <TouchableOpacity
                    style={styles.createPropertyButton}
                    onPress={() => {
                      setShowPropertyPicker(false);
                      router.push('/create-property');
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
                    <Text style={styles.createPropertyText}>Add New Property</Text>
                  </TouchableOpacity>
                </>
              }
            />
          )}

          {/* Show create button even when empty */}
          {!isLoadingProperties && properties.length === 0 && (
            <TouchableOpacity
              style={styles.createPropertyButton}
              onPress={() => {
                setShowPropertyPicker(false);
                router.push('/create-property');
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              <Text style={styles.createPropertyText}>Add New Property</Text>
            </TouchableOpacity>
          )}
        </BottomSheet>
      </SafeAreaView>
    </GradientBackground>
  );
}

/** Format property type enum to human-readable label */
function formatPropertyType(type: string): string {
  const labels: Record<string, string> = {
    pg: 'PG',
    apartment: 'Apartment',
    co_living: 'Co-Living',
    hostel: 'Hostel',
    villa: 'Villa',
    independent_house: 'Independent House',
  };
  return labels[type] || type;
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  // ── Top Bar ──
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  propertySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    maxWidth: '75%',
    gap: Spacing.xs,
  },
  propertySelectorIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  propertySelectorName: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  profileButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // ── Scroll Content ──
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  greetingSection: {
    marginVertical: Spacing.md,
  },
  greetingText: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  greetingSubtext: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
    marginTop: 4,
  },
  // ── Stats ──
  statsCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: colors.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.surfaceBorder,
  },
  // ── Property Info ──
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
  infoCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginVertical: Spacing.xs,
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingLeft: Spacing.xl,
    paddingTop: Spacing.xxs,
  },
  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  emptySubtext: {
    fontSize: FontSize.md,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: '80%',
  },
  // ── Bottom Sheet ──
  sheetList: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sheetEmptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.md,
  },
  sheetEmptyText: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
  },
  sheetEmptySubtext: {
    fontSize: FontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  propertyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  propertyCardActive: {
    borderColor: colors.primary + '60',
    backgroundColor: colors.surfaceElevated,
  },
  propertyIcon: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  propertyIconActive: {
    backgroundColor: colors.primary,
  },
  propertyInfo: {
    flex: 1,
  },
  propertyName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  propertyType: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  createPropertyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderStyle: 'dashed',
    backgroundColor: colors.primary + '08',
  },
  createPropertyText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.primary,
  },
});
