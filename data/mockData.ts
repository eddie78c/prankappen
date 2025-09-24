// Separate mock data file - not mixed with code
export const mockUserData = {
  balance: 21500.00,
  availableBalance: 2589.50,
  monthlyIncome: 300.90,
  todaySpent: 600.90,
  name: "Maria Smith",
  location: "Stockholm, Sweden",
  cards: [
    {
      id: '1',
      type: 'Physical Card',
      number: '**** **** **** 2864',
      holder: 'Maria Smith',
      expiry: '08/27',
      cvv: '826',
      isActive: true,
      color: '#2E5BFF'
    },
    {
      id: '2',
      type: 'Virtual Card',
      number: '**** **** **** 4521',
      holder: 'Maria Smith',
      expiry: '12/28',
      cvv: '394',
      isActive: false,
      color: '#4A90E2'
    }
  ],
  recentTransactions: [
    {
      id: '1',
      title: 'Grocery',
      description: 'ICA Maxi Stockholm',
      amount: -50.68,
      date: 'Aug 26',
      category: 'food',
      icon: '🛒'
    },
    {
      id: '2',
      title: 'Transport',
      description: 'SL Card Top-up',
      amount: -86.00,
      date: 'Aug 25',
      category: 'transport',
      icon: '🚌'
    },
    {
      id: '3',
      title: 'Salary',
      description: 'Monthly Salary',
      amount: 6500.00,
      date: 'Aug 25',
      category: 'income',
      icon: '💰'
    },
    {
      id: '4',
      title: 'Coffee Shop',
      description: 'Espresso House',
      amount: -45.00,
      date: 'Aug 24',
      category: 'food',
      icon: '☕'
    }
  ],
  budgetCategories: [
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
  ]
};