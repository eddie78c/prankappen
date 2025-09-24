import React, { createContext, useContext, useState } from 'react';
import { languages, LanguageCode, Translations } from '../localization/languages';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  translations: Translations;
  setLanguage: (lang: LanguageCode) => void;
  availableLanguages: { code: LanguageCode; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');

  const availableLanguages = [
    { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
    { code: 'sv' as LanguageCode, name: 'Svenska', flag: '🇸🇪' },
    { code: 'de' as LanguageCode, name: 'Deutsch', flag: '🇩🇪' }
  ];

  const setLanguage = (lang: LanguageCode) => {
    setCurrentLanguage(lang);
  };

  const translations = languages[currentLanguage];

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      translations,
      setLanguage,
      availableLanguages
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}