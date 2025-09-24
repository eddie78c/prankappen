// Separate language files for internationalization
export const languages = {
  en: {
    // Welcome & Auth
    welcome: "Welcome to",
    bankName: "PREMIUM BANK",
    enterPin: "Enter your PIN",
    wrongPin: "Wrong PIN. Try again.",
    
    // Navigation
    home: "Home",
    history: "History", 
    cards: "Cards",
    profile: "Profile",
    more: "More",
    
    // Dashboard
    dashboard: "Dashboard",
    overview: "Overview, look at your balance",
    totalBalance: "Total balance",
    availableBalance: "Available Balance",
    monthlyIncome: "This month Income",
    todaySpent: "Spent today",
    recentTransactions: "Recent Transactions",
    seeAll: "See all",
    
    // Cards
    yourCards: "Your Cards",
    physicalCard: "Physical Card",
    virtualCard: "Virtual Card",
    cardSettings: "Card Settings",
    contactlessPayment: "Contactless Payment",
    onlinePayment: "Online Payment",
    atmWithdraws: "ATM Withdraws",
    
    // Transactions
    today: "TODAY",
    yesterday: "YESTERDAY",
    thisWeek: "THIS WEEK",
    
    // Actions
    send: "Send",
    request: "Request",
    loan: "Loan",
    topup: "Top-up",
    add: "Add",
    
    // Categories
    grocery: "Grocery",
    transport: "Transport",
    salary: "Salary",
    coffee: "Coffee Shop",
    
    // Settings
    settings: "Settings",
    darkMode: "Dark Mode",
    language: "Language",
    notifications: "Notifications",
    security: "Security"
  },
  
  sv: {
    // Welcome & Auth
    welcome: "Välkommen till",
    bankName: "PREMIUM BANK",
    enterPin: "Ange din PIN-kod",
    wrongPin: "Fel PIN-kod. Försök igen.",
    
    // Navigation
    home: "Hem",
    history: "Historik",
    cards: "Kort",
    profile: "Profil", 
    more: "Mer",
    
    // Dashboard
    dashboard: "Översikt",
    overview: "Översikt, kolla ditt saldo",
    totalBalance: "Totalt saldo",
    availableBalance: "Tillgängligt saldo",
    monthlyIncome: "Denna månads inkomst",
    todaySpent: "Spenderat idag",
    recentTransactions: "Senaste transaktioner",
    seeAll: "Se alla",
    
    // Cards
    yourCards: "Dina kort",
    physicalCard: "Fysiskt kort",
    virtualCard: "Virtuellt kort",
    cardSettings: "Kortinställningar",
    contactlessPayment: "Kontaktlös betalning",
    onlinePayment: "Online betalning",
    atmWithdraws: "Bankomatsuttag",
    
    // Transactions
    today: "IDAG",
    yesterday: "IGÅR",
    thisWeek: "DENNA VECKA",
    
    // Actions
    send: "Skicka",
    request: "Begär",
    loan: "Lån",
    topup: "Fyll på",
    add: "Lägg till",
    
    // Categories
    grocery: "Matvaror",
    transport: "Transport",
    salary: "Lön",
    coffee: "Café",
    
    // Settings
    settings: "Inställningar",
    darkMode: "Mörkt tema",
    language: "Språk",
    notifications: "Notifieringar",
    security: "Säkerhet"
  },
  
  de: {
    // Welcome & Auth
    welcome: "Willkommen bei",
    bankName: "PREMIUM BANK",
    enterPin: "PIN eingeben",
    wrongPin: "Falsche PIN. Versuchen Sie es erneut.",
    
    // Navigation
    home: "Start",
    history: "Verlauf",
    cards: "Karten",
    profile: "Profil",
    more: "Mehr",
    
    // Dashboard
    dashboard: "Dashboard",
    overview: "Übersicht, schauen Sie sich Ihr Guthaben an",
    totalBalance: "Gesamtguthaben",
    availableBalance: "Verfügbares Guthaben",
    monthlyIncome: "Einkommen diesen Monat",
    todaySpent: "Heute ausgegeben",
    recentTransactions: "Letzte Transaktionen",
    seeAll: "Alle anzeigen",
    
    // Cards
    yourCards: "Ihre Karten",
    physicalCard: "Physische Karte",
    virtualCard: "Virtuelle Karte",
    cardSettings: "Karteneinstellungen",
    contactlessPayment: "Kontaktlose Zahlung",
    onlinePayment: "Online-Zahlung",
    atmWithdraws: "Geldautomaten-Abhebungen",
    
    // Transactions
    today: "HEUTE",
    yesterday: "GESTERN",
    thisWeek: "DIESE WOCHE",
    
    // Actions
    send: "Senden",
    request: "Anfordern",
    loan: "Darlehen",
    topup: "Aufladen",
    add: "Hinzufügen",
    
    // Categories
    grocery: "Lebensmittel",
    transport: "Transport",
    salary: "Gehalt",
    coffee: "Kaffeehaus",
    
    // Settings
    settings: "Einstellungen",
    darkMode: "Dunkler Modus",
    language: "Sprache",
    notifications: "Benachrichtigungen",
    security: "Sicherheit"
  }
};

export type LanguageCode = keyof typeof languages;
export type Translations = typeof languages.en;