import useAuthStore from "@/store/useAuthStore";
import { LANGUAGES } from "@/utils/constants/language";
import { Languages } from "@/utils/enums";
import { Language } from "@/utils/types";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAuthStore()
  const [isKorean, setIsKorean] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLang = async () => {
      setIsKorean(language.code === Languages.ko);
    };
    checkLang();
  }, [i18n]);

  const changeLanguage = async(languageItem?: Language) => {
    i18n.changeLanguage(languageItem?.code);
    moment.locale(languageItem?.momentLangCode);
    if(languageItem) setLanguage(languageItem)

  };

  const intiLanguage = async () => {
    const currentLang = LANGUAGES.find((i) => i.code === language.code);
    if (!currentLang) {
      await changeLanguage(LANGUAGES[0]);
    } else {
      await changeLanguage(currentLang);
    }
  };

  useEffect(() => {
    intiLanguage();
  }, []);

  return { isKorean, changeLanguage };
};
