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
import { useLanguage } from '../contexts/LanguageContext';
import { usePrank } from '../contexts/PrankContext';
import { formatCurrency } from '../utils/currency';
import TransactionIcon from './TransactionIcon';
import GlassCard from './GlassCard';

interface SwipeableTransactionProps {
  transaction: any;
  index: number;
  onDelete: () => void;
  canDelete: boolean;
}

const SWIPE_THRESHOLD = 100;
const DELETE_POSITION = -300;
const ANIMATION_DURATION = 200;
const DELETE_OPACITY_THRESHOLD = -50;

export default function SwipeableTransaction({
  transaction,
  index,
  onDelete,
  canDelete
}: SwipeableTransactionProps) {
  const { theme } = useTheme();
  const { translations } = useLanguage();
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
        if (translateX.value < -SWIPE_THRESHOLD) {
          // Delete the transaction
          translateX.value = withTiming(DELETE_POSITION, { duration: ANIMATION_DURATION });
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
      opacity: translateX.value < DELETE_OPACITY_THRESHOLD ? 1 : 0,
    };
  });

  const TransactionContent = () => (
    <TouchableOpacity
      style={[styles.transactionItem, {
        backgroundColor: theme.colors.surface,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      }]}
    >
      <TransactionIcon
        icon={transaction.icon}
        color={transaction.color}
        size={20}
        theme={theme}
      />
      <View style={styles.transactionDetails}>
        <Text style={[styles.transactionTitle, { color: theme.colors.text }]}>
          {transaction.titleKey ? translations[transaction.titleKey as keyof typeof translations] : transaction.title}
        </Text>
        <Text style={[styles.transactionDescription, { color: theme.colors.textSecondary }]}>
          {transaction.descriptionKey ? translations[transaction.descriptionKey as keyof typeof translations] : transaction.description}
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
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.container}
    >
      {Platform.OS !== 'web' ? (
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[animatedStyle]}>
            <TransactionContent />
          </Animated.View>
        </GestureDetector>
      ) : (
        <TransactionContent />
      )}
      
      {canDelete && (
        <Animated.View style={[styles.deleteIndicator, deleteIndicatorStyle]}>
          <Text style={styles.deleteText}>{translations.delete}</Text>
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
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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