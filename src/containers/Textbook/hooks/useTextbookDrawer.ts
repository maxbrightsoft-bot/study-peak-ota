import { useEffect, useMemo, useState } from "react";
import { TextbookTabList } from "../configs/constants";
import {
  getTextbookByIdApi,
  startPageApi
} from "../apiClients/textbookService";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { ChapterResponse } from "@/utils/types";
import { getErrorMessage, toast } from "@/utils/helpers";
import { Languages } from "@/utils/enums";
import { Textbook } from "../configs/type";
import { Routes } from "@/navigators/RouteName";
import { navigate } from "@/navigators/NavigationHelpers";

type Props = {
  textbookId?: number;
};
const useTextbookDrawer = ({ textbookId }: Props) => {
  const { t } = useTranslation();
  const { language, setLoading } = useAuthStore()
  const isEnglish = language.code === Languages.en;
  const [selected, setSelected] = useState(TextbookTabList[0].value);
  const [textbook, setTextbook] = useState<Textbook>();
  const [isOpenChapterDialog, setOpenChapterDialog] = useState<boolean>(false);
  const [isOpenStartPageDialog, setOpenStartPageDialog] =
    useState<boolean>(false);
  const [chapterSelected, setChapterSelected ] = useState<ChapterResponse>()

  const handleChangeTab = (newValue: number) => {
    setSelected(newValue);
  };

  const handleCloseChapterDialog = () => {
    setOpenChapterDialog(false);
    setChapterSelected(undefined)
  };

  const handleOpenChapterDialog = (chapter: ChapterResponse) => {
    setChapterSelected(chapter)
    setOpenChapterDialog(true);
  };

  const handleCloseStartPageDialog = () => {
    setOpenStartPageDialog(false);
  };

  const handleOpenStartPageDialog = () => {
    setOpenStartPageDialog(true);
  };

  const handleStartFromPage = async (values: { startPage: number }) => {
    if (!textbookId || !values.startPage) return;

    setLoading(false)
    try {
      const { data } = await startPageApi({
        ...values,
        textbookId
      });
      if (data) {
        navigate(Routes.Auth.DoTextbook, { textbookId, page: values?.startPage })
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
  };

  const handleTextbookDetail = async () => {
    setTextbook(undefined);
    setSelected(0)
    if (!textbookId) return;
    setLoading(true)
    try {
      const { data } = await getTextbookByIdApi(textbookId);
      if (data?.data) {
        setTextbook(data?.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
  };

  const startPageOptions = useMemo(() => {
    const arrOptions: { label: string; value: number }[] = [];
    const obj: any = {};
    textbook?.chapters?.map((chapter) => {
      arrOptions.push({
        label: t("page_number", { number: chapter.pageFrom }),
        value: chapter.pageFrom
      });
      if (chapter.subChapters?.length) {
        chapter.subChapters.map((subChapter) => {
          arrOptions.push({
            label: t("page_number", { number: subChapter.pageFrom }),
            value: subChapter.pageFrom
          });
          if(subChapter?.questionGroups?.length) {
            subChapter?.questionGroups.map((questionGroup) => {
              questionGroup.pageFrom && arrOptions.push({
                label: t("page_number", { number: questionGroup.pageFrom }),
                value: questionGroup.pageFrom
              });
            });
          }
        });
      } else if(chapter.questionGroups?.length) {
        chapter.questionGroups.map((questionGroup) => {
          questionGroup.pageFrom && arrOptions.push({
            label: t("page_number", { number: questionGroup.pageFrom }),
            value: questionGroup.pageFrom
          });
        });
      }
    });

    return arrOptions.filter((option) => {
      if (!obj[option.label]) {
        obj[option.label] = 1;
        return true;
      }
      return false;
    });
  }, [JSON.stringify(textbook)]);

  const handleDoTextbook = async ({ textbookId, isStudying }: { textbookId?: number, isStudying: boolean }) => {
    if (!textbookId) return;
    try {
      if (isStudying) {
        navigate(Routes.Auth.DoTextbook, { textbookId })
      } else {
        const { data } = await startPageApi({ textbookId });
        if (data) 
          navigate(Routes.Auth.DoTextbook, { textbookId })
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
  };

  useEffect(() => {
    handleTextbookDetail();
  }, [textbookId]);

  return {
    t, 
    textbook,
    selected,
    isEnglish,
    chapterSelected,
    handleDoTextbook,
    isOpenChapterDialog,
    isOpenStartPageDialog,
    handleChangeTab,
    startPageOptions,
    handleCloseChapterDialog,
    handleOpenChapterDialog,
    handleCloseStartPageDialog,
    handleOpenStartPageDialog,
    handleStartFromPage
  };
};

export default useTextbookDrawer;
