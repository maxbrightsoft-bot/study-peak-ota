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

const useTextbook = ({ preparedType, preparedFilterType }: Props) => {
  const { selectedAcademy, setLoading } = useAuthStore()
  const { t } = useTranslation();
  const textSearchRef = useRef<HTMLInputElement>(null);
  const [textbookList, setTextbookList] = useState<TextbookResponse[]>([]);
  const [textbookFilter, setTextbookFilter] = useState<TextbookQuery>(
    { ...DefaultTextbookFilter, preparedType, preparedFilterType }
  );
  const [selectedTextbook, setSelectedTextbook] = useState<TextbookResponse>()
  const [openFilterModal, setOpenFilterModal] = useState(false)
  const [openConfirmDialog, setOpenConfirmDialog] = useState<boolean>(false)
  const [isOpenDialog, setOpenDialog] = useState<boolean>(false);

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenDialog = (textbook: TextbookResponse) => {
    if(textbook) setSelectedTextbook(textbook)
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
        return () => {
          setSelectedTextbook(undefined);
          handleCloseDialog()
          getTextbookList()
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
    handleOpenConfirmDialog,
    handleCloseConfirmDialog,
    handleChangePage,
    openFilterModal,
    handleCloseFilterModal,
    handleOpenFilterModal,
    textbookList,
    numberToMonth,
    textSearchRef,
    handleDoTextbook
  };
};

export default useTextbook;
