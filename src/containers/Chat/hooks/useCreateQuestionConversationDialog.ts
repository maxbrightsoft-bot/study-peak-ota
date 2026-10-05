import { useEffect, useMemo, useRef, useState } from "react";
import {
  createConversationApi,
  getListExamByCourseApi,
  getListQuestionByExamApi
} from "../apiClient/examService";
import { apiAddMessage } from "../apiClient/conversationService";
import { getLastConversationByCourseApi, getLastGeneralConversationApi } from "../apiClient/studentStatusService";
import { Course } from "../configs/types";
import { categoriesData } from "../configs/constants";
import useAuthStore from "@/store/useAuthStore";
import { ConversationQuestion, ConversationsResponse, ExamSessionResponse } from "@/utils/types";
import { useTranslation } from "react-i18next";
import { getErrorMessage, toast } from "@/utils/helpers";

type Props = {
  getConversationList: (textSearch?: string, targetConversationId?: number) => Promise<any>;
  courses?: Course[];
  onSelectConversation?: (conversation: ConversationsResponse) => void;
  onRefreshConversation?: (conversation: ConversationsResponse) => void;
};

const useCreateQuestionConversationDialog = ({
  getConversationList,
  courses,
  onSelectConversation,
  onRefreshConversation
}: Props) => {
  const { setLoadingWithoutOverlay } = useAuthStore()
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [exams, setExam] = useState<Array<ExamSessionResponse>>();
  const [courseIdSelected, setCourseIdSelected] = useState<string>();
  const [examSessionIdSelected, setExamSessionIdSelected] = useState<string>();
  const [questions, setQuestion] = useState<Array<ConversationQuestion>>();
  const { t } = useTranslation();

  // State for existing conversation confirm modal
  const [lastActiveConversation, setLastActiveConversation] = useState<ConversationsResponse | null>(null);
  const [openExistingConvModal, setOpenExistingConvModal] = useState(false);
  const [pendingValues, setPendingValues] = useState<any>(null);

  // Use ref so closures always have latest pendingValues / lastActiveConversation
  const pendingValuesRef = useRef<any>(null);
  const lastActiveConvRef = useRef<ConversationsResponse | null>(null);
  const isActionRunningRef = useRef(false);

  const closeDialog = () => {
    setCourseIdSelected(undefined);
    setExamSessionIdSelected(undefined);
    setQuestion([]);
    setExam([]);
    setOpenDialog(false);
  };

  const toggleDialog = () => {
    setCourseIdSelected(undefined);
    setExamSessionIdSelected(undefined);
    setQuestion([]);
    setExam([]);
    setOpenDialog(prev => !prev);
  };

  const getListExams = async ({ courseId }: { courseId?: string } = {}) => {
    setLoadingWithoutOverlay(true);
    try {
      const res = await getListExamByCourseApi({ courseId: courseId || undefined });
      setExam(res.data.items || []);
      setExamSessionIdSelected(undefined);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false);
  };

  const getListQuestionByExam = async ({ examId }: { examId: string }) => {
    if (!examId) {
      setQuestion([]);
      return;
    }
    setLoadingWithoutOverlay(true);
    try {
      const res = await getListQuestionByExamApi({ id: examId });
      setQuestion(res.data.items || []);
    } catch (error) {
      toast.error(getErrorMessage(t, error));
    }
    setLoadingWithoutOverlay(false);
  };

  const handleChangeExam = (value?: string) => {
    setExamSessionIdSelected(value);
    setQuestion([]);
  };

  const handleChangeCourse = (value?: string) => {
    setCourseIdSelected(value);
    setExamSessionIdSelected(undefined);
    setExam([]);
    setQuestion([]);
  };

  const submitConversation = async (values: any, forceNew = false) => {
    setLoadingWithoutOverlay(true);
    try {
      const { content, questionId, examSessionId, studentExamSessionId, courseId, category } = values;
      const parsedExamSessionId = examSessionId && !isNaN(Number(examSessionId)) ? Number(examSessionId) : undefined;
      const parsedStudentExamSessionId = studentExamSessionId && !isNaN(Number(studentExamSessionId)) ? Number(studentExamSessionId) : undefined;
      const parsedCourseId = courseId && !isNaN(Number(courseId)) ? Number(courseId) : undefined;
      const parsedQuestionId = questionId != null && !isNaN(Number(questionId)) ? Number(questionId) : undefined;
      const parsedCategory = category != null && !isNaN(Number(category)) ? Number(category) : undefined;

      const res = await createConversationApi({
        ...(parsedCourseId != null ? { courseId: parsedCourseId } : {}),
        ...(parsedCategory != null ? { category: parsedCategory } : {}),
        ...(parsedExamSessionId != null ? { examSessionId: parsedExamSessionId } : {}),
        ...(parsedStudentExamSessionId != null ? { studentExamSessionId: parsedStudentExamSessionId } : {}),
        ...(parsedQuestionId != null ? { questionId: parsedQuestionId } : {}),
        content,
        forceNew
      });
      const createdConv = res?.data?.data || res?.data;
      closeDialog();
      toast.success(t('create_conversation_success'));
      const list = await getConversationList(undefined, createdConv?.id);
      const targetConv = list?.find((c: any) => c.id === createdConv?.id) || createdConv;
      setTimeout(() => {
        if (targetConv && onSelectConversation) {
          onSelectConversation(targetConv);
        }
      }, 100);
    } catch (error: any) {
      toast.error(getErrorMessage(t, error));
    } finally {
      setLoadingWithoutOverlay(false);
    }
  };

  /** User closes/cancels the confirm modal without doing anything */
  const handleCloseExistingConvModal = () => {
    if (isActionRunningRef.current) return;
    setOpenExistingConvModal(false);
    setLastActiveConversation(null);
    pendingValuesRef.current = null;
    lastActiveConvRef.current = null;
    setPendingValues(null);
  };

  /** User chose to continue in the existing conversation - send message to existing conv */
  const handleGoToExistingConversation = async () => {
    if (isActionRunningRef.current) return;
    isActionRunningRef.current = true;

    const pending = pendingValuesRef.current;
    const existingConv = lastActiveConvRef.current;

    // Immediately dismiss modal and dialog to prevent double actions
    setOpenExistingConvModal(false);
    closeDialog();

    // Cleanup state
    pendingValuesRef.current = null;
    lastActiveConvRef.current = null;
    setPendingValues(null);
    setLastActiveConversation(null);

    if (pending && existingConv) {
      setLoadingWithoutOverlay(true);
      try {
        await apiAddMessage(existingConv.id, { content: pending.content });
        const list = await getConversationList(undefined, existingConv.id);
        const targetConv = list?.find((c: any) => c.id === existingConv.id) || existingConv;
        toast.success(t('sent_message_successfully'));
        // Force chat to reload messages: clear then re-select conversation
        if (onRefreshConversation && targetConv) {
          onRefreshConversation(targetConv);
        } else if (onSelectConversation && targetConv) {
          onSelectConversation(targetConv);
        }
      } catch (error: any) {
        toast.error(getErrorMessage(t, error));
      } finally {
        setLoadingWithoutOverlay(false);
        isActionRunningRef.current = false;
      }
    } else if (existingConv && onSelectConversation) {
      onSelectConversation(existingConv);
      isActionRunningRef.current = false;
    } else {
      isActionRunningRef.current = false;
    }
  };

  /** User chose to create a brand new conversation */
  const handleCreateNewAnyway = async () => {
    if (isActionRunningRef.current) return;
    isActionRunningRef.current = true;

    const pending = pendingValuesRef.current;

    // Immediately close both confirm modal and question create dialog
    setOpenExistingConvModal(false);
    closeDialog();

    setLastActiveConversation(null);
    pendingValuesRef.current = null;
    lastActiveConvRef.current = null;
    setPendingValues(null);

    if (pending) {
      try {
        await submitConversation(pending, true);  // forceNew = true
      } finally {
        isActionRunningRef.current = false;
      }
    } else {
      isActionRunningRef.current = false;
    }
  };

  const handleCreateQuestionConversation = async (values: {
    content: string,
    questionId?: number | null,
    examSessionId?: string,
    studentExamSessionId?: string,
    courseId?: number | string,
    category?: number | null
  }) => {
    if (isActionRunningRef.current) return;

    if (values.examSessionId) {
      await submitConversation(values);
      return;
    }

    setLoadingWithoutOverlay(true);
    try {
      let res;
      if (values.courseId) {
        res = await getLastConversationByCourseApi(+values.courseId);
      } else {
        res = await getLastGeneralConversationApi();
      }

      const lastConv: ConversationsResponse | undefined = res.data.items?.[0];
      if (lastConv && !lastConv.isCompleted) {
        // Store in ref so closures always get the latest value
        pendingValuesRef.current = values;
        lastActiveConvRef.current = lastConv;
        setPendingValues(values);
        setLastActiveConversation(lastConv);
        setOpenExistingConvModal(true);
        setLoadingWithoutOverlay(false);
        return;
      }
    } catch {
      // ignore silently, don't block the flow
    }
    setLoadingWithoutOverlay(false);

    // No active conversation – proceed to create
    await submitConversation(values);
  };

  useEffect(() => {
    if (!openDialog) return;
    getListExams({ courseId: courseIdSelected });
  }, [courseIdSelected, openDialog]);

  useEffect(() => {
    if (!examSessionIdSelected || !openDialog) {
      setQuestion([]);
      return;
    }
    getListQuestionByExam({ examId: examSessionIdSelected.split('.')?.[0] });
  }, [examSessionIdSelected, openDialog]);

  const courseOptions = useMemo(() => {
    if (!courses) return [];
    return courses.map(({ id, name }) => ({
      label: name,
      value: id
    }));
  }, [courses]);

  const categoryOptions = useMemo(() => {
    return categoriesData.map(({ value, title }) => ({
      label: t(title),
      value
    }));
  }, [t]);

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
    closeConversationDialog: closeDialog,
    openCreateConversationDialog: () => setOpenDialog(true),
    handleChangeExam,
    handleChangeCourse,
    handleCreateQuestionConversation,
    courseIdSelected,
    courseOptions,
    categoryOptions,
    questionOptions,
    examOptions,
    examSessionIdSelected,
    // existing conversation modal
    openExistingConvModal,
    lastActiveConversation,
    handleGoToExistingConversation,
    handleCreateNewAnyway,
    handleCloseExistingConvModal,
  };
};

export default useCreateQuestionConversationDialog;
