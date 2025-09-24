import React, { createContext, useContext, useState } from 'react';

interface Transaction {
  id?: string;
  title: string;
  description: string;
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
  profileName: string;
  profileLocation: string;
  profileBalance: number;
  profileMonthlyIncome: number;
  profileTodaySpent: number;
  customSounds: string[];
}

interface PrankContextType {
  settings: PrankSettings;
  updateSettings: (newSettings: Partial<PrankSettings>) => void;
  addCustomSound: (soundUri: string) => void;
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
    defaultAmount: 500,
    currency: 'SEK',
    profileName: 'Maria Smith',
    profileLocation: 'Stockholm, Sweden',
    profileBalance: 21500.00,
    profileMonthlyIncome: 300.90,
    profileTodaySpent: 600.90,
    customSounds: [],
  });

  const [showPrankReveal, setShowPrankReveal] = useState(false);
  const [sendMode, setSendMode] = useState<'send' | 'receive'>('receive');
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      title: 'Grocery',
      description: 'ICA Maxi Stockholm',
      amount: -50.68,
      date: 'Aug 26',
      category: 'food',
      icon: '🛒',
      color: '#FF6B6B'
    },
    {
      id: '2',
      title: 'Transport',
      description: 'SL Card Top-up',
      amount: -86.00,
      date: 'Aug 25',
      category: 'transport',
      icon: '🚌',
      color: '#4ECDC4'
    },
    {
      id: '3',
      title: 'Salary',
      description: 'Monthly Salary',
      amount: 6500.00,
      date: 'Aug 25',
      category: 'income',
      icon: '💰',
      color: '#10B981'
    },
    {
      id: '4',
      title: 'Coffee Shop',
      description: 'Espresso House',
      amount: -45.00,
      date: 'Aug 24',
      category: 'food',
      icon: '☕',
      color: '#FF6B6B'
    }
  ]);

  const updateSettings = (newSettings: Partial<PrankSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const addCustomSound = (soundUri: string) => {
    setSettings(prev => ({ 
      ...prev, 
      customSounds: [...prev.customSounds, soundUri] 
    }));
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