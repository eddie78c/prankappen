import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { formatCurrency } from '../../utils/currency';
import { mockUserData } from '../../data/mockData';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PADDING = 16;

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { translations, currentLanguage } = useLanguage();
  const { settings } = usePrank();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 0);
      return undefined;
    }, [])
  );

  const dynamicTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now);
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const dayBefore = new Date(now);
    dayBefore.setDate(now.getDate() - 2);
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);

    const locale = currentLanguage === 'sv' ? 'sv-SE' : (currentLanguage === 'en' ? 'en-US' : currentLanguage);
    const formatDate = (date: Date) =>
      date.toLocaleDateString(locale, { month: 'short', day: 'numeric' });

    const chains = [
      'chain1', 'chain2', 'chain3', 'chain4', 'chain5',
      'chain6', 'chain7', 'chain8', 'chain9', 'chain10'
    ];

    const extendedTransactions = [...mockUserData.recentTransactions];

    chains.slice(0, 8).forEach((chainKey, index) => {
      extendedTransactions.push({
        id: `chain-${index}`,
        titleKey: 'grocery',
        descriptionKey: chainKey,
        amount: -(Math.random() * 50 + 10),
        icon: '🛒',
        category: 'shopping',
        date: ''
      });
    });

    return extendedTransactions.map((transaction, index) => {
      let date;
      if (index < 2) date = formatDate(today);
      else if (index < 4) date = formatDate(yesterday);
      else if (index < 6) date = formatDate(dayBefore);
      else date = formatDate(lastWeek);

      return { ...transaction, date };
    });
  }, [currentLanguage]);

  const filters = [
    { key: 'all', label: translations.all },
    { key: 'income', label: translations.income },
    { key: 'expenses', label: translations.expenses }
  ];

  const groupedTransactions = useMemo(() => {
    const firstDate = dynamicTransactions[0]?.date;
    const secondDate = dynamicTransactions[2]?.date;

    return {
      today: dynamicTransactions.filter(t => t.date === firstDate),
      yesterday: dynamicTransactions.filter(t => t.date === secondDate),
      thisWeek: dynamicTransactions.filter(t => t.date !== firstDate && t.date !== secondDate)
    };
  }, [dynamicTransactions]);

  const getCategoryIcon = (icon: string) => {
    const iconMap: { [key: string]: string } = {
      '🛒': '🛍️',
      '☕': '☕',
      '🎮': '🎯',
      '🚗': '🚙',
      '🏠': '🏡',
      '💼': '💰',
      '🎬': '🎪',
      '✈️': '✈️',
    };
    return iconMap[icon] || icon;
  };

  const renderTransaction = (transaction: any, index: number) => (
    <Animated.View
      key={transaction.id}
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <TouchableOpacity 
        style={[styles.transactionCard, { backgroundColor: theme.colors.surface }]}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.background }]}>
          <Text style={styles.emoji}>{getCategoryIcon(transaction.icon)}</Text>
        </View>
        
        <View style={styles.detailsContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {translations[transaction.titleKey as keyof typeof translations]}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]} numberOfLines={1}>
            {translations[transaction.descriptionKey as keyof typeof translations]}
          </Text>
        </View>
        
        <View style={styles.amountContainer}>
          <Text style={[
            styles.amount,
            { color: transaction.amount > 0 ? theme.colors.success : theme.colors.text }
          ]}>
            {formatCurrency(transaction.amount, settings.currency)}
          </Text>
          <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
            {transaction.date}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface,
        borderBottomColor: theme.colors.border
      }]}>
        <View style={styles.headerSpacer} />
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {translations.history}
        </Text>
        <TouchableOpacity 
          style={[styles.searchButton, { backgroundColor: theme.colors.background }]}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={22} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {filters.map((filter, index) => (
            <Animated.View key={filter.key} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: selectedFilter === filter.key 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.key)}
                activeOpacity={0.8}
              >
                <Text style={[
                  styles.filterLabel,
                  {
                    color: selectedFilter === filter.key 
                      ? '#FFFFFF'
                      : theme.colors.text,
                  },
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView 
        ref={scrollRef} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Today */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {translations.today}
          </Text>
          {groupedTransactions.today.map((transaction, index) => 
            renderTransaction(transaction, index)
          )}
        </View>

        {/* Yesterday */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {translations.yesterday}
          </Text>
          {groupedTransactions.yesterday.map((transaction, index) => 
            renderTransaction(transaction, index + 2)
          )}
        </View>

        {/* This Week */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>
            {translations.thisWeek}
          </Text>
          {groupedTransactions.thisWeek.map((transaction, index) => 
            renderTransaction(transaction, index + 4)
          )}
        </View>
      </ScrollView>
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
  headerSpacer: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    paddingVertical: 12,
  },
  filterContent: {
    paddingHorizontal: PADDING,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    paddingBottom: 20,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  emoji: {
    fontSize: 18,
  },
  detailsContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 1,
    letterSpacing: 0.1,
  },
  description: {
    fontSize: 11,
    letterSpacing: 0.1,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  date: {
    fontSize: 10,
    marginTop: 1,
  },
});