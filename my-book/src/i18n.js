import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next);

// Only use the Backend plugin in a browser environment
if (typeof window !== 'undefined') {
  i18n.use(Backend);
}
i18n.init({
    fallbackLng: 'en',
    debug: true,
    supportedLngs: ['en', 'ur'],
    nonExplicitSupportedLngs: true,
    interpolation: {
      escapeValue: false, // React already safes from xss
    },
    backend: {
      // Ensure this path is correctly served by your static file server (e.g., Docusaurus's dev server)
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
  });

export default i18n;