import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, Animated as RNAnimated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Plus, CreditCard, PiggyBank, Bell, X, Wind, DoorOpen } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import GlassCard from '../../components/GlassCard';
import MoneySentAnimation from '../../components/MoneySentAnimation';
import MoneyReceivedAnimation from '../../components/MoneyReceivedAnimation';
import PrankRevealScreen from '../../components/PrankRevealScreen';
import PrankModal from '../../components/PrankModal';
import SendMoneyModal from '../../components/SendMoneyModal';
import TransactionIcon from '../../components/TransactionIcon';
import SwipeableTransaction from '../../components/SwipeableTransaction';
import { formatCurrency } from '../../utils/currency';

export default function HomeScreen() {
    const { theme } = useTheme();
    const { translations } = useLanguage();
    const router = useRouter();
    const scrollRef = React.useRef<ScrollView>(null);
    const {
      settings,
      updateSettings,
      showPrankReveal,
      setShowPrankReveal,
      transactions,
      addTransaction,
      deleteTransaction,
      updateMonthlyIncome,
      sendMode,
      setSendMode
    } = usePrank();
    const { height } = Dimensions.get('window');
  const [showAnimation, setShowAnimation] = React.useState(false);
  const [animationType, setAnimationType] = React.useState<'sent' | 'received'>('received');
  const [secretTaps, setSecretTaps] = React.useState(0);
  const [lastTapTime, setLastTapTime] = React.useState(0);
  const [longPressTimer, setLongPressTimer] = React.useState<ReturnType<typeof setTimeout> | null>(null);
  const [showPrankModal, setShowPrankModal] = React.useState(false);
  const [showSendModal, setShowSendModal] = React.useState(false);
  const [animationData, setAnimationData] = React.useState<{
    amount: number;
    currency: string;
    receiver: string;
  } | null>(null);
  const [showMenu, setShowMenu] = React.useState(false);

  // Scroll to top when this screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 0);
      return undefined;
    }, [])
  );

  const playRequestSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/a-pay.mp3')
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

  const createAnimationData = (amount: number, receiver: string, type: 'sent' | 'received') => {
    setAnimationData({
      amount: Math.abs(amount),
      currency: settings.currency,
      receiver
    });
    setAnimationType(type);
    setShowAnimation(true);
  };

  const handleSendMoney = () => {
    // Add new transaction
    const newTransaction = {
      titleKey: 'request',
      description: `From ${settings.receiverName}`,
      amount: settings.defaultAmount,
      date: 'Today',
      category: 'transfer',
      icon: 'arrow-down-left',
      color: '#10B981'
    };

    addTransaction(newTransaction);

    // Update balance and monthly income
    updateSettings({
      profileBalance: settings.profileBalance + settings.defaultAmount
    });
    updateMonthlyIncome(settings.defaultAmount);

    // Play sound
    playRequestSound();

    createAnimationData(settings.defaultAmount, `From ${settings.receiverName}`, 'received');
  };

  const handleSendToPhone = (phoneNumber: string, amount: number) => {
    // Add new transaction
    const newTransaction = {
      titleKey: 'send',
      description: `To ${phoneNumber}`,
      amount: -amount,
      date: 'Today',
      category: 'transfer',
      icon: 'arrow-up-right',
      color: '#FF6B6B'
    };

    addTransaction(newTransaction);

    // Update balance and today spent
    updateSettings({
      profileBalance: settings.profileBalance - amount,
      profileTodaySpent: settings.profileTodaySpent + amount
    });

    createAnimationData(amount, phoneNumber, 'sent');
  };

  const handleSecretTap = () => {
    const now = Date.now();
    
    if (now - lastTapTime < 500) {
      const newCount = secretTaps + 1;
      setSecretTaps(newCount);
      
      if (newCount >= 3) {
        setShowPrankReveal(true);
        setSecretTaps(0);
      }
    } else {
      setSecretTaps(1);
    }
    
    setLastTapTime(now);
  };

  const handleLongPressStart = () => {
    const timer = setTimeout(() => {
      setShowPrankReveal(true);
    }, 2000);
    
    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const getQuickActionPressHandler = (label: string) => () => {
    if (label === translations.send && sendMode === 'send') {
      handleSendMoney();
    } else if (label === translations.send && sendMode === 'receive') {
      setShowSendModal(true);
    }
  };

  const renderQuickAction = (icon: React.ReactNode, label: string, index: number) => (
    <Animated.View
      key={label}
      entering={FadeInRight.delay(index * 200).springify()}
    >
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
        onPress={getQuickActionPressHandler(label)}
      >
        <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.actionLabel, { color: theme.colors.text }]}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTransaction = (transaction: any, index: number) => (
    <SwipeableTransaction
      key={transaction.id}
      transaction={transaction}
      index={index}
      onDelete={() => deleteTransaction(transaction.id)}
      canDelete={transaction.date === 'Today'}
    />
  );

  if (showPrankReveal) {
    return <PrankRevealScreen onClose={() => setShowPrankReveal(false)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>

      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.menuButton, { position: 'absolute', left: 20, top: 0, bottom: 0, justifyContent: 'center' }]} onPress={() => setShowMenu(true)}>
          <Text style={[styles.menuLines, { color: theme.colors.text }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {translations.dashboard}
        </Text>
        <TouchableOpacity onPress={() => setShowPrankModal(true)} style={[styles.menuButton, { position: 'absolute', right: 20, top: 0, bottom: 0, justifyContent: 'center' }]}>
          <Bell size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Secret spots for prank reveal */}
      <TouchableOpacity
        style={styles.secretSpot}
        onPressIn={handleLongPressStart}
        onPressOut={handleLongPressEnd}
      />

      <TouchableOpacity
        style={styles.secretTapSpot}
        onPress={handleSecretTap}
      />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} style={{ marginTop: 48 }} contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.balanceSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={[styles.subtitle, { color: theme.colors.surface }]}>
            {translations.overview}
          </Text>

          {/* Balance Card */}
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.balanceCard}>
              <Text style={[styles.balanceLabel, { color: theme.colors.surface }]}>
                {translations.totalBalance}
              </Text>
              <Text style={[styles.balanceAmount, { color: theme.colors.surface }]}>
                {formatCurrency(settings.profileBalance, settings.currency)}
              </Text>
              
              <View style={styles.balanceStats}>
                <View style={styles.statItem}>
                  <Text style={[styles.statAmount, { color: theme.colors.surface }]}>
                    {formatCurrency(settings.profileMonthlyIncome, settings.currency)}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.surface }]}>
                    {translations.monthlyIncome}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statAmount, { color: theme.colors.surface }]}>
                    -{formatCurrency(settings.profileTodaySpent, settings.currency)}
                  </Text>
                  <Text style={[styles.statLabel, { color: theme.colors.surface }]}>
                    {translations.todaySpent}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </LinearGradient>

        <View style={{ paddingHorizontal: 16, paddingVertical: 20 }}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Animated.View entering={FadeInRight.delay(0 * 200).springify()}>
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
                onPress={handleSendMoney}
              >
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '20' }]}>
                  <Plus size={24} color={theme.colors.success} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                  {translations.request}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            
            <Animated.View entering={FadeInRight.delay(1 * 200).springify()}>
              <TouchableOpacity 
                style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
                onPress={() => setShowSendModal(true)}
              >
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '20' }]}>
                  <Send size={24} color={theme.colors.primary} />
                </View>
                <Text style={[styles.actionLabel, { color: theme.colors.text }]}>
                  {translations.send}
                </Text>
              </TouchableOpacity>
            </Animated.View>
            
            {renderQuickAction(<PiggyBank size={24} color={theme.colors.primary} />, translations.loan || 'Loan', 2)}
            {renderQuickAction(<CreditCard size={24} color={theme.colors.primary} />, translations.topup || 'Top-up', 3)}
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.recentTransactions}
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                  {translations.seeAll}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              <Text style={[styles.transactionGroup, { color: theme.colors.text }]}>
                {translations.today}
              </Text>
              {transactions.filter(t => t.date === 'Today' || t.date === 'Aug 26').map(renderTransaction)}
              
              <Text style={[styles.transactionGroup, { color: theme.colors.text }]}>
                {translations.yesterday}
              </Text>
              {transactions.filter(t => t.date === 'Aug 25').map(renderTransaction)}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {showAnimation && (
        <>
          {animationType === 'sent' && (
            <MoneySentAnimation 
              amount={animationData?.amount || 0}
              currency={animationData?.currency || settings.currency}
              receiver={animationData?.receiver || ''}
              onClose={() => {
                setShowAnimation(false);
                setAnimationData(null);
              }}
            />
          )}
          {animationType === 'received' && (
            <MoneyReceivedAnimation 
              amount={animationData?.amount || 0}
              currency={animationData?.currency || settings.currency}
              receiver={animationData?.receiver || ''}
              onClose={() => {
                setShowAnimation(false);
                setAnimationData(null);
              }}
            />
          )}
        </>
      )}
      
      <PrankModal 
        visible={showPrankModal}
        onClose={() => setShowPrankModal(false)}
      />
      
      <SendMoneyModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendToPhone}
      />

      {showMenu && (
        <>
          <TouchableOpacity style={styles.menuOverlay} onPress={() => setShowMenu(false)} />
          <View style={[styles.menu, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.colors.border, paddingVertical: 8, marginBottom: 8 }}>
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{translations.menu}</Text>
              <TouchableOpacity
                onPress={() => setShowMenu(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                accessibilityRole="button"
                style={{ paddingHorizontal: 4, paddingVertical: 2 }}
              >
                <X size={18} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomColor: theme.colors.border }]} onPress={() => { setShowMenu(false); router.push('/farts'); }}>
              <Wind size={18} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{translations.farts}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuItem, { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomColor: theme.colors.border }]} onPress={() => { setShowMenu(false); router.push('/knock'); }}>
              <DoorOpen size={18} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>{translations.knock}</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    marginTop: 0,
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 0,
    zIndex: 1000,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
  },
  balanceSection: {
    marginTop: 0,
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLines: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 20,
  },
  balanceCard: {
    marginTop: 10,
    padding: 16,
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  balanceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 12,
  },
  quickAction: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    width: 80,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    gap: 2,
  },
  transactionGroup: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secretSpot: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  secretTapSpot: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  menuOverlay: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    elevation: 4,
  },
  menu: {
    position: 'absolute',
    top: 48,
    left: 20,
    width: 240,
    minHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 999,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    // borderBottomColor sätts via inline-styles för att använda theme.colors.border
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});