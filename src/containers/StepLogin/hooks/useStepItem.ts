import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GRADE_OPTIONS } from "../configs/constants";
import { navigate } from "@/navigators/NavigationHelpers";
import { getErrorMessage, toast } from "@/utils/helpers";
import useAuthStore from "@/store/useAuthStore";
import { updateInfoLogin } from "../apiClients/authService";
import { Routes } from "@/navigators/RouteName";
import { APPLE_USER_KEY } from "@/utils/constants";
import { getDataStorage } from "@/utils/storage";

const steps = [
  "fullName",
  "phoneNumber",
  "parentName",
  "parentPhoneNumber",
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
  const { user, setLoading, setUser, setHasEnteredSelectAcademy } = useAuthStore()
  const { t } = useTranslation();

  useEffect(() => {
    if (user?.loginMethod === "Apple") {
      setStep(1)
    }
  }, [user])

  const onNext = async (num: number) => {
    const stepKey = steps[num];
    setFieldTouched(stepKey, true)
    if (!values[stepKey] || errors[stepKey]) return;
    if (num < steps.length - 1) {
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
      const isAppleLogin = !!(await getDataStorage(APPLE_USER_KEY))

      const res = await updateInfoLogin({ ...values, isAppleLogin });

      if (res.data?.academyDomain) {
        setHasEnteredSelectAcademy(true)
      }

      setUser({ ...res.data, isNotEnoughStatements: false })

      setTimeout(() => {
        navigate(Routes.Auth.Home)
      }, 100)

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
    user,
    subjectOptions,
    gradeOptions,
    stepCount: steps.length
  }
}

export default useStepItem