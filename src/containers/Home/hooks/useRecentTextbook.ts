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
import { getTextbookListApi, startPageApi } from "../apiClients/textbookService";
import { useFocusEffect } from "@react-navigation/native";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";


const useRecentTextbook = () => {
  const { selectedAcademy, setLoading } = useAuthStore()
  const { t } = useTranslation();
  const textSearchRef = useRef<HTMLInputElement>(null);
  const [textbookList, setTextbookList] = useState<Textbook[]>([]);
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>(
    { ...DefaultTextbookFilter, preparedFilterType: PreparedFilterType.recently_solved_questions }
  );
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false)

  const handleCloseConfirmDialog = () => {
    setOpenConfirmDialog(false)
  }

  const handleOpenConfirmDialog = () => {
    setOpenConfirmDialog(true)
  }

  const getTextbookList = async () => {
    setLoading(true)
    try {
      const { data } = await getTextbookListApi({
        ...textbookFilter,
        textSearch: textSearchRef.current?.value
      });

      const { items = [] } = data;

      const textFilters = items.sort((a: Textbook, b: Textbook) => (b.isMock ? 1 : 0) - (a.isMock ? 1 : 0))
      setTextbookList(textFilters);

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

  const handleChangePage = (_: any, page: number) => {
    setTextbookFilter({ ...textbookFilter, currentPage: page });
  };

  const handleDoTextbook = async (textbook: Textbook) => {
    try {
      if (textbook.isMock) {
        navigate(Routes.Auth.DoTextbook, { textbookId: textbook.id });
      } else {
        const { data } = await startPageApi({ textbookId: textbook.id });
        if (data) {
          navigate(Routes.Auth.DoTextbook, { textbookId: textbook.id });
        }
      }
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
      getTextbookList()
    }, [selectedAcademy?.id])
  );

  return {
    t,
    openConfirmDialog,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleChangePage,
    textbookList: textbookList.slice(0, 3),
    numberToMonth,
    textSearchRef,
    handleDoTextbook,
  };
};

export default useRecentTextbook;
