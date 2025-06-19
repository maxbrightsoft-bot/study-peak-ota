import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GRADE_OPTIONS } from "../configs/constants";
import { navigate } from "@/navigators/NavigationHelpers";
import { getErrorMessage, toast } from "@/utils/helpers";
import useAuthStore from "@/store/useAuthStore";
import { updateInfoLogin } from "../apiClients/authService";
import { Routes } from "@/navigators/RouteName";

const steps = [
  "fullName",
  "phoneNumber",
  "schoolName",
  "grade",
];

type Props = {
  values: any
  errors: any
  setFieldTouched: any
}

const useStepItem = ({ values, errors, setFieldTouched }: Props) => {
  const [step, setStep] = useState(0);
  const { user, setLoading, setUser } = useAuthStore()
  const { t } = useTranslation();

  const onNext = async () => {
    const stepKey = steps[step];
    setFieldTouched(stepKey, true)
    if (!values[stepKey] || errors[stepKey]) return;
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      await handleUpdateInfo()
    }
  };

  const onPrev = () => {
    if (step >= 0) {
      setStep((prev) => prev - 1);
    }
  };

  const handleUpdateInfo = async () => {
    setLoading(true)
    try {
      const res = await updateInfoLogin({ ...values, isMobile: true });
      setUser(res.data)
      navigate(user?.academyDomain ? Routes.Auth.Home : Routes.Auth.SelectAcademy)
    } catch (error: any) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const subjectOptions = useMemo(() => {
    return [
      {
        label: t("liberal_arts"),
        value: t("liberal_arts"),
      },
      {
        label: t("science"),
        value: t("science"),
      },
    ];
  }, [t]);

  const gradeOptions = useMemo(() => {
    return [
      ...GRADE_OPTIONS.map((i) => ({
        ...i,
        label: typeof i.label === "string" ? t(i.label) : i.label,
      })),
    ];
  }, [t, values.schoolName]);
  return {
    t,
    step,
    onNext,
    onPrev,
    subjectOptions,
    gradeOptions,
    stepCount: steps.length
  }
}

export default useStepItem