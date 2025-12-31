import { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';
import { translations, TranslationKey } from '../lib/translations';
import { TranslationObject } from '../types';

export const useTranslation = () => {
  const { language } = useContext(LanguageContext);

  const t = (key: TranslationKey | TranslationObject): string => {
    // Handle TranslationObject for dynamic content (e.g., blog posts)
    if (typeof key === 'object' && key !== null && 'ar' in key && 'en' in key) {
      return key[language];
    }

    // Handle TranslationKey (string) for static UI text
    if (typeof key === 'string') {
      const keys = key.split('.');
      let result: any = translations[language];
      for (const k of keys) {
        // Safe navigation through the translation object
        if (result && typeof result === 'object' && k in result) {
          result = result[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return the key itself as a fallback
        }
      }
      
      // Ensure the final resolved value is a string
      if (typeof result === 'string') {
        return result;
      }
    }

    // Fallback if the key is not a string or a valid TranslationObject
    const fallbackKey = typeof key === 'string' ? key : JSON.stringify(key);
    console.warn(`Invalid argument passed to translation function: ${fallbackKey}`);
    return typeof key === 'string' ? key : '';
  };

  return { t, language };
};
