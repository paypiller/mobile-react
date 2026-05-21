/**
 * Profile / Account screen
 * Shows user info, active vendor with switcher, and logout
 * Vendor switching lives here (Instagram-style)
 */
import React, { useMemo,  useEffect, useState } from 'react';
import { FontSize, FontWeight, Spacing, BorderRadius, Shadows, Colors } from '../../src/constants/theme';
import { useThemeStyles } from '../../src/hooks/useTheme';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Modal,
  ScrollView,
  Appearance,
  useColorScheme,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GradientBackground } from '../../src/components/ui/GradientBackground';
import { BottomSheet } from '../../src/components/ui/BottomSheet';
import { useAuthStore } from '../../src/stores/auth.store';
import { usePropertyStore } from '../../src/stores/property.store';
import { Ionicons } from '@expo/vector-icons';
import type { Vendor } from '../../src/types';

export default function ProfileScreen() {
  const {
    user,
    vendors,
    activeVendorId,
    isLoading,
    fetchVendors,
    switchVendor,
    logout,
    vendorHasMore,
    isFetchingMoreVendors,
  } = useAuthStore();
  const { clearProperties } = usePropertyStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(false);
  const router = useRouter();
  const systemColorScheme = useColorScheme() ?? 'dark';
  const styles = useThemeStyles(createStyles);

  const handleThemeToggle = (isDark: boolean) => {
    const nextTheme = isDark ? 'dark' : 'light';
    Appearance.setColorScheme(nextTheme);
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    setLoadingVendors(true);
    try {
      await fetchVendors();
    } catch {
      // Silently fail
    } finally {
      setLoadingVendors(false);
    }
  };

  const activeVendor = vendors.find((v) => v.vendor.id === activeVendorId);

  const handleVendorSelect = async (vendorId: number) => {
    if (vendorId === activeVendorId) {
      setShowSwitcher(false);
      return;
    }

    try {
      // Clear properties from old vendor context
      clearProperties();
      await switchVendor(vendorId);
      setShowSwitcher(false);
    } catch {
      Alert.alert('Switch Failed', 'Could not switch vendor. Please try again.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          clearProperties();
          await logout();
        },
      },
    ]);
  };

  const renderVendorCard = ({ item }: { item: Vendor }) => {
    const isActive = item.vendor.id === activeVendorId;
    return (
      <TouchableOpacity
        style={[styles.vendorCard, isActive && styles.vendorCardActive]}
        onPress={() => handleVendorSelect(item.vendor.id)}
        activeOpacity={0.7}
      >
        <View style={[styles.vendorIcon, isActive && styles.vendorIconActive]}>
          <Ionicons
            name="storefront"
            size={24}
            color={isActive ? Colors.white : Colors.primary}
          />
        </View>
        <View style={styles.vendorInfo}>
          <Text style={styles.vendorName}>{item.vendor.name}</Text>
          <Text style={styles.vendorStatus}>{item.vendor.status}</Text>
        </View>
        {isActive && (
          <View style={styles.activeBadge}>
            <Ionicons name="checkmark-circle" size={22} color={Colors.success} />
          </View>
        )}
      </TouchableOpacity>
    );
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
          <Text style={styles.headerTitle}>Account</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* User Profile Card */}
          <View style={[styles.profileCard, Shadows.md]}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={36} color={Colors.primary} />
              </View>
            </View>
            <Text style={styles.profileName}>
              {user?.profile?.firstName} {user?.profile?.lastName}
            </Text>
            <Text style={styles.profilePhone}>{user?.phone}</Text>
            {user?.email && (
              <Text style={styles.profileEmail}>{user.email}</Text>
            )}
          </View>

          {/* Active Vendor Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Active Account</Text>
            <TouchableOpacity
              style={[styles.activeVendorCard, Shadows.sm]}
              onPress={() => setShowSwitcher(true)}
              activeOpacity={0.7}
            >
              <View style={styles.activeVendorRow}>
                <View style={styles.activeVendorLogo}>
                  <Ionicons name="business" size={24} color={Colors.white} />
                </View>
                <View style={styles.activeVendorInfo}>
                  <Text style={styles.activeVendorName}>
                    {activeVendor?.vendor.name || 'No vendor selected'}
                  </Text>
                  {activeVendor && (
                    <Text style={styles.activeVendorStatusText}>
                      {activeVendor.vendor.status}
                    </Text>
                  )}
                </View>
                <View style={styles.switchHint}>
                  <Ionicons name="swap-horizontal" size={20} color={Colors.primary} />
                  <Text style={styles.switchText}>Switch</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Menu Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={[styles.menuCard, Shadows.sm]}>
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Ionicons name="notifications-outline" size={22} color={Colors.textSecondary} />
                <Text style={styles.menuItemText}>Notifications</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <View style={styles.menuItem}>
                <Ionicons 
                  name={systemColorScheme === 'dark' ? 'moon' : 'sunny'} 
                  size={22} 
                  color={Colors.textSecondary} 
                />
                <Text style={styles.menuItemText}>Dark Mode</Text>
                <Switch
                  value={systemColorScheme === 'dark'}
                  onValueChange={handleThemeToggle}
                  trackColor={{ false: Colors.surfaceBorder, true: Colors.primary }}
                  thumbColor={Colors.white}
                />
              </View>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Ionicons name="help-circle-outline" size={22} color={Colors.textSecondary} />
                <Text style={styles.menuItemText}>Help & Support</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
              <View style={styles.menuDivider} />
              <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
                <Ionicons name="information-circle-outline" size={22} color={Colors.textSecondary} />
                <Text style={styles.menuItemText}>About</Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Vendor Switcher Bottom Sheet */}
        <BottomSheet
          isVisible={showSwitcher}
          onClose={() => setShowSwitcher(false)}
          title="Switch Account"
        >
          {loadingVendors ? (
            <View style={styles.sheetEmptyState}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : (
            <FlatList
              data={vendors}
              keyExtractor={(item) => String(item.vendor.id)}
              renderItem={renderVendorCard}
              contentContainerStyle={styles.sheetList}
              showsVerticalScrollIndicator={false}
              onEndReached={() => {
                if (!isFetchingMoreVendors && vendorHasMore) {
                  fetchVendors();
                }
              }}
              onEndReachedThreshold={0.5}
              ListFooterComponent={
                isFetchingMoreVendors ? (
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: Spacing.sm }} />
                ) : null
              }
            />
          )}
        </BottomSheet>

        {/* Switching Overlay */}
        <Modal transparent visible={isLoading} animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={[styles.loadingContainer, Shadows.lg]}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>Switching Account...</Text>
            </View>
          </View>
        </Modal>
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
    paddingBottom: Spacing.xxl,
  },
  profileCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  avatarContainer: {
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '40',
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
  },
  profileEmail: {
    fontSize: FontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
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
  activeVendorCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '40',
  },
  activeVendorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeVendorLogo: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  activeVendorInfo: {
    flex: 1,
  },
  activeVendorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: colors.textPrimary,
  },
  activeVendorStatusText: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  switchHint: {
    alignItems: 'center',
    padding: Spacing.xs,
  },
  switchText: {
    fontSize: FontSize.xs,
    color: colors.primary,
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: FontSize.md,
    color: colors.textPrimary,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.surfaceBorder,
    marginHorizontal: Spacing.md,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: colors.error + '15',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.error + '30',
    marginTop: Spacing.sm,
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.error,
  },
  // Bottom sheet styles
  sheetList: {
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  sheetEmptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSize.md,
    color: colors.textSecondary,
  },
  vendorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  vendorCardActive: {
    borderColor: colors.primary + '60',
    backgroundColor: colors.surfaceElevated,
  },
  vendorIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  vendorIconActive: {
    backgroundColor: colors.primary,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: colors.textPrimary,
  },
  vendorStatus: {
    fontSize: FontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  activeBadge: {
    marginLeft: Spacing.sm,
  },
  // Loading overlay
  loadingOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    backgroundColor: colors.surfaceElevated,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    color: colors.textPrimary,
    fontWeight: FontWeight.semibold,
  },
});
