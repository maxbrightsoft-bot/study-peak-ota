import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { GRADE_OPTIONS } from "../configs/constants";
import { navigate } from "@/navigators/NavigationHelpers";
import Routes from "@/navigators/RouteName";

const steps = [
  "studentName",
  "phoneNumber",
  "schoolName",
  "currentGrade",
  "studySpace",
];

type Props = {
  values: any
  setFieldTouched: any
}

const useStepItem = ({ values, setFieldTouched }: Props) => {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();

  const onNext = () => {
    const stepKey = steps[step];
    setFieldTouched(stepKey, true)
    if (!values[stepKey]) return;
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      console.log("Form submitted:", values);
    }
  };

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

  const handleRedirectHome = () => {
    navigate(Routes.Home)
  }
  return {
    t,
    step,
    onNext,
    subjectOptions,
    gradeOptions,
    handleRedirectHome,
  }
}

export default useStepItem