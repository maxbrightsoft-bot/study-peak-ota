import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { DefaultTextbookFilter } from "../configs/constants";
import { PreparedFilterType, PreparedType, TextbookQuery } from "../configs/type";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import moment from "moment";
import { Textbook } from "@/utils/types";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import useAlarm from "@/layouts/hooks/useAlarm";
import useServerTime from "@/hooks/useServerTime";
import { getTextbookListApi, startPageApi } from "../apiClients/textbookService";
import { startTextbook } from "@/containers/Textbook/apiClients/textbookService";
import { useFocusEffect } from "@react-navigation/native";

const sortByMock = (items: Textbook[]) =>
  [...items].sort((a, b) => (b.isMock ? 1 : 0) - (a.isMock ? 1 : 0));

const fetchWithFallback = async (primaryFilter: TextbookQuery) => {
  const primary = await getTextbookListApi(primaryFilter);
  const primaryItems: Textbook[] = primary.data?.items ?? [];

  if (primaryItems.length > 0) {
    return { items: primaryItems, isFallback: false };
  }

  const fallback = await getTextbookListApi({
    ...primaryFilter,
    preparedFilterType: undefined,
    preparedType: undefined,
  });

  return {
    items: fallback.data?.items ?? [],
    isFallback: true,
  };
};

const useRecentTextbook = () => {
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const setLoading = useAuthStore(state => state.setLoading)
  const isDemoMode = useAuthStore(state => state.isDemoMode)
  const { t } = useTranslation();
  const textSearchRef = useRef<HTMLInputElement>(null);
  const [textbookList, setTextbookList] = useState<Textbook[]>([]);
  const [isRecentEmpty, setIsRecentEmpty] = useState(false);
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>({
    ...DefaultTextbookFilter,
    preparedFilterType: PreparedFilterType.recently_solved_questions,
  });
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook>()
  const [isOpenAudioGuide, setOpenAudioGuide] = useState<boolean>(false);
  const [isOpenTimeSelectModal, setOpenTimeSelectModal] = useState<boolean>(false)
  const { handleStartSelectedSubjectAlarm } = useAlarm(false, [], false)
  const { getServerNow } = useServerTime()
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);

  const handleOpenAudioGuide = (textbook: Textbook) => {
    setSelectedTextbook(textbook)
    setOpenAudioGuide(true)
  }

  const handleCloseAudioGuide = () => {
    setOpenAudioGuide(false)
  }

  const handleOpenTimeSelectModal = () => {
    setOpenTimeSelectModal(true)
  }

  const handleCloseTimeSelectModal = () => {
    setOpenTimeSelectModal(false)
  }


  const handleCloseConfirmDialog = () => setOpenConfirmDialog(false);
  const handleOpenConfirmDialog = () => setOpenConfirmDialog(true);

  const getTextbookList = async (preparedType?: PreparedType) => {
    setLoading(true);
    try {
      const { items, isFallback } = await fetchWithFallback({
        ...textbookFilter,
        textSearch: textSearchRef.current?.value,
        preparedType,
      });

      setTextbookList(sortByMock(items));
      setIsRecentEmpty(isFallback);

      if (items.length === 0 && textbookFilter.currentPage > 1) {
        setTextbookFilter((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1,
        }));
      }
    } catch (error: any) {
      setTextbookList([]);
      setIsRecentEmpty(false);
      toast.error(getErrorMessage(t, error));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (_: any, page: number) => {
    setTextbookFilter((prev) => ({ ...prev, currentPage: page }));
  };

  const handleStartAudio = async (enable: boolean, textbook: Textbook, minutes?: number, startTime?: number, skipPreAlarm?: boolean) => {
    const subject = textbook.subject || { id: textbook.subjectId, name: textbook.subjectName }
    await handleStartSelectedSubjectAlarm(enable, minutes || textbook.limitedTimeInMinutes, subject as any, startTime, skipPreAlarm)
  }

  const handleStartTextbook = async (enable: boolean, textbook: Textbook, minutes?: number, skipPreAlarm?: boolean) => {
    try {
      setLoading(true)
      const serverNow = await getServerNow()

      let startTime: number
      handleCloseAudioGuide()
      if (!textbook.isMock) {
        await startPageApi({ textbookId: textbook.id });
        startTime = moment.utc(serverNow).valueOf()
      } else {
        const res = await startTextbook(textbook.id)
        startTime = moment.utc(res.data).valueOf()
      }
      if (!textbook.isMock) {
        await handleStartAudio(enable, textbook, minutes, startTime, skipPreAlarm)
      }

    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: textbook?.id, restart: textbook?.isMock })
      setLoading(false)
    }
  }

  const handleDoTextbook = async (textbook: Textbook) => {
    if (isDemoMode && textbook.isStudying) {
      toast.demoBlocked();
      return;
    }

    if (textbook.isMock) {
      navigate(Routes.Auth.DoTextbook, { textbookId: textbook.id });
    } else {
      handleOpenAudioGuide(textbook)
    }
  };

  const handleStartTextbookFromGuideModal = (enable: boolean) => {
    if (!selectedTextbook) return
    if (!selectedTextbook.isMock) {
      handleCloseAudioGuide()
      enable ? handleOpenTimeSelectModal() : handleStartTextbook(false, selectedTextbook, undefined, true)
    } else {
      handleStartTextbook(enable, selectedTextbook)
    }
  }


  const handleGoToTextbookList = () => {
    navigate(Routes.Auth.Textbook);
  };

  const numberToMonth = (number: number) => {
    if (number < 1 || number > 12) return;
    return moment()
      .month(number - 1)
      .format(t("month_format"));
  };

  useFocusEffect(
    useCallback(() => {
      getTextbookList();
    }, [selectedAcademy?.id])
  );

  return {
    t,
    textbookList: textbookList.slice(0, 3),
    isRecentEmpty,
    openConfirmDialog,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleGoToTextbookList,
    numberToMonth,
    textSearchRef,
    handleDoTextbook,
    isOpenAudioGuide,
    handleCloseAudioGuide,
    selectedTextbook,
    handleStartTextbookFromGuideModal,
    isOpenTimeSelectModal,
    handleCloseTimeSelectModal,
    handleStartTextbook
  };
};

export default useRecentTextbook;