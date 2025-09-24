import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PrankRevealScreenProps {
  onClose: () => void;
}

export default function PrankRevealScreen({ onClose }: PrankRevealScreenProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <TouchableOpacity 
          style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
          onPress={onClose}
        >
          <X size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { borderColor: theme.colors.surface }]}>
            <Text style={[styles.logoText, { color: theme.colors.surface }]}>🎭</Text>
          </View>
        </View>
        
        <Text style={[styles.title, { color: theme.colors.surface }]}>
          Prank Revealed!
        </Text>
        
        <Text style={[styles.subtitle, { color: theme.colors.surface }]}>
          This is a fake banking app for pranks only.
        </Text>
        
        <Text style={[styles.description, { color: theme.colors.surface }]}>
          No real money was transferred. This app is designed for entertainment purposes.
        </Text>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: theme.colors.surface }]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, { color: theme.colors.primary }]}>
            Continue Prank
          </Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoText: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    opacity: 0.9,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});