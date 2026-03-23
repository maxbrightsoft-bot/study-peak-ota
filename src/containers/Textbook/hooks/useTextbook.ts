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
import { AlarmType } from "@/utils/enums";
import useAlarm from "@/layouts/hooks/useAlarm";
import { Textbook } from "@/utils/types";
import { FlatList } from "react-native";

type Props = {
  preparedType?: PreparedType
  preparedFilterType?: PreparedFilterType
}

const useTextbook = ({ preparedType, preparedFilterType }: Props) => {
  const { selectedAcademy, setLoading } = useAuthStore()
  const { t } = useTranslation();
  const [textbookList, setTextbookList] = useState<Textbook[]>([]);
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>(
    { ...DefaultTextbookFilter, preparedType, preparedFilterType }
  );
  const [search, setSearch] = useState<string>("");
  const inputSearch = useRef<any>(null);
  const [selectedTextbook, setSelectedTextbook] = useState<Textbook>()
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false)
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);
  const [isOpenAudioGuide, setOpenAudioGuide] =
    useState<boolean>(false);
  const { alarmClockProps: { panelProps: { onStart } } } = useAlarm(false, [], true)
  const scrollViewRef = useRef<FlatList>(null)

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

  const onChangeSearch = (value: string) => {
    setSearch(value);
  };

  useEffect(() => {
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
      console.log({ textbookFilter, textSearch })
      const { data } = await getTextbookListApi({
        ...textbookFilter,
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
      navigate(Routes.Auth.DoTextbook, { textbookId: selectedTextbook?.id, restart: true })
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

  useFocusEffect(
    useCallback(() => {
      getTextbookList();
      // setTextbookFilter({ ...DefaultTextbookFilter, preparedType, preparedFilterType })

      scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true })

      return () => {
        setSelectedTextbook(undefined);
        handleCloseDialog();
      };
    }, [selectedAcademy?.id, textbookFilter])
  );

  useFocusEffect(
    useCallback(() => {
      setTextbookFilter({ ...DefaultTextbookFilter, preparedType, preparedFilterType })
    }, [])
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
    handleStartTextbookFromGuideModal
  };
};

export default useTextbook;
