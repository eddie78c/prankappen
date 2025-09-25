import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS 
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { usePrank } from '../contexts/PrankContext';
import { formatCurrency } from '../utils/currency';
import TransactionIcon from './TransactionIcon';

interface SwipeableTransactionProps {
  transaction: any;
  index: number;
  onDelete: () => void;
  canDelete: boolean;
}

export default function SwipeableTransaction({ 
  transaction, 
  index, 
  onDelete, 
  canDelete 
}: SwipeableTransactionProps) {
  const { theme } = useTheme();
  const { settings } = usePrank();
  const translateX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      'worklet';
      // Store initial position
    })
    .onUpdate((event) => {
      'worklet';
      if (canDelete) {
        translateX.value = Math.min(0, event.translationX);
      }
    })
    .onEnd(() => {
      'worklet';
      if (canDelete) {
        if (translateX.value < -100) {
          // Delete the transaction
          translateX.value = withTiming(-300, { duration: 200 });
          runOnJS(onDelete)();
        } else {
          // Snap back
          translateX.value = withTiming(0);
        }
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const deleteIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value < -50 ? 1 : 0,
    };
  });

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.container}
    >
      {Platform.OS !== 'web' ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[animatedStyle]}>
            <TouchableOpacity 
              style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}
            >
              <TransactionIcon 
                icon={transaction.icon} 
                color={transaction.color} 
                size={20} 
              />
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
                  {transaction.title}
                </Text>
                <Text style={[styles.transactionDescription, { color: theme.colors.textSecondary }]}>
                  {transaction.description}
                </Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={[
                  styles.amountText,
                  { color: transaction.amount > 0 ? theme.colors.success : theme.colors.text }
                ]}>
                  {formatCurrency(transaction.amount, settings.currency)}
                </Text>
                <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
                  {transaction.date}
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </GestureDetector>
      ) : (
        <TouchableOpacity 
          style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}
        >
          <TransactionIcon 
            icon={transaction.icon} 
            color={transaction.color} 
            size={20} 
          />
          <View style={styles.transactionDetails}>
            <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
              {transaction.title}
            </Text>
            <Text style={[styles.transactionDescription, { color: theme.colors.textSecondary }]}>
              {transaction.description}
            </Text>
          </View>
          <View style={styles.transactionAmount}>
            <Text style={[
              styles.amountText,
              { color: transaction.amount > 0 ? theme.colors.success : theme.colors.text }
            ]}>
              {formatCurrency(transaction.amount, settings.currency)}
            </Text>
            <Text style={[styles.transactionDate, { color: theme.colors.textSecondary }]}>
              {transaction.date}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      
      {canDelete && (
        <Animated.View style={[styles.deleteIndicator, deleteIndicatorStyle]}>
          <Text style={styles.deleteText}>Delete</Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionDetails: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 11,
    marginTop: 2,
  },
  deleteIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});