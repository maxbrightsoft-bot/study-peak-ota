import { Question } from "@/utils/types";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const useExamAnswer = () => {
  const { t } = useTranslation()
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  const handleOpenDialog = (question: Question) => {
    setSelectedQuestion(question);
  };

  const handleCloseDialog = () => {
    setSelectedQuestion(null);
  };

  return {
    t,
    selectedQuestion,
    handleOpenDialog,
    handleCloseDialog
  };
};

export default useExamAnswer