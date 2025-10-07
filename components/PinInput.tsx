import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PinInputProps {
  onSubmit: (pin: string) => void;
  showError: boolean;
}

export default function PinInput({ onSubmit, showError }: PinInputProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const [pin, setPin] = useState('');
  const shakeAnimation = useSharedValue(0);
  const gradientAnimation = useSharedValue(0);
  const floatingAnimation1 = useSharedValue(0);
  const floatingAnimation2 = useSharedValue(0);
  const floatingAnimation3 = useSharedValue(0);
  
  // Initial entrance animations
  const logoScale = useSharedValue(0);
  const logoRotate = useSharedValue(-180);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const pinDotsScale = useSharedValue(0);
  const keypadOpacity = useSharedValue(0);
  const keypadTranslateY = useSharedValue(50);

  // Animated gradient background
  useEffect(() => {
    // Initial entrance animations with stagger - FASTER
    logoScale.value = withTiming(1, { 
      duration: 500, 
      easing: Easing.out(Easing.back(2)) 
    });
    
    logoRotate.value = withTiming(0, { 
      duration: 500, 
      easing: Easing.out(Easing.elastic(1.5)) 
    });
    
    setTimeout(() => {
      titleOpacity.value = withTiming(1, { duration: 400 });
      titleTranslateY.value = withTiming(0, { 
        duration: 400, 
        easing: Easing.out(Easing.back(1.5)) 
      });
    }, 200);
    
    setTimeout(() => {
      pinDotsScale.value = withTiming(1, { 
        duration: 400, 
        easing: Easing.out(Easing.back(1.5)) 
      });
    }, 400);
    
    setTimeout(() => {
      keypadOpacity.value = withTiming(1, { duration: 400 });
      keypadTranslateY.value = withTiming(0, { 
        duration: 400, 
        easing: Easing.out(Easing.back(1.3)) 
      });
    }, 550);
    
    // Background animations - FASTER & MORE VISIBLE
    gradientAnimation.value = withRepeat(
      withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    
    floatingAnimation1.value = withRepeat(
      withSequence(
        withTiming(50, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    
    floatingAnimation2.value = withRepeat(
      withSequence(
        withTiming(-45, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    floatingAnimation3.value = withRepeat(
      withSequence(
        withTiming(40, { duration: 3500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 3500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  React.useEffect(() => {
    if (showError) {
      shakeAnimation.value = withTiming(10, { duration: 50 }, () => {
        shakeAnimation.value = withTiming(-10, { duration: 50 }, () => {
          shakeAnimation.value = withTiming(10, { duration: 50 }, () => {
            shakeAnimation.value = withTiming(0, { duration: 50 });
          });
        });
      });
      Vibration.vibrate(100);
      setPin('');
    }
  }, [showError]);

  const handleNumberPress = (number: string) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => onSubmit(newPin), 200);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeAnimation.value }],
    };
  });

  const floatingBubble1Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatingAnimation1.value },
        { translateX: interpolate(floatingAnimation1.value, [0, 50], [0, 25]) },
        { scale: interpolate(floatingAnimation1.value, [0, 25, 50], [1, 1.15, 1]) }
      ],
      opacity: interpolate(floatingAnimation1.value, [0, 25, 50], [0.4, 0.7, 0.4])
    };
  });

  const floatingBubble2Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatingAnimation2.value },
        { translateX: interpolate(floatingAnimation2.value, [-45, 0], [-20, 0]) },
        { scale: interpolate(floatingAnimation2.value, [-45, -22, 0], [1, 1.2, 1]) }
      ],
      opacity: interpolate(floatingAnimation2.value, [-45, -22, 0], [0.35, 0.65, 0.35])
    };
  });

  const floatingBubble3Style = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: floatingAnimation3.value },
        { translateX: interpolate(floatingAnimation3.value, [0, 40], [0, -18]) },
        { scale: interpolate(floatingAnimation3.value, [0, 20, 40], [1, 1.18, 1]) }
      ],
      opacity: interpolate(floatingAnimation3.value, [0, 20, 40], [0.38, 0.68, 0.38])
    };
  });

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: logoScale.value },
        { rotate: `${logoRotate.value}deg` }
      ],
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value,
      transform: [{ translateY: titleTranslateY.value }],
    };
  });

  const pinDotsAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pinDotsScale.value }],
    };
  });

  const keypadAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: keypadOpacity.value,
      transform: [{ translateY: keypadTranslateY.value }],
    };
  });

  const renderKeypad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    
    // Responsive button size
    const isSmallScreen = SCREEN_WIDTH < 375;
    const buttonSize = isSmallScreen ? 65 : SCREEN_WIDTH < 400 ? 72 : 78;
    const buttonMargin = isSmallScreen ? 8 : SCREEN_WIDTH < 400 ? 10 : 12;

    return (
      <View style={styles.keypad}>
        {numbers.map((item, index) => (
          item === '' ? (
            <View key={index} style={[styles.keyButton, { width: buttonSize, height: buttonSize, margin: buttonMargin }]} />
          ) : (
            <TouchableOpacity
              key={index}
              style={[styles.keyButton, { width: buttonSize, height: buttonSize, margin: buttonMargin }]}
              activeOpacity={0.7}
              onPress={() => {
                if (item === '⌫') {
                  handleBackspace();
                } else {
                  handleNumberPress(item);
                }
              }}
            >
              <View style={[styles.keyButtonOuter, { borderRadius: buttonSize / 2 }]}>
                <LinearGradient
                  colors={[
                    'rgba(255, 255, 255, 0.25)',
                    'rgba(255, 255, 255, 0.15)',
                    'rgba(255, 255, 255, 0.08)'
                  ]}
                  style={[styles.keyButtonGradient, { borderRadius: buttonSize / 2 - 3 }]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={[styles.keyButtonInner, { borderRadius: buttonSize / 2 - 3 }]}>
                    <View style={[styles.glassShine, { borderTopLeftRadius: buttonSize / 2 - 3, borderTopRightRadius: buttonSize / 2 - 3 }]} />
                    <View style={styles.liquidEffect} />
                    <Text style={[styles.keyText, { color: theme.colors.surface, fontSize: buttonSize * 0.37 }]}>
                      {item}
                    </Text>
                  </View>
                </LinearGradient>
              </View>
            </TouchableOpacity>
          )
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[
          '#667eea',
          '#764ba2',
          '#f093fb',
          '#4facfe'
        ]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Animated floating bubbles */}
      <Animated.View style={[styles.floatingBubble, styles.bubble1, floatingBubble1Style]} />
      <Animated.View style={[styles.floatingBubble, styles.bubble2, floatingBubble2Style]} />
      <Animated.View style={[styles.floatingBubble, styles.bubble3, floatingBubble3Style]} />
      
      <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoOuter}>
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.4)',
                'rgba(255, 255, 255, 0.2)',
                'rgba(255, 255, 255, 0.1)'
              ]}
              style={styles.logo}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.logoGlassEffect} />
              <Text style={[styles.logoText, { color: theme.colors.surface }]}>P</Text>
            </LinearGradient>
          </View>
        </Animated.View>
        
        <Animated.View style={titleAnimatedStyle}>
          <Text style={[styles.bankName, { color: theme.colors.surface }]}>
            PREMIUM
          </Text>
          <Text style={[styles.bankSubtitle, { color: 'rgba(255, 255, 255, 0.8)' }]}>
            {translations.bankName}
          </Text>
        </Animated.View>
        
        <Animated.View style={[animatedStyle, { alignItems: 'center' }]}>
          <Text style={[styles.title, { color: theme.colors.surface }]}>
            {translations.enterPin}
          </Text>
          
          {showError && (
            <Text style={[styles.errorText, { color: '#FF6B6B' }]}>
              {translations.wrongPin}
            </Text>
          )}
          
          <Animated.View style={[styles.pinContainer, pinDotsAnimatedStyle]}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={styles.pinDotOuter}
              >
                <LinearGradient
                  colors={
                    pin.length > index
                      ? ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)']
                      : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']
                  }
                  style={styles.pinDot}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.pinDotShine} />
                </LinearGradient>
              </View>
            ))}
          </Animated.View>
        </Animated.View>
        
        <Animated.View style={keypadAnimatedStyle}>
          {renderKeypad()}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  floatingBubble: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: 'rgba(255, 255, 255, 0.5)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
  },
  bubble1: {
    width: 320,
    height: 320,
    top: '10%',
    right: '-20%',
  },
  bubble2: {
    width: 280,
    height: 280,
    bottom: '15%',
    left: '-15%',
  },
  bubble3: {
    width: 240,
    height: 240,
    top: '40%',
    left: '10%',
  },
  logoContainer: {
    marginBottom: 15,
  },
  logoOuter: {
    padding: 3,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  logoGlassEffect: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 45,
    transform: [{ rotate: '-15deg' }],
  },
  logoText: {
    fontSize: 42,
    fontWeight: 'bold',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  bankName: {
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 4,
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  bankSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 50,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  pinContainer: {
    flexDirection: 'row',
    marginBottom: 60,
  },
  pinDotOuter: {
    marginHorizontal: 12,
    padding: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  pinDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  pinDotShine: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 9,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    maxWidth: 320,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButtonOuter: {
    flex: 1,
    width: '100%',
    height: '100%',
    padding: 3,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  keyButtonGradient: {
    flex: 1,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  keyButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  glassShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  liquidEffect: {
    position: 'absolute',
    top: '20%',
    left: '15%',
    width: '40%',
    height: '40%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 100,
    transform: [{ rotate: '45deg' }],
  },
  keyText: {
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
});