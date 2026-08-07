import useAuthStore from "@/store/useAuthStore";
import { LANGUAGE } from "@/utils/constants";
import { LANGUAGES } from "@/utils/constants/language";
import { Language } from "@/utils/enums";
import { setDataStorage } from "@/utils/storage";
import { LanguageResponse } from "@/utils/types";
import moment from "moment";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import * as RNLocalize from "react-native-localize";
import { isDemoMode, switchDemoDatabase } from "@/demoData/mockInterceptor";

export const useLanguage = () => {
  const { i18n } = useTranslation();
  const { language, setLanguage, setLoading } = useAuthStore();

  const isKorean = language?.code === Language.ko;

  const changeLanguage = useCallback(
    async (languageItem?: LanguageResponse) => {
      if (!languageItem) return;

      try {
        setLoading(true);

        await i18n.changeLanguage(languageItem.code);
        moment.locale(languageItem.momentLangCode);
        await setDataStorage(LANGUAGE, languageItem.code);

        // Demo mode: switch sang database riêng của ngôn ngữ mới, không reset DB cũ.
        try {
          if (await isDemoMode()) {
            await switchDemoDatabase(languageItem.code);
          }
        } catch (_) { /* không crash nếu lỗi switch demo DB */ }

        setLanguage(languageItem);

      } catch (error) {
        console.error("Change language failed:", error);
      } finally {
        setLoading(false);
      }
    },
    [i18n, setLanguage, setLoading]
  );

  const detectDeviceLanguage = () => {
    const locales = RNLocalize.getLocales();

    if (locales.length > 0) {
      const deviceLang = locales[0]?.languageCode;

      const matchedLang =
        LANGUAGES.find((lang) => lang.code === deviceLang) ||
        LANGUAGES.find((lang) =>
          deviceLang?.startsWith(lang.code)
        );

      return matchedLang || LANGUAGES[0];
    }

    return LANGUAGES[0];
  };

  useEffect(() => {
    const initLanguage = async () => {
      if (language?.code) {
        const currentLang = LANGUAGES.find(
          (i) => i.code === language.code
        );

        if (currentLang) {
          await changeLanguage(currentLang);
          return;
        }
      }

      const fallbackLang = detectDeviceLanguage();
      await changeLanguage(fallbackLang);
    };

    initLanguage();
  }, [language?.code, changeLanguage]);

  return { isKorean, changeLanguage };
};
