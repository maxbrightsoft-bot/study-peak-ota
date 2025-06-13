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
      getListExam()
      return () => {
        setSelectedExam(undefined);
        setExpandedId(null)
        setSearch("")
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

  const onChangeSearch = (value: string) => {
    setSearch(value);

    if (!!inputSearch.current) {
      clearTimeout(inputSearch.current);
    }
    inputSearch.current = setTimeout(() => {
      getResultExamSearch(value);
    }, 500);
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
