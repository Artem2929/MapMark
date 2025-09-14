import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ua: { translation: en },
      es: { translation: en },
      fr: { translation: en },
      de: { translation: en },
      it: { translation: en },
      pt: { translation: en },
      ru: { translation: en },
      ja: { translation: en },
      'zh-CN': { translation: en },
      ar: { translation: en },
      hi: { translation: en }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;