import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, PiggyBank, CreditCard, X, Wind, DoorOpen, ArrowDown, ArrowUp, TrendingUp, TrendingDown } from 'lucide-react-native';
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
import SwipeableTransaction from '../../components/SwipeableTransaction';
import { formatCurrency } from '../../utils/currency';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PADDING = 16;
const CARD_GAP = 12;

export default function HomeScreen() {
  const { theme } = useTheme();
  const { translations, currentLanguage } = useLanguage();
  // Date helpers for dynamic, locale-aware formatting
  const locale = currentLanguage === 'sv' ? 'sv-SE' : (currentLanguage === 'en' ? 'en-US' : currentLanguage);
  const formatDate = (date: Date) => date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });
  const formatDateEnUS = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todayDateStr = formatDate(new Date());
  const todayDateStrEnUS = formatDateEnUS(new Date());
  const yesterdayDateStr = formatDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
  const yesterdayDateStrEnUS = formatDateEnUS(new Date(Date.now() - 24 * 60 * 60 * 1000));
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
  } = usePrank();

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
  const [showAll, setShowAll] = React.useState(false);

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
    const newTransaction = {
      titleKey: 'request',
      description: `${translations.to || 'To'} ${settings.receiverName}`,
      amount: settings.defaultAmount,
      date: todayDateStr,
      category: 'transfer',
      icon: 'arrow-down-left',
      color: '#10B981'
    };

    addTransaction(newTransaction);
    updateSettings({
      profileBalance: settings.profileBalance + settings.defaultAmount
    });
    updateMonthlyIncome(settings.defaultAmount);
    playRequestSound();
    createAnimationData(settings.defaultAmount, settings.receiverName, 'received');
  };

  const handleSendToPhone = (phoneNumber: string, amount: number) => {
    const newTransaction = {
      titleKey: 'send',
      description: `${translations.to || 'To'} ${phoneNumber}`,
      amount: -amount,
      date: todayDateStr,
      category: 'transfer',
      icon: 'arrow-up-right',
      color: '#FF6B6B'
    };

    addTransaction(newTransaction);
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

  const renderQuickAction = (
    icon: React.ReactNode, 
    label: string, 
    index: number, 
    onPress: () => void,
    color: string = theme.colors.primary
  ) => (
    <Animated.View key={label} entering={FadeInRight.delay(index * 100).springify()}>
      <TouchableOpacity
        style={[styles.quickAction, { backgroundColor: theme.colors.surface }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
          {icon}
        </View>
        <Text style={[styles.actionLabel, { color: theme.colors.text }]} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderTransaction = (transaction: any, index: number) => (
    <SwipeableTransaction
      key={transaction.id}
      transaction={transaction}
      index={index}
      onDelete={() => deleteTransaction(transaction.id)}
      canDelete={transaction.date === todayDateStr || transaction.date === todayDateStrEnUS}
    />
  );

  // Group transactions by date for dynamic listing
  const todayTransactions = transactions.filter(
    (t: any) => t.date === todayDateStr || t.date === todayDateStrEnUS
  );
  const yesterdayTransactions = transactions.filter(
    (t: any) => t.date === yesterdayDateStr || t.date === yesterdayDateStrEnUS
  );
  const otherTransactions = transactions.filter(
    (t: any) =>
      t.date !== todayDateStr &&
      t.date !== todayDateStrEnUS &&
      t.date !== yesterdayDateStr &&
      t.date !== yesterdayDateStrEnUS
  );
  const maxToShow = showAll ? Number.MAX_SAFE_INTEGER : 10;
  const showTodayCount = Math.min(todayTransactions.length, maxToShow);
  const remainingAfterToday = maxToShow - showTodayCount;
  const showYesterdayCount = Math.min(yesterdayTransactions.length, remainingAfterToday);
  const remainingAfterYesterday = remainingAfterToday - showYesterdayCount;
  const showOtherCount = Math.max(0, remainingAfterYesterday);

  if (showPrankReveal) {
    return <PrankRevealScreen onClose={() => setShowPrankReveal(false)} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface, 
        borderBottomColor: theme.colors.border 
      }]}>
        <TouchableOpacity 
          style={styles.headerButton} 
          onPressIn={() => setShowMenu(true)}
          delayPressIn={0}
          hitSlop={{ top: 30, right: 30, bottom: 30, left: 30 }}
        >
          <Text style={[styles.menuIcon, { color: theme.colors.text }]}>☰</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {translations.dashboard}
        </Text>
        
        <TouchableOpacity 
          style={styles.headerButton} 
          onPress={() => setShowPrankModal(true)}
        >
          <Bell size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Secret Spots */}
      <TouchableOpacity
        style={styles.secretSpot}
        onPressIn={handleLongPressStart}
        onPressOut={handleLongPressEnd}
      />
      <TouchableOpacity
        style={styles.secretTapSpot}
        onPress={handleSecretTap}
      />

      <ScrollView 
        ref={scrollRef} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Section */}
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.balanceSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.subtitle}>
            {translations.overview}
          </Text>

          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>
                {translations.totalBalance}
              </Text>
              <Text
                style={styles.balanceAmount}
              >
                {formatCurrency(settings.profileBalance, settings.currency)}
              </Text>
              
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <TrendingUp size={16} color={theme.colors.success} />
                    <Text style={styles.statAmount}>
                      {formatCurrency(settings.profileMonthlyIncome, settings.currency)}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>
                    {translations.monthlyIncome}
                  </Text>
                </View>
                
                <View style={[styles.statCard, styles.statCardRight]}>
                  <View style={styles.statHeader}>
                    <TrendingDown size={16} color={theme.colors.error || '#FF6B6B'} />
                    <Text style={styles.statAmount}>
                      {formatCurrency(settings.profileTodaySpent, settings.currency)}
                    </Text>
                  </View>
                  <Text style={styles.statLabel}>
                    {translations.todaySpent}
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        </LinearGradient>

        {/* Content Section */}
        <View style={styles.contentSection}>
          {/* Quick Actions */}
          <View style={styles.quickActionsContainer}>
            {renderQuickAction(
              <ArrowDown size={22} color={theme.colors.success} />,
              translations.request || 'Request',
              0,
              handleSendMoney,
              theme.colors.success
            )}
            {renderQuickAction(
              <ArrowUp size={22} color={theme.colors.primary} />,
              translations.send || 'Send',
              1,
              () => setShowSendModal(true),
              theme.colors.primary
            )}
            {renderQuickAction(
              <PiggyBank size={22} color={theme.colors.primary} />,
              translations.loan || 'Loan',
              2,
              () => {},
              theme.colors.primary
            )}
            {renderQuickAction(
              <CreditCard size={22} color={theme.colors.primary} />,
              translations.topup || 'Top-up',
              3,
              playRequestSound,
              theme.colors.primary
            )}
          </View>

          {/* Recent Transactions */}
          <View style={[styles.transactionsSection, { paddingHorizontal: PADDING }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {translations.recentTransactions}
              </Text>
              <TouchableOpacity onPress={() => setShowAll(true)}>
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                  {translations.seeAll}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.transactionsList}>
              <Text style={[styles.transactionGroup, { color: theme.colors.textSecondary }]}>
                {translations.today}
              </Text>
              {todayTransactions
                .slice(0, showAll ? todayTransactions.length : showTodayCount)
                .map(renderTransaction)}
              
              <Text style={[styles.transactionGroup, { color: theme.colors.textSecondary }]}>
                {translations.yesterday}
              </Text>
              {yesterdayTransactions
                .slice(0, showAll ? yesterdayTransactions.length : showYesterdayCount)
                .map(renderTransaction)}

              {(showAll || showOtherCount > 0) && (
                <>
                  <Text style={[styles.transactionGroup, { color: theme.colors.textSecondary }]}>
                    {translations.thisWeek}
                  </Text>
                  {otherTransactions
                    .slice(0, showAll ? otherTransactions.length : showOtherCount)
                    .map(renderTransaction)}
                </>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Animations */}
      {showAnimation && animationData && (
        <>
          {animationType === 'sent' && (
            <MoneySentAnimation 
              amount={animationData.amount}
              currency={animationData.currency}
              receiver={animationData.receiver}
              onClose={() => {
                setShowAnimation(false);
                setAnimationData(null);
              }}
            />
          )}
          {animationType === 'received' && (
            <MoneyReceivedAnimation 
              amount={animationData.amount}
              currency={animationData.currency}
              receiver={animationData.receiver}
              onClose={() => {
                setShowAnimation(false);
                setAnimationData(null);
              }}
            />
          )}
        </>
      )}
      
      {/* Modals */}
      <PrankModal 
        visible={showPrankModal}
        onClose={() => setShowPrankModal(false)}
      />
      
      <SendMoneyModal
        visible={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendToPhone}
      />

      {/* Menu */}
      {showMenu && (
        <>
          <TouchableOpacity 
            style={styles.menuOverlay} 
            onPressIn={() => setShowMenu(false)}
            delayPressIn={0}
            activeOpacity={1}
          />
          <View style={[styles.menu, { 
            backgroundColor: theme.colors.surface, 
            borderColor: theme.colors.border 
          }]}>
            <View style={[styles.menuHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
                {translations.menu}
              </Text>
              <TouchableOpacity
                onPress={() => setShowMenu(false)}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              >
                <X size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.menuItem, { borderBottomColor: theme.colors.border }]} 
              onPress={() => { 
                setShowMenu(false); 
                router.push('/farts'); 
              }}
            >
              <Wind size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {translations.farts}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={() => { 
                setShowMenu(false); 
                router.push('/knock'); 
              }}
            >
              <DoorOpen size={20} color={theme.colors.text} />
              <Text style={[styles.menuItemText, { color: theme.colors.text }]}>
                {translations.knock}
              </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: PADDING,
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 22,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollContent: {
    flexGrow: 1,
  },
  balanceSection: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: PADDING,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  balanceCard: {
    padding: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 8,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: 0.5,
    flexWrap: 'wrap',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: CARD_GAP,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
    padding: 12,
  },
  statCardRight: {
    marginLeft: 0,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.75)',
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  contentSection: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
    paddingHorizontal: PADDING,
    gap: 12,
  },
  quickAction: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 16,
    width: (SCREEN_WIDTH - (PADDING * 2) - (12 * 3)) / 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
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
    letterSpacing: 0.2,
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  transactionsList: {
    gap: 2,
  },
  transactionGroup: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 998,
  },
  menu: {
    position: 'absolute',
    top: 60,
    left: PADDING,
    width: SCREEN_WIDTH * 0.65,
    maxWidth: 280,
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    zIndex: 999,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});