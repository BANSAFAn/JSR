import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translations
import enTranslation from '../public/locales/en.json';
import ruTranslation from '../public/locales/ru.json';

const resources = {
  en: {
    translation: enTranslation
  },
  ru: {
    translation: ruTranslation
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // Default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;