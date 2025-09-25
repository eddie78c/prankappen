import React from 'react';
import { View, ViewStyle } from 'react-native';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[
      {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 16,
        padding: 20,
        // backdropFilter: 'blur(10px)', // Not supported in React Native
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      style
    ]}>
      {children}
    </View>
  );
}