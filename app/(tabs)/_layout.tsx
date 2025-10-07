import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Wallet, History, CreditCard, User, Settings } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const { translations, isRTL } = useLanguage();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarShowLabel: false,
        tabBarItemStyle: {
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 56,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 4,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: translations.home,
          tabBarIcon: ({ color, size }) => (
            <Wallet size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="history"
        options={{
          title: translations.history,
          tabBarIcon: ({ color, size }) => (
            <History size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="cards"
        options={{
          title: translations.cards,
          tabBarIcon: ({ color, size }) => (
            <CreditCard size={24} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: translations.profile,
          tabBarIcon: ({ color, size }) => (
            <User size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: translations.settings,
          tabBarIcon: ({ color, size }) => (
            <Settings size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}