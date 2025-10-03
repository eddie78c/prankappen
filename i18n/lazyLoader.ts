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
       case 'ar': translations = (await import('./ar')).ar; break;
       case 'az': translations = (await import('./az')).az; break;
       case 'bg': translations = (await import('./bg')).bg; break;
       case 'bs': translations = (await import('./bs')).bs; break;
       case 'cnr': translations = (await import('./cnr')).cnr; break;
       case 'cs': translations = (await import('./cs')).cs; break;
       case 'da': translations = (await import('./da')).da; break;
       case 'de': translations = (await import('./de')).de; break;
       case 'el': translations = (await import('./el')).el; break;
       case 'es': translations = (await import('./es')).es; break;
       case 'et': translations = (await import('./et')).et; break;
       case 'fa': translations = (await import('./fa')).fa; break;
       case 'fi': translations = (await import('./fi')).fi; break;
       case 'fr': translations = (await import('./fr')).fr; break;
       case 'ha': translations = (await import('./ha')).ha; break;
       case 'hi': translations = (await import('./hi')).hi; break;
       case 'hr': translations = (await import('./hr')).hr; break;
       case 'hu': translations = (await import('./hu')).hu; break;
       case 'it': translations = (await import('./it')).it; break;
       case 'kk': translations = (await import('./kk')).kk; break;
       case 'lv': translations = (await import('./lv')).lv; break;
       case 'mk': translations = (await import('./mk')).mk; break;
       case 'ms': translations = (await import('./ms')).ms; break;
       case 'nl': translations = (await import('./nl')).nl; break;
       case 'no': translations = (await import('./no')).no; break;
       case 'pl': translations = (await import('./pl')).pl; break;
       case 'pt': translations = (await import('./pt')).pt; break;
       case 'ro': translations = (await import('./ro')).ro; break;
       case 'rom': translations = (await import('./rom')).rom; break;
       case 'ru': translations = (await import('./ru')).ru; break;
       case 'sk': translations = (await import('./sk')).sk; break;
       case 'sl': translations = (await import('./sl')).sl; break;
       case 'sr': translations = (await import('./sr')).sr; break;
       case 'sv': translations = (await import('./sv')).sv; break;
       case 'sw': translations = (await import('./sw')).sw; break;
       case 'tk': translations = (await import('./tk')).tk; break;
       case 'tr': translations = (await import('./tr')).tr; break;
       case 'ur': translations = (await import('./ur')).ur; break;
       case 'uz': translations = (await import('./uz')).uz; break;
       case 'zh': translations = (await import('./zh')).zh; break;
       // Fallback to English for any missing languages
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
