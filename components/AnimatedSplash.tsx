import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const bankNameScale = useSharedValue(0);
  const bankNameOpacity = useSharedValue(0);

  useEffect(() => {
    // Sequence of animations
    logoScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    logoOpacity.value = withTiming(1, { duration: 800 });
    
    setTimeout(() => {
      titleTranslateY.value = withSpring(0, { damping: 12 });
      titleOpacity.value = withTiming(1, { duration: 600 });
    }, 400);
    
    setTimeout(() => {
      bankNameScale.value = withSequence(
        withSpring(1.1, { duration: 300 }),
        withSpring(1, { duration: 200 })
      );
      bankNameOpacity.value = withTiming(1, { duration: 800 });
    }, 800);
    
    // Complete animation after 2.5 seconds
    setTimeout(() => {
      runOnJS(onAnimationComplete)();
    }, 2500);
  }, []);

  const logoStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }],
      opacity: logoOpacity.value,
    };
  });

  const titleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: titleTranslateY.value }],
      opacity: titleOpacity.value,
    };
  });

  const bankNameStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bankNameScale.value }],
      opacity: bankNameOpacity.value,
    };
  });

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoStyle]}>
          <View style={[styles.logo, { borderColor: theme.colors.surface }]}>
            <Text style={[styles.logoText, { color: theme.colors.surface }]}>P</Text>
          </View>
        </Animated.View>
        
        <Animated.Text style={[styles.welcomeText, { color: theme.colors.surface }, titleStyle]}>
          {translations.welcome}
        </Animated.Text>
        
        <Animated.Text style={[styles.bankName, { color: theme.colors.surface }, bankNameStyle]}>
          {translations.bankName}
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
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
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '300',
    marginBottom: 8,
    letterSpacing: 1,
  },
  bankName: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});