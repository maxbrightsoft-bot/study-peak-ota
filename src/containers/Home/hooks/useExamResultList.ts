import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import _ from "lodash";
import moment from "moment";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getListExamApi, getUnattachedExamApi, joinExamApi } from "../apiClients";
import { useFocusEffect } from "@react-navigation/native";
import { FlatList } from "react-native";
import { getErrorMessage, toast } from "@/utils/helpers";
import { navigate } from "@/navigators/NavigationHelpers";
import { Routes } from "@/navigators/RouteName";
import { DefaultExamSessionFilter } from "../configs/constants";
import { CourseExamSession, ExamSessionSortBy, StudentExamStatus } from "../configs/type";
import { OrderBy } from "@/utils/enums";
import { ExamFilterCriteria } from "../components/Dialog/ExamFilterBottomSheet";


interface UseExamResultListParams {
  onClose: () => void;
  open: boolean;
  filterCriteria: ExamFilterCriteria;
  activeTab?: string;
  search: string;
}

const useExamResultList = ({
  onClose,
  open,
  filterCriteria,
  activeTab,
  search
}: UseExamResultListParams) => {
  const { setLoading, isDemoMode } = useAuthStore();
  const { t } = useTranslation();

  const [listCourses, setListCourses] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [loadingExams, setLoadingExams] = useState<boolean>(false);

  const [selectedExam, setSelectedExam] = useState<CourseExamSession>();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const scrollViewRef = useRef<any>(null);
  const [filter, setFilter] = useState(DefaultExamSessionFilter);
  const [openResultDialog, setOpenResultDialog] = useState(false);

  const [debouncedSearch, setDebouncedSearch] = useState<string>(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenResultDialog = (exam: CourseExamSession) => {
    setSelectedExam(exam);
    setOpenResultDialog(true);
  };

  const handleCloseResultDialog = () => {
    setSelectedExam(undefined);
    setOpenResultDialog(false);
  };



  const fetchExams = useCallback(
    async (pageNum: number, isAppend: boolean) => {
      if (isAppend) {
        setIsFetchingMore(true);
      } else {
        setLoadingExams(true);
      }

      try {
        const queryParams: any = {
          currentPage: 1,
          pageSize: -1,
          sortColumnName: ExamSessionSortBy.StartTime,
          sortColumnDirection: filter.sortColumnDirection || OrderBy.DESC
        };

        if (debouncedSearch) {
          queryParams.textSearch = debouncedSearch;
        }
        if (filterCriteria.courseId !== "all") {
          queryParams.courseId = filterCriteria.courseId;
        }
        if (filterCriteria.subjectName !== "all") {
          queryParams.subjectName = filterCriteria.subjectName;
        }
        if (filterCriteria.teacherName !== "all") {
          queryParams.teacherName = filterCriteria.teacherName;
        }
        if (filterCriteria.startDate) {
          queryParams.startDate = filterCriteria.startDate;
        }
        if (filterCriteria.endDate) {
          queryParams.endDate = filterCriteria.endDate;
        }

        const isSpecificCourse = filterCriteria.courseId !== "all";

        const [res, unattachedRes] = await Promise.all([
          getListExamApi(queryParams),
          !isSpecificCourse
            ? getUnattachedExamApi({ ...queryParams, sortColumnName: "StartTime" }).catch(() => null)
            : null
        ]);

        const courseItems = res?.data?.items || (res as any)?.items || [];
        const totalPages = res?.data?.totalPages ?? 1;
        const unattachedGroup = unattachedRes?.data?.data || unattachedRes?.data || unattachedRes;
        const unattachedItem =
          unattachedGroup &&
            unattachedGroup.examSessions &&
            Array.isArray(unattachedGroup.examSessions) &&
            unattachedGroup.examSessions.length > 0
            ? [unattachedGroup]
            : [];
        const newCourses = [...courseItems, ...unattachedItem];

        const isAsc = (filter.sortColumnDirection || OrderBy.DESC) === OrderBy.ASC;
        const sortedCourses = [...newCourses].sort((a: any, b: any) => {
          const aTimes = (a.examSessions || []).map((s: any) => (s.startTime ? moment(s.startTime).valueOf() : 0));
          const bTimes = (b.examSessions || []).map((s: any) => (s.startTime ? moment(s.startTime).valueOf() : 0));
          const aTime = aTimes.length ? Math.max(...aTimes) : 0;
          const bTime = bTimes.length ? Math.max(...bTimes) : 0;
          return isAsc ? aTime - bTime : bTime - aTime;
        });

        setHasMore(false);
        setListCourses(sortedCourses);
      } catch (error) {
        console.log("fetchExams error:", error);
      } finally {
        setLoadingExams(false);
        setIsFetchingMore(false);
      }
    },
    [filter.sortColumnDirection, debouncedSearch, filterCriteria]
  );

  useFocusEffect(
    useCallback(() => {
      if (!open) return;
      try {
        const ref = scrollViewRef.current as any;
        const responder = ref?.getScrollResponder?.();
        if (typeof responder?.scrollTo === 'function') {
          responder.scrollTo({ y: 0, animated: true });
        } else if (typeof ref?.scrollToOffset === 'function') {
          ref.scrollToOffset({ offset: 0, animated: true });
        } else if (typeof ref?.scrollTo === 'function') {
          ref.scrollTo({ y: 0, animated: true });
        }
      } catch {
        // Safe fallback when unmounted or empty
      }
      return () => {
        setSelectedExam(undefined);
        setExpandedId(null);
      };
    }, [open])
  );

  useEffect(() => {
    if (!open) return;
    setPage(1);
    fetchExams(1, false);
  }, [open, debouncedSearch, filterCriteria, filter.sortColumnDirection, fetchExams]);

  const handleLoadMore = () => {
    if (loadingExams || isFetchingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchExams(nextPage, true);
  };

  const handleSort = () => {
    const sortColumnName = ExamSessionSortBy.StartTime;
    let sortColumnDirection = OrderBy.ASC;
    if (
      filter.sortColumnName === sortColumnName &&
      filter.sortColumnDirection === OrderBy.ASC
    ) {
      sortColumnDirection = OrderBy.DESC;
    }
    setFilter({
      ...filter,
      sortColumnName,
      sortColumnDirection,
      currentPage: 1
    });
  };

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleJoinExam = async (item: CourseExamSession) => {
    if (isDemoMode) {
      toast.demoBlocked();
      return;
    }

    setLoading(true);
    try {
      await joinExamApi(item.examCode);
      onClose();
      navigate(Routes.Auth.DoExam, { examCode: item.examCode });
    } catch (error) {
      console.log({ error });
      toast.error(getErrorMessage(t, error));
    }
    setLoading(false);
  };

  return {
    t,
    listCourses,
    handleJoinExam,
    filter,
    handleSort,
    scrollViewRef,
    expandedId,
    toggleExpand,
    selectedExam,
    openResultDialog,
    handleOpenResultDialog,
    handleCloseResultDialog,
    handleLoadMore,
    hasMore,
    isFetchingMore,
    loadingExams
  };
};

export default useExamResultList;
