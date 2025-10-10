import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShoppingCart, Car, DollarSign, Coffee, Plane, Utensils, Fuel, Stethoscope, GraduationCap, Gamepad2, ArrowLeftRight, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

interface TransactionIconProps {
  icon: string;
  color: string;
  size?: number;
  theme?: any;
}

export default function TransactionIcon({ icon, color, size = 24, theme }: TransactionIconProps) {
  // Check if icon is an emoji (simple check for common emoji patterns)
  const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(icon);
  
  if (isEmoji) {
    return (
      <View style={[
        styles.container,
        {
          width: size + 16,
          height: size + 16,
        }
      ]}>
        <Text style={[styles.emoji, { fontSize: size, color: theme?.colors?.text || "#333" }]}>
          {icon}
        </Text>
      </View>
    );
  }

  // Map common transaction icons to Lucide components
  const iconMap: { [key: string]: React.ComponentType<{ size: number; color: string }> } = {
    'basket': ShoppingCart,
    'car': Car,
    'cash': DollarSign,
    'cafe': Coffee,
    'home': () => null, // Not used
    'phone': () => null,
    'card': () => null,
    'gift': () => null,
    'musical-notes': () => null,
    'airplane': Plane,
    'restaurant': Utensils,
    'car-sport': Fuel,
    'medical': Stethoscope,
    'school': GraduationCap,
    'game-controller': Gamepad2,
    'swap-horizontal': ArrowLeftRight,
    // Added explicit mappings for send/receive transactions
    'arrow-up-right': ArrowUpRight,
    'arrow-down-left': ArrowDownLeft,
  };

  const IconComponent = iconMap[icon] || ShoppingCart;

  return (
    <View style={[
      styles.container,
      {
        width: size + 16,
        height: size + 16,
      }
    ]}>
      <IconComponent size={size} color={color || (theme?.colors?.text || "#333")} />
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