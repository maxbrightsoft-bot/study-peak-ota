import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './lang_en.json';
import ko from './lang_ko.json';
import vi from './lang_vi.json';
import 'moment/locale/ko'
import 'moment/locale/en-gb'
import 'moment/locale/vi'

const resources = {
  en: {
    translation: en,
  },
  ko: {
    translation: ko,
  },
  vi: {
    translation: vi,
  },
}

i18n.use(initReactI18next)
    .init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;