import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Settings, Bell, CircleHelp as HelpCircle, Shield, LogOut, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import avatarPlaceholder from '../../assets/images/avatar.jpg';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePrank } from '../../contexts/PrankContext';
import { formatCurrency } from '../../utils/currency';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { translations } = useLanguage();
  const { logout } = useAuth();
  const { settings } = usePrank();

  const menuItems = [
    {
      icon: <Settings size={20} color={theme.colors.primary} />,
      title: translations.settings,
      onPress: () => {},
    },
    {
      icon: <Bell size={20} color={theme.colors.primary} />,
      title: translations.notifications,
      onPress: () => {},
    },
    {
      icon: <Shield size={20} color={theme.colors.primary} />,
      title: translations.security,
      onPress: () => {},
    },
    {
      icon: <HelpCircle size={20} color={theme.colors.primary} />,
      title: 'Help & Support',
      onPress: () => {},
    },
    {
      icon: <LogOut size={20} color={theme.colors.error} />,
      title: 'Log Out',
      onPress: logout,
    },
  ];

  const renderMenuItem = (item: any, index: number) => (
    <Animated.View
      key={index}
      entering={FadeInDown.delay(index * 100).springify()}
    >
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: theme.colors.surface }]}
        onPress={item.onPress}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, { backgroundColor: theme.colors.primary + '20' }]}>
            {item.icon}
          </View>
          <Text style={[styles.menuTitle, { color: theme.colors.text }]}>
            {item.title}
          </Text>
        </View>
        <ChevronRight size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.colors.gradient}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View entering={FadeInDown.delay(200)} style={styles.profileInfo}>
          <Image
            source={settings.receiverPhoto ? { uri: settings.receiverPhoto } : avatarPlaceholder}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: theme.colors.surface }]}>
            {settings.receiverName || 'John Doe'}
          </Text>
          <Text style={[styles.location, { color: theme.colors.surface }]}>
            {settings.profileLocation}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)} style={styles.balanceCard}>
          <View style={styles.balanceContainer}>
            <Text style={[styles.balanceLabel, { color: theme.colors.surface }]}>
              {translations.totalBalance}
            </Text>
            <Text style={[styles.balanceAmount, { color: theme.colors.surface }]}>
              {formatCurrency(settings.profileBalance, settings.currency)}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Budget Overview */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Budget Overview
            </Text>
            <View style={styles.budgetContainer}>
              {[
                {
                  name: 'Housing',
                  budget: 8000,
                  spent: 7200,
                  percentage: 90,
                  color: '#FF6B6B'
                },
                {
                  name: 'Food',
                  budget: 2000,
                  spent: 1200,
                  percentage: 60,
                  color: '#4ECDC4'
                },
                {
                  name: 'Transport',
                  budget: 1000,
                  spent: 650,
                  percentage: 65,
                  color: '#45B7D1'
                },
                {
                  name: 'Entertainment',
                  budget: 1500,
                  spent: 400,
                  percentage: 27,
                  color: '#96CEB4'
                }
              ].map((category, index) => (
                <View key={index} style={[styles.budgetItem, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetName, { color: theme.colors.text }]}>
                      {category.name}
                    </Text>
                    <Text style={[styles.budgetPercentage, { color: category.color }]}>
                      {category.percentage}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border }]}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          backgroundColor: category.color,
                          width: `${category.percentage}%` 
                        }
                      ]} 
                    />
                  </View>
                  <Text style={[styles.budgetAmount, { color: theme.colors.textSecondary }]}>
                    {formatCurrency(category.spent, settings.currency)} / {formatCurrency(category.budget, settings.currency)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Account
          </Text>
          {menuItems.map(renderMenuItem)}
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
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    opacity: 0.9,
  },
  balanceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 20,
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  budgetContainer: {
    gap: 12,
  },
  budgetItem: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetAmount: {
    fontSize: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
});