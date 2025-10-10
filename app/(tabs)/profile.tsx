import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { Home, Utensils, Car, Gamepad2 } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
const avatarPlaceholder = require('../../assets/images/avatar.jpg');
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { usePrank } from '../../contexts/PrankContext';
import { formatCurrency } from '../../utils/currency';
import { getMockUserData } from '../../data/mockData';
import GlassCard from '../../components/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HORIZONTAL_PADDING = 16;
const CARD_GAP = 12;

export default function ProfileScreen() {
  const { theme } = useTheme();
  const { translations, currentLanguage } = useLanguage();
  const { settings } = usePrank();
  const mockUserData = getMockUserData(currentLanguage, settings.receiverName);
  const scrollRef = useRef<ScrollView>(null);

  useFocusEffect(
    React.useCallback(() => {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
      }, 0);
      return undefined;
    }, [])
  );

  const getBudgetIcon = (categoryName: string) => {
    const iconProps = { size: 20, color: theme.colors.primary };
    switch (categoryName) {
      case 'housing':
        return <Home {...iconProps} />;
      case 'food':
        return <Utensils {...iconProps} />;
      case 'transport':
        return <Car {...iconProps} />;
      case 'entertainment':
        return <Gamepad2 {...iconProps} />;
      default:
        return <Home {...iconProps} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { 
        backgroundColor: theme.colors.surface, 
        borderBottomColor: theme.colors.border 
      }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          {translations.account}
        </Text>
      </View>

      <ScrollView 
        ref={scrollRef} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profil Sektion */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarGlow} />
            <Image
              source={settings.receiverPhoto ? { uri: settings.receiverPhoto } : avatarPlaceholder}
              style={styles.avatar}
            />
          </View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {settings.receiverName || 'John Doe'}
          </Text>
          <Text style={[styles.userLocation, { color: theme.colors.textSecondary }]}>
            {settings.profileLocation}
          </Text>
        </Animated.View>

        {/* Saldo Kort */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
          <GlassCard style={styles.balanceCard}>
            <Text style={[styles.balanceLabel, { color: theme.colors.textSecondary }]}>
              {translations.totalBalance}
            </Text>
            <Text style={[styles.balanceAmount, { color: theme.colors.text }]}>
              {formatCurrency(settings.profileBalance, settings.currency)}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Budget Översikt */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {translations.budgetOverview}
          </Text>
          
          {mockUserData.budgetCategories.map((category, index) => (
            <GlassCard key={index} style={styles.budgetCard}>
              <View style={styles.budgetRow}>
                <View style={styles.budgetInfo}>
                  <View style={[styles.iconCircle, { 
                    backgroundColor: theme.colors.primary + '15' 
                  }]}>
                    {getBudgetIcon(category.nameKey)}
                  </View>
                  <View style={styles.budgetTextContainer}>
                    <Text style={[styles.categoryName, { color: theme.colors.text }]}>
                      {translations[category.nameKey as keyof typeof translations]}
                    </Text>
                    <Text style={[styles.budgetSubtext, { color: theme.colors.textSecondary }]}>
                      {formatCurrency(category.spent, settings.currency)} / {formatCurrency(category.budget, settings.currency)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.percentage, { color: category.color }]}>
                  {category.percentage}%
                </Text>
              </View>
              
              <View style={[styles.progressTrack, { 
                backgroundColor: theme.colors.border + '40' 
              }]}>
                <View style={[styles.progressBar, {
                  backgroundColor: category.color,
                  width: `${category.percentage}%`
                }]} />
              </View>
            </GlassCard>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_PADDING,
    paddingTop: 24,
    paddingBottom: 32,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGlow: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 46,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  userName: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userLocation: {
    fontSize: 15,
    letterSpacing: 0.2,
  },
  section: {
    marginBottom: 20,
  },
  balanceCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 0.5,
    flexWrap: 'wrap',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  budgetCard: {
    padding: 16,
    borderRadius: 14,
    marginBottom: CARD_GAP,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  budgetInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  budgetTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  budgetSubtext: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  percentage: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});