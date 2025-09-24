import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleCheck as CheckCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { formatCurrency } from '../utils/currency';

interface TransactionAnimationProps {
  amount: number;
  currency: string;
  receiver: string;
  onClose: () => void;
}

export default function TransactionAnimation({ 
  amount, 
  currency, 
  receiver, 
  onClose 
}: TransactionAnimationProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);

  useEffect(() => {
    // Start animation sequence
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSequence(
      withSpring(1.2, { damping: 15 }),
      withSpring(1, { damping: 12 })
    );
    
    setTimeout(() => {
      checkScale.value = withSpring(1, { damping: 15 });
    }, 500);
    
    // Auto close after 2.5 seconds
    setTimeout(() => {
      opacity.value = withTiming(0, { duration: 300 });
      setTimeout(() => {
        runOnJS(onClose)();
      }, 300);
    }, 2500);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkScale.value }],
    };
  });

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[animatedStyle]}>
          <LinearGradient
            colors={theme.colors.gradient}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.checkContainer, checkAnimatedStyle]}>
              <CheckCircle size={60} color={theme.colors.surface} />
            </Animated.View>
            
            <Text style={[styles.title, { color: theme.colors.surface }]}>
              {amount > 0 ? 'Money Received!' : 'Money Sent!'}
            </Text>
            
            <Text style={[styles.amount, { color: theme.colors.surface }]}>
              {formatCurrency(Math.abs(amount), currency)}
            </Text>
            
            <Text style={[styles.receiver, { color: theme.colors.surface }]}>
              {receiver}
            </Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 280,
    height: 320,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  checkContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  receiver: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
  },
});