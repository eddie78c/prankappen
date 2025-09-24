import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import * as LucideIcons from 'lucide-react-native';

interface TransactionIconProps {
  icon: string;
  color: string;
  size?: number;
}

export default function TransactionIcon({ icon, color, size = 24 }: TransactionIconProps) {
  // Check if icon is an emoji (simple check for common emoji patterns)
  const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon);
  
  if (isEmoji) {
    return (
      <View style={[
        styles.container,
        {
          backgroundColor: color + '20',
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
        }
      ]}>
        <Text style={[styles.emoji, { fontSize: size }]}>
          {icon}
        </Text>
      </View>
    );
  }

  // Handle Lucide icons
  const iconName = icon.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  const capitalizedIconName = iconName.charAt(0).toUpperCase() + iconName.slice(1);
  
  // Get the icon component from Lucide
  const IconComponent = (LucideIcons as any)[capitalizedIconName];
  
  if (!IconComponent) {
    // Fallback to a default icon if not found
    const DefaultIcon = LucideIcons.Circle;
    return (
      <View style={[
        styles.container,
        {
          backgroundColor: color + '20',
          width: size + 16,
          height: size + 16,
          borderRadius: (size + 16) / 2,
        }
      ]}>
        <DefaultIcon size={size} color={color} />
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: color + '20',
        width: size + 16,
        height: size + 16,
        borderRadius: (size + 16) / 2,
      }
    ]}>
      <IconComponent size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
});