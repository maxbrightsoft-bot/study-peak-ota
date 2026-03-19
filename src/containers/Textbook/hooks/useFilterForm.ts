import { getSubjectListApi } from "@/services/api/subjectService";
import useAuthStore from "@/store/useAuthStore";
import { getErrorMessage, toast } from "@/utils/helpers";
import { Subject } from "@/utils/types";
import moment from "moment";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const useFilterForm = () => {
  const { t } = useTranslation();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const { setLoadingWithoutOverlay } = useAuthStore();

  const getSubjects = useCallback(async () => {
    try {
      setLoadingWithoutOverlay(true)
      const res =
        await getSubjectListApi("");
      const { items = [] } = res.data;
      setSubjects(items);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  }, []);

  useEffect(() => {
    getSubjects();
  }, []);

  const numberToMonth = (number: number) => {
    if (number < 1 || number > 12) {
      return;
    }
    return moment()
      .month(number - 1)
      .format(t("month_format"));
  };

  const subjectOptions = subjects.map((subject) => ({
    label: `${subject.name}`,
    value: subject.id
  }));

  const monthOptions = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => ({
      label: numberToMonth(index + 3),
      value: index + 3
    }));
  }, []);

  return {
    monthOptions,
    subjectOptions,
  }
}

export default useFilterForm