import { LANGUAGE } from "@/utils/constants";
import { LANGUAGES } from "@/utils/constants/language";
import { Languages } from "@/utils/enums";
import { getDataStorage, setDataStorage } from "@/utils/storage";
import { Language } from "@/utils/types";
import moment from "moment";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [isKorean, setIsKorean] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLang = async () => {
      const lang = await getDataStorage(LANGUAGE);
      setIsKorean(lang === Languages.ko);
    };
    checkLang();
  }, [i18n]);

  const changeLanguage = (languageItem?: Language) => {
    i18n.changeLanguage(languageItem?.code);
    moment.locale(languageItem?.momentLangCode);
    setDataStorage(LANGUAGE, languageItem?.code || "");
  };

  const intiLanguage = async () => {
    const language = await getDataStorage(LANGUAGE);
    const currentLang = LANGUAGES.find((i) => i.code === language);
    if (!currentLang) {
      changeLanguage(LANGUAGES[0]);
    } else {
      changeLanguage(currentLang);
    }
  };

  useEffect(() => {
    intiLanguage();
  }, []);

  return { isKorean, changeLanguage };
};
