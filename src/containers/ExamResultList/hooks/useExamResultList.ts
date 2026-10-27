import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getListExamApi, getLiveHistoryDetailsApi } from "../apiClients";
import { ExamStatus } from "@/utils/enums";
import { ExamSessionResponse } from "@/utils/types";
import { GroupExamSession } from "../configs/types";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { groupMonthV2 } from "@/containers/ExamResult/configs/helpers";
import { FlatList } from "react-native";
import { getErrorMessage, toast } from "@/utils/helpers";

const useExamResultList = () => {
  const route = useRoute<any>()
  const paramCode = route?.params?.code
  const paramStudentExamSessionId = route?.params?.studentExamSessionId
  const paramExamSessionId = route?.params?.id
  const paramTextbookId = route?.params?.textbookId
  const paramStudentTextbookSessionId = route?.params?.studentTextbookSessionId || route?.params?.stbsId
  const paramDate = route?.params?.date

  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
  const { t } = useTranslation();
  const [loadingList, setLoadingList] = useState<boolean>(true);
  const [listExam, setListExam] = useState<ExamSessionResponse[]>([]);
  const [search, setSearch] = useState<string>("");
  const inputSearch = useRef<any>(null);
  const [selectedExam, setSelectedExam] = useState<ExamSessionResponse>();
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const scrollViewRef = useRef<FlatList>(null)

  useFocusEffect(
    useCallback(() => {
      scrollViewRef.current?.scrollToOffset({
        offset: 0,
        animated: true
      })
      getListExam()
      return () => {
        setExpandedId(null)
        setSearch("")
        setSelectedExam(undefined)
      };
    }, [])
  );

  const toggleExpand = useCallback((id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }, [])

  const handleSelectExamFromParams = (items: ExamSessionResponse[]) => {
    if (!paramCode && !paramStudentExamSessionId && !paramExamSessionId && !paramTextbookId) return

    const groups = groupMonthV2(items)
    if (!groups) return

    let targetExam: ExamSessionResponse | undefined
    let targetGroupIndex: number | null = null

    const groupEntries = Object.entries(groups)
    
    for (let index = 0; index < groupEntries.length; index++) {
      const [, exams] = groupEntries[index] as [string, ExamSessionResponse[]]
      const foundExam = exams.find((exam) => {
        if (paramTextbookId) {
          const matchTbId = String(exam.id) === String(paramTextbookId)
          const matchStbsId = !paramStudentTextbookSessionId || String(exam.studentTextbookSessionId) === String(paramStudentTextbookSessionId)
          return matchTbId && matchStbsId
        }
        const matchStudentSessionId =
          paramStudentExamSessionId && String(exam.studentExamSessionId) === String(paramStudentExamSessionId)
        return matchStudentSessionId || (paramCode && (exam.code === paramCode || exam.examCode === paramCode))
      })
      if (foundExam) {
        targetExam = foundExam
        targetGroupIndex = index
        break
      }
    }

    if (targetExam) {
      setExpandedId(targetGroupIndex)
      setSelectedExam(targetExam)
    } else if (paramTextbookId) {
      setSelectedExam({
        historyType: 'Textbook',
        id: Number(paramTextbookId),
        studentTextbookSessionId: paramStudentTextbookSessionId ? Number(paramStudentTextbookSessionId) : undefined,
        startTime: paramDate,
        studentStartTime: paramDate,
      } as ExamSessionResponse)
    } else {
      setSelectedExam({
        historyType: 'Exam',
        code: paramCode,
        studentExamSessionId: paramStudentExamSessionId,
        id: paramExamSessionId,
      } as ExamSessionResponse)
    }
  }

  const getListExam = useCallback(async () => {
    setLoadingList(true)
    let items: ExamSessionResponse[] = []
    try {
      const res = await getLiveHistoryDetailsApi({
        pageSize: 100,
        currentPage: 0,
        studentId: user?.id,
      });
      items = res.data?.items || res.data?.data?.items || [];
      setListExam(items);
    } catch (error) {
      // Fallback to legacy exam list API if live-history fails
      try {
        const fallback = await getListExamApi({
          pageSize: 50,
          sortColumnName: "StudentExamSession.StartTime",
          sortColumnDirection: "DESC",
          statuses: [ExamStatus.Completed],
          hidden: false,
          studentId: user?.id
        });
        items = fallback.data?.items || [];
        setListExam(items);
      } catch (fallbackError) {
        toast.error(getErrorMessage(t, error));
      }
    } finally {
      setLoadingList(false);
    }
    return items
  }, [user?.id, setLoadingList, t]);

  const getResultExamSearch = async (search: string) => {
    setLoadingList(true);
    try {
      const res = await getLiveHistoryDetailsApi({
        textSearch: search,
        pageSize: 100,
        currentPage: 0,
        studentId: user?.id,
      });
      setListExam(res.data?.items || res.data?.data?.items || []);
    } catch (error) {
      try {
        const fallback = await getListExamApi({
          textSearch: search,
          pageSize: -1,
          sortColumnName: "StudentExamSession.StartTime",
          sortColumnDirection: "ASC",
          statuses: [ExamStatus.Completed],
          hidden: false,
          studentId: user?.id
        });
        setListExam(fallback.data?.items || []);
      } catch (e) {
        console.log({ error });
      }
    } finally {
      setLoadingList(false);
    }
  };

  const onChangeSearch = useCallback((value: string) => {
    setSearch(value);

    if (!!inputSearch.current) {
      clearTimeout(inputSearch.current);
    }
    inputSearch.current = setTimeout(() => {
      getResultExamSearch(value);
    }, 500);
  }, [user?.id]);

  const groupExams: GroupExamSession | undefined = useMemo(
    () => groupMonthV2(listExam),
    [JSON.stringify(listExam)]
  );

  useEffect(() => {
    getListExam().then((items) => {
      if (items) {
        handleSelectExamFromParams(items);
      }
    });
  }, [selectedAcademy?.id,route.params])

  const handleViewResult = useCallback((exam: ExamSessionResponse) => {
    setSelectedExam(exam)
  }, [])

  const handleBack = useCallback(() => {
    setSelectedExam(undefined)
  }, [])

  // const { recoverExamCode, recoverKey } = useExamSolving({ examCode: listExam.length && examCodeActive ? examCodeActive : "", isProgressing: false });

  return useMemo(() => ({
    t,
    listExam,
    groupExams,
    handleViewResult,
    search,
    scrollViewRef,
    expandedId,
    handleBack,
    toggleExpand,
    loadingList,
    selectedExam,
    onChangeSearch,
  }), [
    t,
    loadingList,
    listExam,
    groupExams,
    handleViewResult,
    search,
    expandedId,
    handleBack,
    toggleExpand,
    selectedExam,
    onChangeSearch
  ]);
};

export default useExamResultList;
