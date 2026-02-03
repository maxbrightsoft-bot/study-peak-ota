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
import { getTextbookListApi, startPageApi, startTextbook } from "../apiClients/textbookService";
import { useFocusEffect } from "@react-navigation/native";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { AlarmType } from "@/utils/enums";
import useAlarm from "@/layouts/hooks/useAlarm";
import { Textbook } from "@/utils/types";


type Props = {
  preparedType?: PreparedType
  preparedFilterType?: PreparedFilterType
}

const useTextbook = ({ preparedType, preparedFilterType }: Props) => {
  const { selectedAcademy, setLoading } = useAuthStore()
  const { t } = useTranslation();
  const textSearchRef = useRef<HTMLInputElement>(null);
  const [textbookList, setTextbookList] = useState<Textbook[]>([]);
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>(
    { ...DefaultTextbookFilter, preparedType, preparedFilterType }
  );
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook>()
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false)
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const [isOpenAudioGuide, setOpenAudioGuide] =
    useState<boolean>(false);
  const { alarmClockProps: { panelProps: { onStart } } } = useAlarm(false, [], true)

  const handleOpenAudioGuide = () => {
    handleCloseDialog()
    setOpenAudioGuide(true)
  }
  const handleCloseAudioGuide = () => {
    setOpenAudioGuide(false)
  }

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = (textbook: Textbook) => {
    if (textbook) setSelectedTextbook(textbook)
    setOpenDialog(true);
  };

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false)
  }

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true)
  }

  const handleCloseFilterModal = () => {
    setOpenFilterModal(false)
  }

  const handleOpenFilterModal = () => {
    setOpenFilterModal(true)
  }

  const getTextbookList = async () => {
    setLoading(true)
    try {
      const { data } = await getTextbookListApi({
        ...textbookFilter,
        textSearch: textSearchRef.current?.value
      });

      const { items = [] } = data;
      setTextbookList(items);
      if (items.length === 0 && textbookFilter.currentPage > 1) {
        setTextbookFilter((prev) => ({
          ...prev,
          currentPage: prev.currentPage - 1
        }));
      }
    } catch (error: any) {
      setTextbookList([]);
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false)
  };

  const handleStartAudio = async (textbook: Textbook) => {
    onStart(AlarmType.Subject, textbook.limitedTimeInMinutes, textbook.subject as any, true)
  }

  const handleStartTextbook = async (enable: boolean, textbook: Textbook) => {
    try {
      setLoading(true)
      await startTextbook(textbook.id)
      if (enable)
        await handleStartAudio(textbook)
      handleCloseAudioGuide()
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: selectedTextbook?.id, restart: true  })
      setLoading(false)
    }
  }

  const handleChangePage = (_: any, page: number) => {
    setTextbookFilter({ ...textbookFilter, currentPage: page });
  };

  const handleStartTextbookFromGuideModal = (enable: boolean) => {
    if(!selectedTextbook ) return
    handleStartTextbook(enable, selectedTextbook)
  }

  const handleDoTextbook = async (textbookId: number) => {
    try {
      const { data } = await startPageApi({ textbookId });
      if (data) navigate(Routes.Auth.DoTextbook, { textbookId })
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
  };

  const numberToMonth = (number: number) => {
    if (number < 1 || number > 12) {
      return;
    }
    return moment()
      .month(number - 1)
      .format(t("month_format"));
  };

  useEffect(() => {
    getTextbookList();
  }, [selectedAcademy?.id]);

  useFocusEffect(
    useCallback(() => {
      getTextbookList()
      return () => {
        setSelectedTextbook(undefined);
        handleCloseDialog()
      };
    }, [])
  );

  return {
    t,
    selectedTextbook,
    isOpenDialog,
    handleCloseDialog,
    handleOpenDialog,
    openConfirmDialog,
    isOpenAudioGuide,
    handleOpenAudioGuide,
    handleCloseAudioGuide,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleChangePage,
    openFilterModal,
    handleStartTextbook,
    handleCloseFilterModal,
    handleOpenFilterModal,
    textbookList,
    numberToMonth,
    textSearchRef,
    handleDoTextbook,
    handleStartTextbookFromGuideModal
  };
};

export default useTextbook;
