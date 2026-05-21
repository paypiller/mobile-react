/**
 * Animated gradient background component
 * Creates a premium dark gradient with subtle animated overlay
 */
import React, { useMemo,  useEffect, useRef } from 'react';
import { Colors } from '../../constants/theme';
import { useThemeStyles } from '../../hooks/useTheme';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

interface GradientBackgroundProps {
  children: React.ReactNode;
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  const orbAnim1 = useRef(new Animated.Value(0)).current;
  const orbAnim2 = useRef(new Animated.Value(0)).current;
  const styles = useThemeStyles(createStyles);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim1, {
          toValue: 1,
          duration: 8000,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim1, {
          toValue: 0,
          duration: 8000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim2, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }),
        Animated.timing(orbAnim2, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [orbAnim1, orbAnim2]);

  const orb1Translate = orbAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 30],
  });

  const orb2Translate = orbAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  return (
    <View style={styles.container}>
      {/* Ambient orb 1 - top right */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          { transform: [{ translateY: orb1Translate }] },
        ]}
      />
      {/* Ambient orb 2 - bottom left */}
      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          { transform: [{ translateY: orb2Translate }] },
        ]}
      />
      {children}
    </View>
  );
}

const createStyles = (colors: typeof Colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.2,
    right: -width * 0.3,
    backgroundColor: colors.primary,
    opacity: 0.06,
  },
  orb2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: height * 0.1,
    left: -width * 0.2,
    backgroundColor: colors.accent,
    opacity: 0.04,
  },
});
