import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import I18nextBrowserLanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(I18nextBrowserLanguageDetector)
    .use(initReactI18next)
    .init({
       fallbackLng: 'en',
       debug: true,

       interpolation: {
           escapeValue: false,
           formatSeparator: ',',
           format(value, format) {
               if (format === 'uppercase') return value.toUpperCase();
               return value;
           }
       }
    });

export default i18n;
