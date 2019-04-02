import i18n from 'i18next';

i18n.init({
  fallbackLng: 'en',
  debug: false,
  // have a common namespace used around the full app
  ns: ['translations'],
  defaultNS: 'translations',
  keySeparator: '.', // we use content as keys
  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ','
  },
  // react i18next special options (optional)
  react: {
    wait: true,
    defaultTransParent: 'true'
  }
});

export default i18n;
