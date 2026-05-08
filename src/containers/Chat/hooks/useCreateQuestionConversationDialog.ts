import { useEffect, useMemo, useState } from "react";
import {
  createConversationApi,
  getListExamByCourseApi,
  getListQuestionByExamApi
} from "../apiClient/examService";
import { Course } from "../configs/types";
import useAuthStore from "@/store/useAuthStore";
import { ConversationQuestion, ExamSessionResponse } from "@/utils/types";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";

type Props = {
  getConversationList: () => Promise<void>;
  courses?: Course[];
};

const useCreateQuestionConversationDialog = ({
  getConversationList,
  courses
}: Props) => {
  const { setLoadingWithoutOverlay } = useAuthStore()
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [exams, setExam] = useState<Array<ExamSessionResponse>>();
  const [courseIdSelected, setCourseIdSelected] = useState<string>();
  const [examSessionIdSelected, setExamSessionIdSelected] = useState<string>();
  const [questions, setQuestion] =
    useState<Array<ConversationQuestion>>();
  const { t } = useTranslation();

  const toggleDialog = () => {
    if (openDialog) {
      setCourseIdSelected(undefined);
      setExamSessionIdSelected(undefined);
      setQuestion(undefined);
      setExam(undefined);
    } else {
      getListExams({});
    }
    setOpenDialog(!openDialog);
  };

  const getListExams = async ({ courseId }: { courseId?: string }) => {
    setLoadingWithoutOverlay(true)
    try {
      const res = await getListExamByCourseApi({ courseId });
      setExam(res.data.items || []);
      setExamSessionIdSelected(undefined);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const getListQuestionByExam = async ({ examId }: { examId: string }) => {
    setLoadingWithoutOverlay(true)
    try {
      const res = await getListQuestionByExamApi({ id: examId });
      setQuestion(res.data.items || []);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  const handleChangeExam = (value: string) => {
    setExamSessionIdSelected(value);
  };

  const handleChangeCourse = (value: string) => {
    setCourseIdSelected(value);
    getListExams({ courseId: value || undefined });
  };

  const handleCreateQuestionConversation = async ({
    content,
    questionId,
    studentExamSessionId,
    examSessionId,
    courseId
  }: {
    content: string,
    questionId?: number,
    examSessionId?: string,
    studentExamSessionId?: string,
    courseId?: number
  }) => {
    setLoadingWithoutOverlay(true)
    try {
      await createConversationApi({
        courseId: !!courseId ? Number(courseId) : undefined,
        examSessionId: !!examSessionId ? Number(examSessionId) : undefined,
        studentExamSessionId: !!studentExamSessionId ? Number(studentExamSessionId) : undefined,
        questionId: !!questionId ? Number(questionId) : undefined,
        content
      });
      getConversationList();
      toast.success(t('create_conversation_success'));
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    }
    finally {
      toggleDialog();
      setLoadingWithoutOverlay(false)
    }
  };

  useEffect(() => {
    if (!examSessionIdSelected || !openDialog) return;
    getListQuestionByExam({ examId: examSessionIdSelected.split('.')?.[0] });
  }, [examSessionIdSelected, openDialog]);



  const courseOptions = useMemo(() => {
    if (!courses) return [];
    return courses.map(({ id, name }) => ({
      label: name,
      value: id
    }));
  }, [courses]);

  const questionOptions = useMemo(() => {
    if (!questions || !exams) return [];
    return questions.map(({ superId, id, questionOrder, parentQuestionId, parentQuestionOrder = 0 }) => ({
      label: t('question_order', { number: !!parentQuestionId ? `${parentQuestionOrder + 1}.${questionOrder + 1}` : questionOrder + 1 }),
      value: superId || id
    }));
  }, [questions]);

  const examOptions = useMemo(() => {
    if (!exams) return [];
    return exams.map(({ id, studentExamSessionId, studentAttemptNumber, studentTotalAttemptTime, title }) => ({
      label: `${title} ${studentTotalAttemptTime > 1 ? `#${studentAttemptNumber + 1}/${studentTotalAttemptTime}` : ""}`,
      value: `${id}.${studentExamSessionId}`
    }));
  }, [exams]);

  return {
    openConversationDialog: openDialog,
    exams,
    courses,
    questions,
    toggleConversationDialog: toggleDialog,
    handleChangeExam,
    handleChangeCourse,
    handleCreateQuestionConversation,
    courseIdSelected,
    courseOptions,
    questionOptions,
    examOptions,
    examSessionIdSelected
  };
};

export default useCreateQuestionConversationDialog;
