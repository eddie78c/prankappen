// Lazy loading language implementation
import { LanguageCode, Translations } from './index';

// Cache for loaded translations
const translationCache: Partial<Record<LanguageCode, Translations>> = {};

// Lazy load function
export const loadLanguage = async (lang: LanguageCode): Promise<Translations> => {
  if (translationCache[lang]) {
    return translationCache[lang]!;
  }

  try {
    let translations: Translations;

    switch (lang) {
      case 'en': translations = (await import('./en')).en; break;
      case 'sv': translations = (await import('./sv')).sv; break;
      case 'de': translations = (await import('./de')).de; break;
      case 'fr': translations = (await import('./fr')).fr; break;
      case 'es': translations = (await import('./es')).es; break;
      case 'it': translations = (await import('./it')).it; break;
      case 'ar': translations = (await import('./ar')).ar; break;
      case 'nl': translations = (await import('./nl')).nl; break;
      case 'ru': translations = (await import('./ru')).ru; break;
      case 'pt': translations = (await import('./pt')).pt; break;
      case 'zh': translations = (await import('./zh')).zh; break;
      case 'bs': translations = (await import('./bs')).bs; break;
      case 'sr': translations = (await import('./sr')).sr; break;
      case 'hr': translations = (await import('./hr')).hr; break;
      // Load essential languages, others fall back to English
      default: translations = (await import('./en')).en; break;
    }

    translationCache[lang] = translations;
    return translations;
  } catch (error) {
    console.warn(`Failed to load ${lang}, using English fallback`);
    return (await import('./en')).en;
  }
};

// Pre-load essential languages
export const preloadEssentialLanguages = async () => {
  const essentialLangs: LanguageCode[] = ['en', 'sv', 'de', 'ar', 'bs', 'sr', 'hr'];
  await Promise.all(essentialLangs.map(lang => loadLanguage(lang)));
};
