import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Bell, Shield, HelpCircle as CircleHelp, LogOut, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
const avatarPlaceholder = require('../../assets/images/avatar.jpg');
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { usePrank } from '../../contexts/PrankContext';
import { formatCurrency } from '../../utils/currency';
import { getMockUserData } from '../../data/mockData';
import GlassCard from '../../components/GlassCard';

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { translations, currentLanguage } = useLanguage();
  const { logout } = useAuth();
  const { settings } = usePrank();
  const mockUserData = getMockUserData(currentLanguage, settings.receiverName);

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
      icon: <CircleHelp size={20} color={theme.colors.primary} />,
      title: translations.helpAndSupport,
      onPress: () => {},
    },
    {
      icon: <LogOut size={20} color={theme.colors.error} />,
      title: translations.logOut,
      onPress: logout,
    },
  ];

  const renderMenuItem = (item: any, index: any) => (
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
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {translations.account}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
        {/* Profile Info */}
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.profileHeader}
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
        </LinearGradient>
        {/* Balance Section */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.balanceSection}>
          <GlassCard style={styles.balanceCard}>
            <View style={styles.balanceContainer}>
              <Text style={[styles.balanceLabel, { color: theme.colors.text }]}>
                {translations.totalBalance}
              </Text>
              <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
                {formatCurrency(settings.profileBalance, settings.currency)}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Budget Overview */}
        <Animated.View entering={FadeInDown.delay(800)}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {translations.budgetOverview}
            </Text>
            <View style={styles.budgetContainer}>
              {mockUserData.budgetCategories.map((category, index) => (
                <View key={index} style={[styles.budgetItem, { backgroundColor: theme.colors.surface }]}>
                  <View style={styles.budgetHeader}>
                    <Text style={[styles.budgetName, { color: theme.colors.text }]}>
                      {translations[category.nameKey as keyof typeof translations]}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    paddingTop: 0,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    zIndex: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  profileHeader: {
    marginTop: 0,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  location: {
    fontSize: 14,
    opacity: 0.9,
  },
  balanceSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  balanceCard: {
    padding: 16,
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
    marginTop: 48,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  budgetContainer: {
    gap: 8,
  },
  budgetItem: {
    padding: 12,
    borderRadius: 10,
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
    marginBottom: 6,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginBottom: 8,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetAmount: {
    fontSize: 12,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    width: '100%',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
});