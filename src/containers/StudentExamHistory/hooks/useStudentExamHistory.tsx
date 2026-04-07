import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import _ from "lodash";
import { ExamSessionResponse } from "@/utils/types";
import { StudentExamSessionQuery, StudentExamSessionSortBy } from "../configs/types";
import { DefaultStudentExamSessionFilter } from "../configs/constants";
import { useTranslation } from "react-i18next";
import { goBack, navigate } from "@/navigators/NavigationHelpers";
import { OrderBy } from "@/utils/enums";
import { Routes } from "@/navigators/RouteName";
import { getStudentHistoryApi, hideStudentExamSessionApi, selectStudentExamSessionApi } from "../apiClients";
import useAuthStore from "@/store/useAuthStore";

const useStudentExamHistory = ({ examSessionId, examCode }: { examSessionId: string; examCode: string; }) => {
  const [historyData, setHistoryData] = useState<ExamSessionResponse[]>([]);
  const [selectedExam, setSelectedExam] = useState<ExamSessionResponse | null>(null);
  const { setLoadingWithoutOverlay } = useAuthStore()
  const [search, setSearch] = useState<string>("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [examFilter, setExamFilter] = useState<StudentExamSessionQuery>({
    sortColumnName: DefaultStudentExamSessionFilter.sortColumnName,
    sortColumnDirection: DefaultStudentExamSessionFilter.sortColumnDirection
  });
  const { t } = useTranslation();

  const getHistory = useCallback(async (textSearch?: string) => {
    if (!examSessionId) return;
    setLoadingWithoutOverlay(true);
    try {
      const response = await getStudentHistoryApi(examSessionId, { ...examFilter, textSearch });
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.items || [];
      
      const mappedData = data.map((item: any) => ({
        ...item,
        studentExamSessionId: item.id,
        finishTime: item.endTime,
        numberOfQuestion: item.totalQuestions,
        studentName: item.student?.fullName || ""
      }));
      setHistoryData(mappedData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingWithoutOverlay(false);
    }
  }, [examSessionId]);

  useEffect(() => {
    getHistory();
  }, [getHistory]);

  const handleViewAttempt = useCallback((item: ExamSessionResponse) => {
    setSelectedExam(item);
  }, [navigate, examCode]);

  const handleBack = useCallback(() => {
    goBack();
  }, [navigate]);

  const handleDelete = async (idsToDelete: number[]) => {
    if (!examCode || idsToDelete.length === 0) return;
    setLoadingWithoutOverlay(true);
    try {
      await hideStudentExamSessionApi(examCode, { studentExamSessionIds: idsToDelete });
      await getHistory();
      setSelectedIds([]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingWithoutOverlay(false);
    }
  };

  const handleSelectSession = async (studentExamSessionId: number) => {
    if (!examCode) return;
    setLoadingWithoutOverlay(true);
    try {
      await selectStudentExamSessionApi(examCode, studentExamSessionId);
      await getHistory();
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingWithoutOverlay(false);
    }
  };

  const handleCloseExamResult = useCallback(() => {
    setSelectedExam(null);
  }, []);
  
  const handleSelect = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);


  const debounceSearch = useMemo(
    () =>
      _.debounce((value: string) => {
        getHistory(value);
      }, 500),
    []
  );


  const handleChangeTextSearch = (text: string) => {
    setSearch(text)
    debounceSearch(text);
  };

  const handleSort = (key: StudentExamSessionSortBy) => {
    const sortColumnDirection = 
      (examFilter.sortColumnName === key && examFilter.sortColumnDirection === OrderBy.ASC)
      ? OrderBy.DESC 
      : OrderBy.ASC;
      
    setExamFilter({ sortColumnName: key, sortColumnDirection });
  };

  return {
    t,
    search,
    selectedExam,
    historyData,
    selectedIds,
    examFilter,
    handleCloseExamResult,
    handleChangeTextSearch,
    handleSort,
    handleViewAttempt,
    handleBack,
    handleDelete,
    handleSelect,
    handleSelectSession
  };
};

export default useStudentExamHistory;