/**
 * App group layout — protected screens after authentication
 */
import React from 'react';
import { Colors } from '../../src/constants/theme';
import { useTheme } from '../../src/hooks/useTheme';
import { Stack } from 'expo-router';

export default function AppLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen
        name="profile"
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="create-property"
        options={{ animation: 'slide_from_bottom' }}
      />
    </Stack>
  );
}
