import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en/translation.json';
import arTranslations from './locales/ar/translation.json';

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
};

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass i18n down to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Use English if detected language is not available
    debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
    detection: {
      // Order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // Keys or params to lookup language from
      caches: ['localStorage'], // Cache found language in localStorage
    },
    // Basic configuration for react-i18next
    // For example, you can set defaultNS or other options here
    // react: {
    //   useSuspense: true, // Set to false if you don't want to use Suspense
    // }
  });

// Function to get the text direction for a given language
export const getDirection = (lng) => {
  if (lng === 'ar') {
    return 'rtl';
  }
  return 'ltr';
};

// Listen for language changes to update document direction
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  document.documentElement.dir = getDirection(lng);
});


export default i18n;
