import useAuthStore from "@/store/useAuthStore";
import { LANGUAGE } from "@/utils/constants";
import { LANGUAGES } from "@/utils/constants/language";
import { Language } from "@/utils/enums";
import { setDataStorage } from "@/utils/storage";
import { LanguageResponse } from "@/utils/types";
import moment from "moment";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as RNLocalize from "react-native-localize";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage, setLoading } = useAuthStore();
  const isKorean = language?.code === Language.ko;

  const changeLanguage = async (languageItem?: LanguageResponse) => {
    if (!languageItem) return;
    setLoading(true)

    await i18n.changeLanguage(languageItem.code);
    moment.locale(languageItem.momentLangCode);
    setLanguage(languageItem);

    await setDataStorage(LANGUAGE, languageItem.code);
    setLoading(false)
  };

  useEffect(() => {
    const initLanguage = () => {
      const currentLang = LANGUAGES.find(
        (i) => i.code === language?.code
      );

      console.log("currentLang", currentLang);

      if (currentLang) {
        changeLanguage(currentLang)
      }
      else {
        const locales = RNLocalize.getLocales();
        if (locales.length > 0) {
          const deviceLang = locales[0].languageCode;

          const matchedLang = LANGUAGES.find(
            (lang) => lang.code === deviceLang
          );

          changeLanguage(matchedLang || LANGUAGES[0]);
        }
      }
    }
    initLanguage();
  }, []);

  return { isKorean, changeLanguage };
};
