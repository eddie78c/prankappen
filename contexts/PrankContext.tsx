import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Transaction {
  id?: string;
  titleKey?: string;
  title?: string;
  description?: string;
  descriptionKey?: string;
  amount: number;
  date: string;
  category: string;
  icon: string;
  color: string;
}

interface PrankSettings {
  receiverName: string;
  receiverPhoto?: string;
  defaultAmount: number;
  currency: string;
  requestSound?: string;
  laughterSound?: string;
  profileLocation: string;
  profileBalance: number;
  profileMonthlyIncome: number;
  profileTodaySpent: number;
  customSounds: string[];
  pin?: string | null;
  notificationsEnabled?: boolean;
}

interface PrankContextType {
  settings: PrankSettings;
  updateSettings: (newSettings: Partial<PrankSettings>) => void;
  addCustomSound: (soundUri: string, index?: number) => void;
  removeCustomSound: (index: number) => void;
  showPrankReveal: boolean;
  setShowPrankReveal: (show: boolean) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  sendMode: 'send' | 'receive';
  setSendMode: (mode: 'send' | 'receive') => void;
  deleteTransaction: (transactionId: string) => void;
  updateMonthlyIncome: (amount: number) => void;
}

const PrankContext = createContext<PrankContextType | undefined>(undefined);

export function PrankProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrankSettings>({
    receiverName: 'John Doe',
    defaultAmount: 10,
    currency: 'EUR', // Default to EUR for all languages
    profileLocation: 'Stockholm, Sweden',
    profileBalance: 21500.00,
    profileMonthlyIncome: 300.90,
    profileTodaySpent: 600.90,
    customSounds: [],
    notificationsEnabled: false,
  });

  // Load settings from AsyncStorage on initialization
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('prank_settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings(prev => ({ ...prev, ...parsedSettings }));
        }
      } catch (error) {
        console.log('Error loading prank settings:', error);
      }
    };

    loadSettings();
  }, []);

  const [showPrankReveal, setShowPrankReveal] = useState(false);
  const [sendMode, setSendMode] = useState<'send' | 'receive'>('receive');
  const formatDate = (d: Date) => d.toLocaleString('en-US', { month: 'short', day: 'numeric' });
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      titleKey: 'grocery',
      descriptionKey: 'mainGroceryStore',
      amount: -50.68,
      date: formatDate(daysAgo(0)),
      category: 'food',
      icon: 'basket',
      color: '#FF6B6B'
    },
    {
      id: '2',
      titleKey: 'transport',
      descriptionKey: 'slCardTopUp',
      amount: -86.00,
      date: formatDate(daysAgo(1)),
      category: 'transport',
      icon: 'car',
      color: '#4ECDC4'
    },
    {
      id: '3',
      titleKey: 'salary',
      descriptionKey: 'monthlySalary',
      amount: 6500.00,
      date: formatDate(daysAgo(1)),
      category: 'income',
      icon: 'cash',
      color: '#10B981'
    },
    {
      id: '4',
      titleKey: 'coffee',
      descriptionKey: 'espressoHouse',
      amount: -45.00,
      date: formatDate(daysAgo(2)),
      category: 'food',
      icon: 'cafe',
      color: '#FF6B6B'
    }
  ]);

  const updateSettings = async (newSettings: Partial<PrankSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      await AsyncStorage.setItem('prank_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.log('Error saving prank settings:', error);
    }
  };

  const addCustomSound = async (soundUri: string, index?: number) => {
    let updatedSounds;
    if (index !== undefined && index >= 0 && index < settings.customSounds.length) {
      updatedSounds = [...settings.customSounds];
      updatedSounds[index] = soundUri;
    } else {
      updatedSounds = [...settings.customSounds, soundUri];
    }
    const updatedSettings = {
      ...settings,
      customSounds: updatedSounds
    };
    setSettings(updatedSettings);

    try {
      await AsyncStorage.setItem('prank_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.log('Error saving custom sound:', error);
    }
  };

  const removeCustomSound = async (index: number) => {
    const updatedSettings = {
      ...settings,
      customSounds: settings.customSounds.filter((_, i) => i !== index)
    };
    setSettings(updatedSettings);

    try {
      await AsyncStorage.setItem('prank_settings', JSON.stringify(updatedSettings));
    } catch (error) {
      console.log('Error removing custom sound:', error);
    }
  };

  const updateMonthlyIncome = (amount: number) => {
    setSettings(prev => ({ 
      ...prev, 
      profileMonthlyIncome: prev.profileMonthlyIncome + amount 
    }));
  };

  const addTransaction = (transaction: Transaction) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (transactionId: string) => {
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  return (
    <PrankContext.Provider value={{
      settings,
      updateSettings,
      addCustomSound,
      removeCustomSound,
      showPrankReveal,
      setShowPrankReveal,
      transactions,
      addTransaction,
      sendMode,
      setSendMode,
      deleteTransaction,
      updateMonthlyIncome
    }}>
      {children}
    </PrankContext.Provider>
  );
}

export function usePrank() {
  const context = useContext(PrankContext);
  if (context === undefined) {
    throw new Error('usePrank must be used within a PrankProvider');
  }
  return context;
}