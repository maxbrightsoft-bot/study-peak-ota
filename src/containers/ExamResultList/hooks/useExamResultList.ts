import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import _ from "lodash";
import { useTranslation } from "react-i18next";
import useAuthStore from "@/store/useAuthStore";
import { getListExamApi } from "../apiClients";
import { ExamStatus } from "@/utils/enums";
import { ExamSession } from "@/utils/types";
import { groupMonth } from "../configs/helpers";
import { GroupExamSession } from "../configs/types";
import { useFocusEffect } from "@react-navigation/native";

const useExamResultList = () => {
  const { setLoading, selectedAcademy } = useAuthStore()
  const { t } = useTranslation();
  const [listExam, setListExam] = useState<ExamSession[]>([]);
  const [search, setSearch] = useState<string>("");
  const inputSearch = useRef<any>(null);
  const [selectedExam, setSelectedExam] = useState<ExamSession>();
  const [expandedId, setExpandedId] = useState<number | null>(null)

  useFocusEffect(
    useCallback(() => {
      return () => {
        setSelectedExam(undefined);
        setExpandedId(null)
      };
    }, [])
  );

  const toggleExpand = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  const getListExam = async () => {
    setLoading(true)
    try {
      const res = await getListExamApi({
        pageSize: 15,
        sortColumnName: "StartTime",
        sortColumnDirection: "DESC",
        statuses: [ExamStatus.Completed]
      });
      setListExam(res.data?.items);
    } catch (error) {
      console.log({ error });
    }
    setLoading(false)
  };

  const getResultExamSearch = async (search: string) => {
    try {
      const res = await getListExamApi({
        textSearch: search,
        pageSize: -1,
        sortColumnName: "StartTime",
        sortColumnDirection: "ASC",
        statuses: [ExamStatus.Completed]
      });
      setListExam(res.data?.items);
    } catch (error) {
      console.log({ error });
    }
  };

  // const onViewResultExam = (examCode: string) => {
  //   history.push(`?examCode=${examCode}`);
  // };

  const onChangeSearch = (value: string) => {
    setSearch(value);

    if (!!inputSearch.current) {
      clearTimeout(inputSearch.current);
    }
    inputSearch.current = setTimeout(() => {
      getResultExamSearch(value);
    }, 800);
  };

  const groupExams: GroupExamSession | undefined = useMemo(
    () => groupMonth(listExam),
    [JSON.stringify(listExam)]
  );

  useEffect(() => {
    getListExam();
  }, [selectedAcademy?.id]);

  const handleViewResult = (exam: ExamSession) => {
    setSelectedExam(exam)
  }

  const handleBack = () => {
    setSelectedExam(undefined)
  }

  // const clearQueryParam = () => {
  //   if (searchParams.has("examCode")) {
  //     searchParams.delete("examCode");
  //   }
  //   history.replace({
  //     search: searchParams.toString()
  //   });
  // };

  // useEffect(() => {
  //   clearQueryParam();
  //   if (!!listExam?.[0]?.id) {
  //     history.push(`?examCode=${listExam?.[0]?.code}`);
  //   }
  // }, [JSON.stringify(listExam)]);

  // const { recoverExamCode, recoverKey } = useExamSolving({ examCode: listExam.length && examCodeActive ? examCodeActive : "", isProgressing: false });

  return {
    t,
    // isRecoverAnswers: recoverExamCode == recoverKey,
    listExam,
    groupExams,
    // examCodeActive,
    handleViewResult,
    search,
    expandedId,
    handleBack,
    toggleExpand,
    selectedExam,
    onChangeSearch,
  };
};

export default useExamResultList;
