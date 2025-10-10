import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Home, Utensils, Car, Gamepad2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
const avatarPlaceholder = require('../../assets/images/avatar.jpg');
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { formatCurrency } from '../../utils/currency';
import { getMockUserData } from '../../data/mockData';
import GlassCard from '../../components/GlassCard';

export default function ProfileScreen() {
    const { theme } = useTheme();
    const { translations, currentLanguage } = useLanguage();
    const { settings } = usePrank();
   const mockUserData = getMockUserData(currentLanguage, settings.receiverName);
   const scrollRef = useRef<ScrollView>(null);

   // Scroll to top when this screen gains focus
   useFocusEffect(
     React.useCallback(() => {
       setTimeout(() => {
         scrollRef.current?.scrollTo({ y: 0, animated: false });
       }, 0);
       return undefined;
     }, [])
   );
 
   const getBudgetIcon = (categoryName: string) => {
     switch (categoryName) {
       case 'housing':
         return <Home size={20} color={theme.colors.primary} />;
       case 'food':
         return <Utensils size={20} color={theme.colors.primary} />;
       case 'transport':
         return <Car size={20} color={theme.colors.primary} />;
       case 'entertainment':
         return <Gamepad2 size={20} color={theme.colors.primary} />;
       default:
         return <Home size={20} color={theme.colors.primary} />;
     }
   };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Fixed Header */}
      <View style={[styles.fixedHeader, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity style={[styles.menuButton, { position: 'absolute', left: 20, top: 0, bottom: 0, justifyContent: 'center' }]}>
          <Text style={[styles.menuLines, { color: theme.colors.text }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {translations.account}
        </Text>
        <TouchableOpacity style={[styles.menuButton, { position: 'absolute', right: 20, top: 0, bottom: 0, justifyContent: 'center' }]}>
          <Bell size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView ref={scrollRef} style={[styles.content, { marginTop: 48 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.contentPadding}>
        {/* Profile Info */}
        <LinearGradient
          colors={theme.colors.gradient}
          style={styles.profileHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Animated.View entering={FadeInDown.delay(200)} style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image
                source={settings.receiverPhoto ? { uri: settings.receiverPhoto } : avatarPlaceholder}
                style={styles.avatar}
              />
              <View style={styles.avatarGlow} />
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.name, { color: theme.colors.surface }]}>
                {settings.receiverName || 'John Doe'}
              </Text>
              <Text style={[styles.location, { color: theme.colors.surface }]}>
                {settings.profileLocation}
              </Text>
            </View>
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
                <GlassCard key={index} style={styles.budgetItem}>
                  <View style={styles.budgetHeader}>
                    <View style={styles.budgetLeft}>
                      <View style={[styles.budgetIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                        {getBudgetIcon(category.nameKey)}
                      </View>
                      <Text style={[styles.budgetName, { color: theme.colors.text }]}>
                        {translations[category.nameKey as keyof typeof translations]}
                      </Text>
                    </View>
                    <Text style={[styles.budgetPercentage, { color: category.color }]}>
                      {category.percentage}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: theme.colors.border + '40' }]}>
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
                </GlassCard>
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
    zIndex: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderBottomWidth: 1,
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
  profileHeader: {
    marginTop: 16,
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  avatarGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 42,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  userInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  location: {
    fontSize: 16,
    opacity: 0.9,
    textAlign: 'center',
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
    fontSize: 16,
    opacity: 0.9,
    marginBottom: 12,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentPadding: {
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  budgetContainer: {
    gap: 8,
  },
  budgetItem: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  budgetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  budgetIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 10,
  },
  budgetPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  budgetAmount: {
    fontSize: 12,
  },
  budgetName: {
    fontSize: 14,
    fontWeight: '600',
  },
});