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
    setCourseIdSelected(courses?.length ? String(courses[0].id) : "");
    setOpenDialog(!openDialog);
  };

  const getListExamByCourse = async ({ courseId }: { courseId: string }) => {
    setLoadingWithoutOverlay(true)
    try {
      const res = await getListExamByCourseApi({ courseId });
      setExam(res.data.items || []);
      !!res.data.items.length && setExamSessionIdSelected(`${res.data.items[0]?.id}.${res.data.items[0]?.studentExamSessionId}`);
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
  };

  const handleCreateQuestionConversation = async ({
    content,
    questionId,
    studentExamSessionId,
    examSessionId,
    courseId
  }: {
    content: string,
    questionId: number,
    examSessionId: string,
    studentExamSessionId: string,
    courseId: number
  }) => {
    setLoadingWithoutOverlay(true)
    try {
      await createConversationApi({
        courseId,
        examSessionId,
        studentExamSessionId,
        questionId,
        content
      });
      toggleDialog();
      getConversationList();
    } catch (error: any) {
      toggleDialog();
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false)
  };

  useEffect(() => {
    if (!examSessionIdSelected || !openDialog) return;
    getListQuestionByExam({ examId: examSessionIdSelected.split('.')?.[0] });
  }, [examSessionIdSelected, openDialog]);

  useEffect(() => {
    if (!courseIdSelected || !openDialog) return;
    getListExamByCourse({ courseId: courseIdSelected });
  }, [courseIdSelected, openDialog]);

  useEffect(() => {
    if (courseIdSelected || !courses?.length) return;
    setCourseIdSelected(String(courses[0].id));
  }, [JSON.stringify(courses)]);

  const courseOptions = useMemo(() => {
    if (!courses) return [];
    return courses.map(({ id, name }) => ({
      label: name,
      value: id
    }));
  }, [courses]);

  const questionOptions = useMemo(() => {
    if (!questions || !exams) return [];
    return questions.map(({ superId, questionOrder, parentQuestionId, parentQuestionOrder = 0 }) => ({
      label: t('question_order', { number: !!parentQuestionId ? `${parentQuestionOrder + 1}.${questionOrder + 1}` : questionOrder + 1 }),
      value: superId
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
