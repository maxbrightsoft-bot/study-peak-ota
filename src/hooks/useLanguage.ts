import useAuthStore from "@/store/useAuthStore";
import { LANGUAGE } from "@/utils/constants";
import { LANGUAGES } from "@/utils/constants/language";
import { Language } from "@/utils/enums";
import { setDataStorage } from "@/utils/storage";
import { LanguageResponse } from "@/utils/types";
import moment from "moment";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage, setLoading } = useAuthStore();
  const isKorean = language.code === Language.ko;

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
    const currentLang = LANGUAGES.find(
      (i) => i.code === language.code
    );

    if (currentLang) {
      changeLanguage(currentLang)
    }
  }, []);

  return { isKorean, changeLanguage };
};
