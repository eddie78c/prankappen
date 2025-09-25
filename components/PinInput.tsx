import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Vibration } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

interface PinInputProps {
  onSubmit: (pin: string) => void;
  showError: boolean;
}

export default function PinInput({ onSubmit, showError }: PinInputProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const [pin, setPin] = useState('');
  const shakeAnimation = useSharedValue(0);

  React.useEffect(() => {
    if (showError) {
      // Simple shake animation using withTiming
      shakeAnimation.value = withTiming(10, { duration: 50 }, () => {
        shakeAnimation.value = withTiming(-10, { duration: 50 }, () => {
          shakeAnimation.value = withTiming(0, { duration: 50 });
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

  const renderKeypad = () => {
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];
    
    return (
      <View style={styles.keypad}>
        {numbers.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.keyButton,
              { backgroundColor: theme.colors.surface },
              item === '' && { backgroundColor: 'transparent' },
            ]}
            onPress={() => {
              if (item === '⌫') {
                handleBackspace();
              } else if (item !== '') {
                handleNumberPress(item);
              }
            }}
            disabled={item === ''}
          >
            <Text style={[styles.keyText, { color: theme.colors.text }]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <LinearGradient
      colors={theme.colors.gradient}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { borderColor: theme.colors.surface }]}>
            <Text style={[styles.logoText, { color: theme.colors.surface }]}>P</Text>
          </View>
        </View>
        
        <Text style={[styles.bankName, { color: theme.colors.surface }]}>
          {translations.bankName}
        </Text>
        
        <Animated.View style={animatedStyle}>
          <Text style={[styles.title, { color: theme.colors.surface }]}>
            {translations.enterPin}
          </Text>
          
          {showError && (
            <Text style={[styles.errorText, { color: '#FF6B6B' }]}>
              {translations.wrongPin}
            </Text>
          )}
          
          <View style={styles.pinContainer}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  {
                    backgroundColor: pin.length > index 
                      ? theme.colors.surface 
                      : 'rgba(255, 255, 255, 0.3)',
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
        
        {renderKeypad()}
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
  logoContainer: {
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  bankName: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  pinContainer: {
    flexDirection: 'row',
    marginBottom: 50,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 240,
    justifyContent: 'center',
  },
  keyButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
  },
});