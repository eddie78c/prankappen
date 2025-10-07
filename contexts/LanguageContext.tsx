import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import { LanguageCode, Translations, languages } from '../i18n';

interface LanguageContextType {
  currentLanguage: LanguageCode;
  translations: Translations;
  setLanguage: (lang: LanguageCode) => void;
  availableLanguages: { code: LanguageCode; name: string; flag: string }[];
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('en');
  const [translations, setTranslations] = useState<Translations>(({} as any));
  const [isLoading, setIsLoading] = useState(true);

  // RTL languages
  const rtlLanguages: LanguageCode[] = ['ar', 'fa', 'ur'];

  const isRTL = rtlLanguages.includes(currentLanguage);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem('language_preference');
        if (storedLanguage && availableLanguages.some(lang => lang.code === storedLanguage)) {
          setCurrentLanguage(storedLanguage as LanguageCode);
        }
      } catch (error) {
        console.log('Error loading language:', error);
      }
    };

    initializeLanguage();
  }, []);

  useEffect(() => {
    const loadTranslations = () => {
      setIsLoading(true);
      try {
        const loadedTranslations = languages[currentLanguage];
        setTranslations(loadedTranslations);
      } catch (error) {
        console.error('Error loading translations:', error);
        // Fallback to English
        setTranslations(languages.en);
      } finally {
        setIsLoading(false);
      }
    };

    loadTranslations();
  }, [currentLanguage]);

  const availableLanguages = [
    { code: 'en' as LanguageCode, name: 'English', flag: '🇺🇸' },
    { code: 'ar' as LanguageCode, name: 'العربية', flag: '🇸🇦' },
    { code: 'az' as LanguageCode, name: 'Azərbaycan', flag: '🇦🇿' },
    { code: 'bg' as LanguageCode, name: 'Български', flag: '🇧🇬' },
    { code: 'bs' as LanguageCode, name: 'Bosanski', flag: '🇧🇦' },
    { code: 'cnr' as LanguageCode, name: 'Crnogorski', flag: '🇲🇪' },
    { code: 'cs' as LanguageCode, name: 'Čeština', flag: '🇨🇿' },
    { code: 'da' as LanguageCode, name: 'Dansk', flag: '🇩🇰' },
    { code: 'de' as LanguageCode, name: 'Deutsch', flag: '🇩🇪' },
    { code: 'el' as LanguageCode, name: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'es' as LanguageCode, name: 'Español', flag: '🇪🇸' },
    { code: 'et' as LanguageCode, name: 'Eesti', flag: '🇪🇪' },
    { code: 'fa' as LanguageCode, name: 'فارسی', flag: '🇮🇷' },
    { code: 'fi' as LanguageCode, name: 'Suomi', flag: '🇫🇮' },
    { code: 'fr' as LanguageCode, name: 'Français', flag: '🇫🇷' },
    { code: 'ha' as LanguageCode, name: 'Hausa', flag: '🇳🇬' },
    { code: 'hi' as LanguageCode, name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'hr' as LanguageCode, name: 'Hrvatski', flag: '🇭🇷' },
    { code: 'hu' as LanguageCode, name: 'Magyar', flag: '🇭🇺' },
    { code: 'it' as LanguageCode, name: 'Italiano', flag: '🇮🇹' },
    { code: 'kk' as LanguageCode, name: 'Қазақша', flag: '🇰🇿' },
    { code: 'lv' as LanguageCode, name: 'Latviešu', flag: '🇱🇻' },
    { code: 'mk' as LanguageCode, name: 'Македонски', flag: '🇲🇰' },
    { code: 'ms' as LanguageCode, name: 'Bahasa Melayu', flag: '🇲🇾' },
    { code: 'nl' as LanguageCode, name: 'Nederlands', flag: '🇳🇱' },
    { code: 'no' as LanguageCode, name: 'Norsk', flag: '🇳🇴' },
    { code: 'pl' as LanguageCode, name: 'Polski', flag: '🇵🇱' },
    { code: 'pt' as LanguageCode, name: 'Português', flag: '🇵🇹' },
    { code: 'ro' as LanguageCode, name: 'Română', flag: '🇷🇴' },
    { code: 'rom' as LanguageCode, name: 'Romani', flag: '🇷🇴' },
    { code: 'ru' as LanguageCode, name: 'Русский', flag: '🇷🇺' },
    { code: 'sk' as LanguageCode, name: 'Slovenčina', flag: '🇸🇰' },
    { code: 'sl' as LanguageCode, name: 'Slovenščina', flag: '🇸🇮' },
    { code: 'sr' as LanguageCode, name: 'Српски', flag: '🇷🇸' },
    { code: 'sv' as LanguageCode, name: 'Svenska', flag: '🇸🇪' },
    { code: 'sw' as LanguageCode, name: 'Kiswahili', flag: '🇹🇿' },
    { code: 'tk' as LanguageCode, name: 'Türkmençe', flag: '🇹🇲' },
    { code: 'tr' as LanguageCode, name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ur' as LanguageCode, name: 'اردو', flag: '🇵🇰' },
    { code: 'uz' as LanguageCode, name: 'Oʻzbekcha', flag: '🇺🇿' },
    { code: 'zh' as LanguageCode, name: '中文', flag: '🇨🇳' },
  ];

  const setLanguage = async (lang: LanguageCode) => {
    const wasRTL = rtlLanguages.includes(currentLanguage);
    const willBeRTL = rtlLanguages.includes(lang);

    setCurrentLanguage(lang);

    // Handle RTL layout changes
    if (wasRTL !== willBeRTL) {
      I18nManager.forceRTL(willBeRTL);
      // Note: In a real app, you might need to restart the app for RTL changes to take effect
      // For now, we'll just update the layout direction
    }

    try {
      await AsyncStorage.setItem('language_preference', lang);
    } catch (error) {
      console.log('Error saving language:', error);
    }
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      translations,
      setLanguage,
      availableLanguages,
      isRTL
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