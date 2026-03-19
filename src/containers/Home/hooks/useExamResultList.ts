import { useEffect, useState, useRef, useCallback } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getListExamApi, joinExamApi } from "../apiClients";
import { ExamSessionResponse } from "@/utils/types";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import { getErrorMessage, toast } from "@/utils/helpers";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { restartExamApi } from "@/containers/DoExam/apiClients";
import { DefaultExamSessionFilter } from "../configs/constants";
import { CourseExamSession, ExamSessionSortBy } from "../configs/type";
import { ExamStatus, OrderBy } from "@/utils/enums";

const useExamResultList = ({ onClose }: { onClose: () => void }) => {
  const { setLoading } = useAuthStore()
  const { t } = useTranslation();
  const [listExam, setListExam] = useState<CourseExamSession[]>([]);
  const [search, setSearch] = useState<string>("");
  const inputSearch = useRef<any>(null);
  const [selectedExam, setSelectedExam] = useState<CourseExamSession>();
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollViewRef = useRef<FlatList>(null)
  const [filter, setFilter] = useState(DefaultExamSessionFilter)
  const [openResultDialog, setOpenResultDialog] = useState(false);

  const handleOpenResultDialog = (exam: CourseExamSession) => {
    setSelectedExam(exam);
    setOpenResultDialog(true);
  }

  const handleCloseResultDialog = () => {
    setSelectedExam(undefined);
    setOpenResultDialog(false);
  }

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      })
      getListExam()
      return () => {
        setSelectedExam(undefined);
        setExpandedId(null)
        setSearch("")
      };
    }, [filter])
  );

  const handleSort = () => {
    const sortColumnName = ExamSessionSortBy.StartTime;
    let sortColumnDirection = OrderBy.ASC;
    if (
      filter.sortColumnName === sortColumnName &&
      filter.sortColumnDirection === OrderBy.ASC
    )
      sortColumnDirection = OrderBy.DESC;
    setFilter({
      ...filter,
      sortColumnName,
      sortColumnDirection,
      currentPage: 1,
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const getListExam = async (textSearch?: string) => {
    setLoading(true)
    try {
      const res = await getListExamApi({ ...filter, textSearch });
      const result = res?.data?.items.flatMap((item: any) =>
        item.examSessions.map((session: CourseExamSession) => ({
          ...session,
          courseId: item.id,
          courseName: item.name
        }))
      )
      setListExam(result);
    } catch (error) {
      console.log({ error });
    }
    setLoading(false)
  };

  const onChangeSearch = (value: string) => {
    setSearch(value);

    if (!!inputSearch.current) {
      clearTimeout(inputSearch.current);
    }
    inputSearch.current = setTimeout(() => {
      getListExam(value);
    }, 500);
  };


  const handleJoinExam = async (item: CourseExamSession) => {
    setLoading(true)
    try {
      await joinExamApi(item.examCode);
      onClose()
      navigate(Routes.Auth.DoExam, { examCode: item.examCode })
    } catch (error) {
      console.log({ error });
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  return {
    t,
    listExam,
    handleJoinExam,
    search,
    filter,
    handleSort,
    scrollViewRef,
    expandedId,
    toggleExpand,
    selectedExam,
    openResultDialog,
    handleOpenResultDialog,
    handleCloseResultDialog,
    onChangeSearch,
  };
};

export default useExamResultList;
