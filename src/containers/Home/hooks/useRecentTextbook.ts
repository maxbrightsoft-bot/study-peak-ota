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
import { TextbookResponse } from "@/utils/types/textbook";
import { getTextbookListApi, startPageApi } from "../apiClients/textbookService";
import { useFocusEffect } from "@react-navigation/native";


type Props = {
  preparedType?: PreparedType
  preparedFilterType?: PreparedFilterType
}

const useRecentTextbook = ({ preparedType, preparedFilterType }: Props) => {
  const { selectedAcademy, setLoading } = useAuthStore()
  const { t } = useTranslation();
  // const isKor = language === Language.ko;
  const textSearchRef = useRef<HTMLInputElement>(null);
  const [textbookList, setTextbookList] = useState<TextbookResponse[]>([]);
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>(
    { ...DefaultTextbookFilter, preparedType, preparedFilterType }
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

  const handleChangePage = (_: any, page: number) => {
    setTextbookFilter({ ...textbookFilter, currentPage: page });
  };

  const handleDoTextbook = async (textbookId: number) => {
    try {
      const { data } = await startPageApi({ textbookId });
      // if (data) history.push(`/student/study-textbook/${textbookId}`);
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
    }, [])
  );

  return {
    t,
    // isKor,
    openConfirmDialog,
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleChangePage,
    textbookList,
    numberToMonth,
    textSearchRef,
    handleDoTextbook
  };
};

export default useRecentTextbook;
