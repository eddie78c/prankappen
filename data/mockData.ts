// Separate mock data file - not mixed with code
// Note: These are translation keys that will be replaced with actual translations

// Country-specific data based on language
const countryData = {
  sv: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Stockholm, Sweden'
  },
  de: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Berlin, Germany'
  },
  en: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'New York, USA'
  },
  fr: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Paris, France'
  },
  es: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Madrid, Spain'
  },
  it: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Rome, Italy'
  },
  el: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Athens, Greece'
  },
  hu: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Budapest, Hungary'
  },
  ro: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Bucharest, Romania'
  },
  cs: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Prague, Czech Republic'
  },
  fi: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Helsinki, Finland'
  },
  // Default fallback
  default: {
    groceryChain: 'chain1',
    coffeeChain: 'chain2',
    location: 'Stockholm, Sweden'
  }
};

export const getMockUserData = (language: string = 'en', userName?: string) => {
  const data = countryData[language as keyof typeof countryData] || countryData.default;
  const defaultName = userName || "Maria Smith";

  return {
    balance: 21500.00,
    availableBalance: 2589.50,
    monthlyIncome: 300.90,
    todaySpent: 600.90,
    name: defaultName,
    location: data.location,
    cards: [
      {
        id: '1',
        typeKey: 'physicalCard',
        number: '4532 1234 5678 2864',
        holder: defaultName,
        expiry: '08/27',
        cvv: '826',
        isActive: true,
        color: '#2E5BFF'
      },
      {
        id: '2',
        typeKey: 'virtualCard',
        number: '4532 8765 4321 4521',
        holder: defaultName,
        expiry: '12/28',
        cvv: '394',
        isActive: false,
        color: '#4A90E2'
      }
    ],
    recentTransactions: [
      {
        id: '1',
        titleKey: 'grocery',
        descriptionKey: data.groceryChain,
        amount: -50.68,
        date: 'Aug 26',
        category: 'food',
        icon: '🛒'
      },
      {
        id: '2',
        titleKey: 'transport',
        descriptionKey: 'slCardTopUp',
        amount: -86.00,
        date: 'Aug 25',
        category: 'transport',
        icon: '🚌'
      },
      {
        id: '3',
        titleKey: 'salary',
        descriptionKey: 'monthlySalary',
        amount: 6500.00,
        date: 'Aug 25',
        category: 'income',
        icon: '💰'
      },
      {
        id: '4',
        titleKey: 'coffee',
        descriptionKey: data.coffeeChain,
        amount: -45.00,
        date: 'Aug 24',
        category: 'food',
        icon: '☕'
      }
    ],
    budgetCategories: [
      {
        nameKey: 'housing',
        budget: 8000,
        spent: 7200,
        percentage: 90,
        color: '#FF6B6B'
      },
      {
        nameKey: 'food',
        budget: 2000,
        spent: 1200,
        percentage: 60,
        color: '#4ECDC4'
      },
      {
        nameKey: 'transport',
        budget: 1000,
        spent: 650,
        percentage: 65,
        color: '#45B7D1'
      },
      {
        nameKey: 'entertainment',
        budget: 1500,
        spent: 400,
        percentage: 27,
        color: '#96CEB4'
      }
    ]
  };
};

// Backward compatibility
export const mockUserData = getMockUserData();