import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, ScrollView, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Check, ArrowRight } from 'lucide-react-native';

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

export default function AnimatedSplash({ onAnimationComplete }: AnimatedSplashProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  
  const [isAccepted, setIsAccepted] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [acceptChecked, setAcceptChecked] = useState(false);
  
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const titleOpacity = useSharedValue(0);
  const bankNameScale = useSharedValue(0);
  const bankNameOpacity = useSharedValue(0);

  // Load acceptance flag
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('terms_accepted_v1');
        if (stored === 'true') {
          setIsAccepted(true);
        }
      } catch {}
    })();
  }, []);

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
  }, []);

  // After animations complete, either proceed or show terms for first launch
  useEffect(() => {
    const t = setTimeout(() => {
      if (isAccepted) {
        runOnJS(onAnimationComplete)();
      } else {
        setShowTerms(true);
      }
    }, 2500);
    return () => clearTimeout(t);
  }, [isAccepted]);

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

  const onAccept = async () => {
    try {
      await AsyncStorage.setItem('terms_accepted_v1', 'true');
      setIsAccepted(true);
      setShowTerms(false);
      runOnJS(onAnimationComplete)();
    } catch {}
  };

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
            {/* Logo image */}
            <Image
              source={require('../assets/images/android-chrome-512x512.png')}
              style={styles.logoImage}
            />
          </View>
        </Animated.View>
        
        {/* Show welcome text only on first launch */}
        {!isAccepted && (
          <Animated.Text style={[styles.welcomeText, { color: theme.colors.surface }, titleStyle]}>
            {translations.welcome}
          </Animated.Text>
        )}
        
        {/* Bank name with BANK struck-through and PRANK appended on a second line */}
        <Animated.View style={[styles.bankColumn, bankNameStyle]}>
          <Text style={[styles.bankPremium, { color: theme.colors.surface }]}>PREMIUM</Text>
          <View style={styles.bankSecondRow}>
            <Text style={[styles.bankSegmentStrike, { color: theme.colors.surface }]}>BANK</Text>
            <Text style={[styles.bankSegmentPrank, { color: theme.colors.primary }]}> PRANK</Text>
          </View>
        </Animated.View>
      </View>

      {/* Terms acceptance modal shown on first launch */}
      {showTerms && (
        <Modal transparent animationType="fade" visible={showTerms}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>              
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>                
                {translations.termsAndConditions || 'Terms & Conditions'}
              </Text>
              <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                  
                  {translations.aboutDescription}
                </Text>
                {translations.aboutFeatures && (
                  <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                    
                    {translations.aboutFeatures}
                  </Text>
                )}
                {translations.aboutHowItWorks && (
                  <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                    
                    {translations.aboutHowItWorks}
                  </Text>
                )}
                <Text style={[styles.modalDisclaimer, { color: theme.colors.text }]}>                  
                  {translations.legalDisclaimer}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                  
                  {translations.legalText1}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                  
                  {translations.legalText2}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                  
                  {translations.legalText3}
                </Text>
                <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>                  
                  {translations.legalText4}
                </Text>
              </ScrollView>
              
              <TouchableOpacity
                style={[styles.checkboxRow]}
                onPress={() => setAcceptChecked((prev) => !prev)}
              >
                <View style={[styles.checkboxBox, { borderColor: theme.colors.border, backgroundColor: acceptChecked ? theme.colors.primary : 'transparent' }]}>
                  {acceptChecked && (
                    <Check size={16} color={theme.colors.surface} />
                  )}
                </View>
                <Text style={[styles.checkboxLabel, { color: theme.colors.text }]}>                  
                  {translations.acceptTerms || 'I accept the terms and conditions'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: acceptChecked ? theme.colors.primary : theme.colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}
                disabled={!acceptChecked}
                onPress={onAccept}
              >
                <Text style={[styles.modalButtonText, { color: theme.colors.surface }]}>                  
                  {translations.continue || 'Continue'}
                </Text>
                <ArrowRight size={18} color={theme.colors.surface} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
    marginTop: -48,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    resizeMode: 'cover',
    transform: [{ scale: 1.2 }],
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 1,
  },
  // New segmented bank name styles
  bankColumn: {
    alignItems: 'center',
  },
  bankPremium: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bankSecondRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankSegment: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  bankSegmentStrike: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
    textDecorationLine: 'line-through',
  },
  bankSegmentPrank: {
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  modalContent: {
    width: '95%',
    // maxWidth removed to honor 95% width
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalScroll: {
    maxHeight: 280,
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  modalDisclaimer: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    textAlign: 'center',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    flex: 1,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});