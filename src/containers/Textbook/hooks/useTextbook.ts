import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { DATE_TIME_FORMAT, DefaultTextbookFilter } from "../configs/constants";

import { FilterValues, PreparedFilterType, PreparedType, TextbookQuery } from "../configs/type";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import moment from "moment";
import { getTextbookListApi, startPageApi, startTextbook } from "../apiClients/textbookService";
import { useFocusEffect } from "@react-navigation/native";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import useAlarm from "@/layouts/hooks/useAlarm";
import { Textbook } from "@/utils/types";
import { FlatList } from "react-native";
import useServerTime from "@/hooks/useServerTime";

type Props = {
  preparedType?: PreparedType
  preparedFilterType?: PreparedFilterType
  search: string
  setSearch: (value: string) => void
  textbookFilter: TextbookQuery
  setTextbookFilter: React.Dispatch<React.SetStateAction<TextbookQuery>>
}

const useTextbook = ({
  preparedType,
  preparedFilterType,
  search,
  setSearch,
  textbookFilter,
  setTextbookFilter
}: Props) => {
   const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const setLoading = useAuthStore(state => state.setLoading)
  const isDemoMode = useAuthStore(state => state.isDemoMode)
  const { t } = useTranslation();
  const [textbookList, setTextbookList] = useState<Textbook[]>([]);
  const inputSearch = useRef<any>(null);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook>()
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false)
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const [isOpenAudioGuide, setOpenAudioGuide] = useState<boolean>(false);
  const [isOpenTimeSelectModal, setOpenTimeSelectModal] = useState<boolean>(false)
  const [targetPage, setTargetPage] = useState<number | undefined>()
  const { handleStartSelectedSubjectAlarm } = useAlarm(false, [], false)
  const scrollViewRef = useRef<FlatList>(null)
  const { getServerNow } = useServerTime()

  const handleOpenAudioGuide = (page?: number) => {
    if (page) setTargetPage(page)
    else setTargetPage(undefined)
    handleCloseDialog()
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

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const onChangeSearch = (value: string) => {
    setSearch(value);
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (inputSearch.current) {
      clearTimeout(inputSearch.current);
    }

    inputSearch.current = setTimeout(() => {
      getTextbookList(search);
    }, 500);

    return () => {
      if (inputSearch.current) {
        clearTimeout(inputSearch.current);
      }
    };
  }, [search]);

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

  const getTextbookList = async (textSearch?: string) => {
    setLoading(true)
    try {
      const { data } = await getTextbookListApi({
        ...textbookFilter,
        preparedType,
        preparedFilterType,
        textSearch
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

  const handleStartAudio = async (textbook: Textbook, minutes?: number, startTime?: number, skipPreAlarm?: boolean) => {
    const subject = textbook.subject || { id: textbook.subjectId, name: textbook.subjectName }
    await handleStartSelectedSubjectAlarm(true, minutes || textbook.limitedTimeInMinutes, subject as any, startTime, skipPreAlarm)
  }

  const handleStartTextbook = async (enable: boolean, textbook: Textbook, minutes?: number, skipPreAlarm?: boolean) => {
    try {
      setLoading(true)
      const serverNow = await getServerNow()

      let startTime: number
      handleCloseAudioGuide()
      if (!textbook.isMock) {
        await startPageApi({ textbookId: textbook.id, startPage: targetPage });
        startTime = moment.utc(serverNow).valueOf()
      } else {
        const res = await startTextbook(textbook.id)
        startTime = moment.utc(res.data).valueOf()
      }
      if (enable) {
        await handleStartAudio(textbook, minutes, startTime, skipPreAlarm)
      }

    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      navigate(Routes.Auth.DoTextbook, { textbookId: selectedTextbook?.id, restart: textbook?.isMock, page: targetPage })
      setLoading(false)
    }
  }

  const handleChangePage = (_: any, page: number) => {
    setTextbookFilter({ ...textbookFilter, currentPage: page });
  };

  const handleChangeFilter = (filter: FilterValues) => {
    let fromDate: string | undefined
    let toDate: string | undefined
    let fromMonths: string[] | undefined
    let toMonths: string[] | undefined

    if (filter.startYear && filter.endYear) {
      fromDate = moment(filter.startYear, "YYYY")
        .startOf("year")
        .utc()
        .format(DATE_TIME_FORMAT)
      toDate = moment(filter.endYear, "YYYY")
        .endOf("year")
        .utc()
        .format(DATE_TIME_FORMAT)
    }

    if (filter.months && filter.months.length > 0) {
      const currentYear = moment().year()
      fromMonths = filter.months.map((month: number) =>
        moment()
          .year(currentYear)
          .month(month - 1)
          .startOf("month")
          .utc()
          .format(DATE_TIME_FORMAT)
      )
      toMonths = filter.months.map((month: number) =>
        moment()
          .year(currentYear)
          .month(month - 1)
          .endOf("month")
          .utc()
          .format(DATE_TIME_FORMAT)
      )
    }

    const { startYear, endYear, months, ...restValues } = filter

    setTextbookFilter(prev => ({
      ...prev,
      ...restValues,
      fromDate,
      toDate,
      fromMonths,
      toMonths,
      currentPage: 1
    }))

    handleCloseFilterModal()
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

  const handleDoTextbook = async (textbook: Textbook) => {
    if (isDemoMode && textbook.isStudying) {
      toast.demoBlocked();
      return;
    }

    if (textbook.isMock) {
      navigate(Routes.Auth.DoTextbook, { textbookId: textbook.id })
    } else {
      handleOpenAudioGuide()
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

  useFocusEffect(
    useCallback(() => {
      getTextbookList(search);

      scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true })

      return () => {
        setSelectedTextbook(undefined);
        handleCloseDialog();
      };
    }, [selectedAcademy?.id, textbookFilter, preparedType, preparedFilterType])
  );

  return {
    t,
    search,
    onChangeSearch,
    selectedTextbook,
    isOpenDialog,
    handleCloseDialog,
    handleOpenDialog,
    openConfirmDialog,
    isOpenAudioGuide,
    scrollViewRef,
    handleOpenAudioGuide,
    handleCloseAudioGuide,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleChangePage,
    openFilterModal,
    textbookFilter,
    handleStartTextbook,
    handleCloseFilterModal,
    handleOpenFilterModal,
    textbookList,
    handleChangeFilter,
    numberToMonth,
    handleDoTextbook,
    handleStartTextbookFromGuideModal,
    isOpenTimeSelectModal,
    handleCloseTimeSelectModal
  };
};

export default useTextbook;

