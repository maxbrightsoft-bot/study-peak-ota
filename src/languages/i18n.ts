import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './lang_en.json';
import ko from './lang_ko.json';
import 'moment/locale/ko'
import 'moment/locale/en-gb'

const resources = {
  en: {
    translation: en,
  },
  ko: {
    translation: ko,
  },
}

i18n.use(initReactI18next)
    .init({
    resources,
    lng: "ko",
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;