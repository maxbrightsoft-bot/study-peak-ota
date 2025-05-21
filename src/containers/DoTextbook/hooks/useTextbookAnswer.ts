import { useState } from "react";
import { PreparedQuestionResponse } from "../config/types";
import { useTranslation } from "react-i18next";

const useTextbookAnswer = () => {
  const { t } = useTranslation()
  const [selectedQuestion, setSelectedQuestion] = useState<PreparedQuestionResponse | null>(
    null
  );

  const handleOpenDialog = (question: PreparedQuestionResponse) => {
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

export default useTextbookAnswer