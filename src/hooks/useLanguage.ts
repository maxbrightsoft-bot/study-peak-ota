import { LANGUAGE } from '@/utils/constants';
import { LANGUAGES } from '@/utils/constants/language';
import { Language } from '@/utils/types';
import moment from 'moment';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';



export const useLanguage = () => {
  const { i18n } = useTranslation()
  
  const changeLanguage = (languageItem?: Language) => {
    i18n.changeLanguage(languageItem?.code)
    moment.locale(languageItem?.momentLangCode)
    localStorage.setItem(LANGUAGE, languageItem?.code || '')
  }

  useEffect(() => {
    const language = localStorage.getItem(LANGUAGE)
    const currentLang = LANGUAGES.find((i) => i.code === language)
    if (!currentLang) {
      changeLanguage(LANGUAGES[0])
    } else {
      changeLanguage(currentLang)
    }
  }, [])


  return { changeLanguage };
};