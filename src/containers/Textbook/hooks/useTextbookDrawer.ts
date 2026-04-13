import { useEffect, useMemo, useState } from "react";
import { TextbookTabList } from "../configs/constants";
import {
  getTextbookByIdApi,
  restartTextbookApi,
  startPageApi
} from "../apiClients/textbookService";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { ChapterResponse, RestartTextbookRequest, Textbook } from "@/utils/types";
import { getErrorMessage, toast } from "@/utils/helpers";
import { Routes } from "@/navigators/RouteName";
import { navigate } from "@/navigators/NavigationHelpers";
import { ExamStatus, Language } from "@/utils/enums";
import { removeDataStorage } from "@/utils/storage";
import { TOAST_EXAM_STATUS } from "@/utils/constants";
import useTab from "@/hooks/useTab";

type Props = {
  textbookId?: number;
  studentId?: number;
  onOpenAudioGuide?: () => void;
  onClose?: () => void;
};

const useTextbookDrawer = ({
  textbookId,
  onOpenAudioGuide,
  onClose
}: Props) => {
  const { t } = useTranslation();
  const { language, setLoading: setLoadingGlobal } = useAuthStore();
  const isEnglish = language?.code === Language.en;
  const [loading, setLoading] = useState(false)
  const { selected, handleChangeTab } = useTab(TextbookTabList)
  const [textbook, setTextbook] = useState<Textbook>();
  const [isOpenChapterDialog, setOpenChapterDialog] = useState<boolean>(false);
  const [isOpenStartPageDialog, setOpenStartPageDialog] = useState<boolean>(false);
  const [chapterSelected, setChapterSelected] = useState<ChapterResponse>();
  const [isOpenConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false);
  const [openRestartTextbookDialog, setOpenRestartTextbookDialog] = useState(false);
  const [restartTextbookData, setRestartTextbookData] = useState<RestartTextbookRequest>({});

  const handleCloseRestartTextbookDialog = () => {
    setOpenRestartTextbookDialog(false);
  };

  const handleOpenRestartTextbookDialog = () => {
    setOpenRestartTextbookDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false);
  };

  const handleOpenConfirmDialog = (data?: RestartTextbookRequest) => {
    data && setRestartTextbookData(data);
    setTimeout(() => {
      setOpenConfirmDialog(true);
    }, 50);
  };

  const handleCloseChapterDialog = () => {
    setOpenChapterDialog(false);
    setChapterSelected(undefined);
  };

  const handleOpenChapterDialog = (chapter: ChapterResponse) => {
    setChapterSelected(chapter);
    setOpenChapterDialog(true);
  };

  const handleCloseStartPageDialog = () => {
    setOpenStartPageDialog(false);
  };

  const handleOpenStartPageDialog = () => {
    setOpenStartPageDialog(true);
  };

  const handleRedirectEdit = () => {
    if (!textbookId) return;
  };

  const handleStartFromPage = async (values: { startPage: number }) => {
    if (!textbookId || !values.startPage) return;

    setLoading(true);
    try {
      const { data } = await startPageApi({
        ...values,
        textbookId
      });
      if (data) {
        navigate(Routes.Auth.DoTextbook, {
          textbookId,
          page: values.startPage
        });
        onClose?.();
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false);
  };

  const handleTextbookDetail = async () => {
    setTextbook(undefined);
    handleChangeTab(0);

    if (!textbookId) return;

    setLoadingGlobal(true);
    try {
      const { data } = await getTextbookByIdApi(
        textbookId,
      );
      if (data?.data) {
        setTextbook(data.data);
      }
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingGlobal(false);
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

          if (subChapter?.questionGroups?.length) {
            subChapter.questionGroups.map((questionGroup) => {
              questionGroup.pageFrom && arrOptions.push({
                label: t("page_number", { number: questionGroup.pageFrom }),
                value: questionGroup.pageFrom
              });
            });
          }
        });
      } else if (chapter.questionGroups?.length) {
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
  }, [textbook?.chapters, t]);

  const handleDoTextbook = async () => {
    if (!textbook || !textbookId) return;

    try {
      if (textbook.isStudying) {
        navigate(Routes.Auth.DoTextbook, { textbookId });
      } else if (!textbook.isMock) {
        const { data } = await startPageApi({ textbookId });
        if (data) {
          navigate(Routes.Auth.DoTextbook, { textbookId });
        }
      } else {
        setTimeout(() => {
          onOpenAudioGuide?.();
        }, 200);
      }
      onClose?.();
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
  };

  const handleRestartMockTextbook = async () => {
    if (!textbookId) return;

    try {
      await removeDataStorage(TOAST_EXAM_STATUS);
      onOpenAudioGuide?.();
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      onClose?.();
    }
  };

  const handleRestartTextbook = async () => {
    if (!textbook || !textbookId) return;

    setLoading(true);
    try {
      const req: RestartTextbookRequest = {
        rowVersion: textbook.rowVersion,
        startPage: restartTextbookData?.startPage,
        endPage: restartTextbookData?.endPage
      };

      await restartTextbookApi(Number(textbook.id) || textbookId, req);

      navigate(Routes.Auth.DoTextbook, {
        textbookId,
        restart: true
      });
      onClose?.();
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      setLoading(false);
      handleCloseConfirmDialog();
    }
  };

  const handleRestartFromPage = async (values: RestartTextbookRequest) => {
    if (!textbook || !textbookId) return;

    if (textbook.isMock) {
      handleRestartMockTextbook();
    } else {
      setRestartTextbookData(values);
      handleOpenConfirmDialog(values);
    }
  };

  useEffect(() => {
    handleTextbookDetail();
  }, [textbookId]);

  useEffect(() => {
    if (!textbookId) {
      handleCloseConfirmDialog();
    }
  }, [textbookId]);

  return {
    t,
    loading,
    textbook,
    selected,
    isEnglish,
    chapterSelected,
    startPageOptions,
    isOpenChapterDialog,
    isOpenStartPageDialog,
    isOpenConfirmDialog,
    openRestartTextbookDialog,
    restartTextbookData,
    handleChangeTab,
    handleCloseChapterDialog,
    handleOpenChapterDialog,
    handleCloseStartPageDialog,
    handleOpenStartPageDialog,
    handleCloseConfirmDialog,
    handleOpenConfirmDialog,
    handleCloseRestartTextbookDialog,
    handleOpenRestartTextbookDialog,
    handleDoTextbook,
    handleStartFromPage,
    handleRestartTextbook,
    handleRestartMockTextbook,
    handleRestartFromPage,
    handleRedirectEdit,
    isDone: textbook?.status === ExamStatus.Completed,
    isMockTextbook: textbook?.isMock,
    isStudying: textbook?.isStudying
  };
};

export default useTextbookDrawer;