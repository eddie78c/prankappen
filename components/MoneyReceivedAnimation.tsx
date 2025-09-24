import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import { Audio } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowDownLeft } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import { usePrank } from '../contexts/PrankContext';
import { formatCurrency } from '../utils/currency';

interface MoneyReceivedAnimationProps {
  amount: number;
  currency: string;
  receiver: string;
  onClose: () => void;
}

export default function MoneyReceivedAnimation({ 
  amount, 
  currency, 
  receiver, 
  onClose 
}: MoneyReceivedAnimationProps) {
  const { theme } = useTheme();
  const { settings } = usePrank();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(0);

  const playRequestSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/sounds/a-pay.mp3')
      );
      await sound.playAsync();
      
      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Error playing sound:', error);
    }
  };

  const generateTransactionId = () => {
    return Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  useEffect(() => {
    // Play configured sound for money received
    playRequestSound();
    
    // Start animation sequence
    opacity.value = withTiming(1, { duration: 300 });
    scale.value = withSequence(
      withSpring(1.2, { damping: 15 }),
      withSpring(1, { damping: 12 })
    );
    
    setTimeout(() => {
      iconScale.value = withSpring(1, { damping: 15 });
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

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });

  return (
    <Modal transparent visible animationType="fade">
      <View style={styles.overlay}>
        <Animated.View style={[animatedStyle]}>
          <LinearGradient
            colors={['#10B981', '#34D399']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
              <ArrowDownLeft size={60} color="white" />
            </Animated.View>
            
            <Text style={styles.title}>
              Money Received!
            </Text>
            
            <Text style={styles.amount}>
              {formatCurrency(Math.abs(amount), currency)}
            </Text>
            
            <Text style={styles.receiver}>
              {receiver}
            </Text>
            
            <Text style={styles.transactionId}>
              ID: {generateTransactionId()}
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
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'white',
  },
  receiver: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
  },
  transactionId: {
    fontSize: 14,
    fontFamily: 'monospace',
    opacity: 0.8,
    textAlign: 'center',
    color: 'white',
  },
});