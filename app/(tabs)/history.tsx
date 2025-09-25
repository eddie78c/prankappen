import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { formatCurrency } from '../../utils/currency';
import { mockUserData } from '../../data/mockData';

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const { settings } = usePrank();
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'income', label: 'Income' },
    { key: 'expenses', label: 'Expenses' }
  ];

  const renderTransaction = (transaction: any, index: number) => (
    <Animated.View
      key={transaction.id}
      entering={FadeInDown.delay(index * 50).springify()}
    >
      <TouchableOpacity style={[styles.transactionItem, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.transactionIcon}>
          <Text style={styles.transactionEmoji}>{transaction.icon}</Text>
        </View>
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
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translations.history}
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="search" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="filter" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerButton, { backgroundColor: theme.colors.background }]}>
            <Ionicons name="calendar" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter, index) => (
            <Animated.View key={filter.key} entering={FadeInDown.delay(index * 100)}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selectedFilter === filter.key 
                      ? theme.colors.primary 
                      : theme.colors.surface,
                  },
                ]}
                onPress={() => setSelectedFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: selectedFilter === filter.key 
                        ? theme.colors.surface 
                        : theme.colors.text,
                    },
                  ]}
                >
                  {filter.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.transactionsList}>
          <Text style={[styles.transactionGroup, { color: theme.colors.textSecondary }]}>
            {translations.today}
          </Text>
          {mockUserData.recentTransactions.slice(0, 2).map((transaction, index) => renderTransaction(transaction, index))}
          
          <Text style={[styles.transactionGroup, { color: theme.colors.textSecondary }]}>
            {translations.yesterday}
          </Text>
          {mockUserData.recentTransactions.slice(2, 4).map((transaction, index) => renderTransaction(transaction, index + 2))}
          
          <Text style={[styles.transactionGroup, { color: theme.colors.textSecondary }]}>
            {translations.thisWeek}
          </Text>
          {mockUserData.recentTransactions.slice(0, 4).map((transaction, index) => renderTransaction(transaction, index + 4))}
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    height: 88,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  transactionsList: {
    paddingBottom: 20,
  },
  transactionGroup: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionEmoji: {
    fontSize: 20,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 4,
  },
});