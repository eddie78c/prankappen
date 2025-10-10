import React from 'react';
import { View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

export function TopSafeArea({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const topBg = theme.colors.surface;

  return (
    <View style={{ flex: 1 }}>
      {/* Overlay to color the status bar/top inset area on iOS */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: topBg,
          zIndex: 0,
        }}
      />

      {/* Safe content area below the status bar */}
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'transparent' }}>
        {children}
      </SafeAreaView>
    </View>
  );
}