import { useState, useRef, useCallback, useEffect } from "react";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getListExamApi, joinExamApi } from "../apiClients";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import { getErrorMessage, toast } from "@/utils/helpers";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { DefaultExamSessionFilter } from "../configs/constants";
import { CourseExamSession, ExamSessionSortBy } from "../configs/type";
import { OrderBy } from "@/utils/enums";

const useExamResultList = ({ onClose, open }: { onClose: () => void, open: boolean }) => {
  const { setLoading, isDemoMode } = useAuthStore()
  const { t } = useTranslation();
  const [listExam, setListExam] = useState<CourseExamSession[]>([]);
  const [listCourses, setListCourses] = useState<any[]>([]);
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
      if (!open) return
      scrollViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      })
      getListExam(search)
      return () => {
        setSelectedExam(undefined);
        setExpandedId(null);
      };
    }, [open])
  );

  useEffect(() => {
    if (open) {
      getListExam(search);
    }
  }, [filter]);

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
      const rawCourses = res?.data?.items || [];
      const isAsc = filter.sortColumnDirection === OrderBy.ASC;
      const sortedCourses = [...rawCourses].sort((a: any, b: any) => {
        const aTimes = (a.examSessions || []).map((s: any) => (s.startTime ? moment(s.startTime).valueOf() : 0));
        const bTimes = (b.examSessions || []).map((s: any) => (s.startTime ? moment(s.startTime).valueOf() : 0));
        const aTime = aTimes.length ? Math.max(...aTimes) : 0;
        const bTime = bTimes.length ? Math.max(...bTimes) : 0;
        return isAsc ? aTime - bTime : bTime - aTime;
      });
      setListCourses(sortedCourses);

      const result = rawCourses.flatMap((item: any) =>
        item.examSessions.map((session: CourseExamSession) => ({
          ...session,
          courseId: item.id,
          courseName: item.name
        }))
      )

      const sortedResult = _.orderBy(
        result,
        [(session) => session.startTime ? moment(session.startTime).valueOf() : 0],
        [(filter.sortColumnDirection || OrderBy.DESC).toLowerCase() as "asc" | "desc"]
      );

      setListExam(sortedResult);
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
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }

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
    listCourses,
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
