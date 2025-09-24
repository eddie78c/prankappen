import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  // Map common transaction icons to Ionicons
  const iconMap: { [key: string]: string } = {
    'arrow-down-left': 'arrow-down',
    'arrow-up-right': 'arrow-up',
    'shopping-cart': 'basket',
    'car': 'car',
    'coffee': 'cafe',
    'home': 'home',
    'phone': 'call',
    'credit-card': 'card',
    'dollar-sign': 'cash',
    'gift': 'gift',
    'music': 'musical-notes',
    'plane': 'airplane',
    'restaurant': 'restaurant',
    'gas-pump': 'car-sport',
    'medical': 'medical',
    'education': 'school',
    'entertainment': 'game-controller',
    'transfer': 'swap-horizontal',
  };

  const ioniconsName = iconMap[icon] || 'ellipse';

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
      <Ionicons name={ioniconsName as any} size={size} color={color} />
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