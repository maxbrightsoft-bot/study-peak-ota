import { useTranslation } from 'react-i18next';
import { getExamByIdApi, updatePopQuizAnswersApi } from '@/services/api/popQuizApi';
import { ExamEvent, QuestionAnswerType } from '@/utils/enums/exam';
import useAuthStore from '@/store/useAuthStore';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { useEffect, useState, useRef } from 'react';
import { getErrorMessage, toast } from '@/utils/helpers';
import { Routes } from '@/navigators/RouteName';
import { apiJoinExam, getQuestionExam } from '@/containers/DoExam/apiClients';
import useServerTime from '@/hooks/useServerTime';
import { DATE_TIME_MIN_VALUE } from '@/utils/constants';

const usePopQuizTake = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { getServerNow } = useServerTime();

  const code = route.params?.code;
  const [currentQuizId, setCurrentQuizId] = useState<number | undefined>(route.params?.quizId);
  const currentQuizIdRef = useRef(currentQuizId);
  currentQuizIdRef.current = currentQuizId;
  const routeRestartAt = route.params?.restartAt;
  const [studentExamSessionId, setStudentExamSessionId] = useState<number | undefined>(route.params?.studentExamSessionId);
  const studentExamSessionIdRef = useRef(studentExamSessionId);
  studentExamSessionIdRef.current = studentExamSessionId;
  
  const pusher = useAuthStore(state => state.pusher)
  const subscribeChannel = useAuthStore(state => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore(state => state.unsubscribeChannelSafe)
  const academyDomain = useAuthStore((state: any) => state.selectedAcademy?.domain);

  const [loading, setLoading] = useState(true);
  const [nextLoading, setNextLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<number, string[]>>({});
  const [elapsedTime, setElapsedTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<number>(0);
  const [initialRunningTime, setInitialRunningTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [restartSeq, setRestartSeq] = useState(0);
  const [rowVersion, setRowVersion] = useState<string>('');

  const user = useAuthStore(state => state.user);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [editAnswers, setEditAnswers] = useState<number[]>([]);
  const [editTextAnswers, setEditTextAnswers] = useState<string[]>([]);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length) {
      const q = questions[currentQuestionIndex];
      setEditAnswers(q.correctAnswers || []);
      setEditTextAnswers(q.correctTextualAnswers || ['']);
    }
  }, [currentQuestionIndex, questions, isEditingMode]);

  useEffect(() => {
    if (!isFocused || !code) return;
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [code, isFocused]);

  useEffect(() => {
    if (questions.length > 0) {
      setQuestionStartTime(getServerNow());
    }
  }, [currentQuestionIndex, questions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!isFocused || !pusher || !code || !academyDomain) return;

    const channelName = `presence-exam-channel-${code}-${academyDomain.trim().toUpperCase()}`;
    let isMounted = true;
    let didSubscribe = false;

    const setupPusher = async () => {
      try {
        const handlers = [
          {
            eventName: ExamEvent.RestartExam,
            handler: async () => {
              if (!isMounted) return;
              try {
                const res = await apiJoinExam(code, true);
                const nextStudentExamSessionId = res.data?.data?.studentExamSessionId
                  || res.data?.studentExamSessionId
                  || res.data?.data?.id
                  || res.data?.id;
                toast.info(t('exam_has_been_restarted'));
                setStudentExamSessionId(nextStudentExamSessionId);
                setRestartSeq(prev => prev + 1);
              } catch (error: any) {
                console.error('Failed to restart pop quiz session', error?.response?.data || error);
                toast.error(error?.response?.data?.message || error?.message || t('failed_to_join_exam'));
              }
            }
          },
          {
            eventName: ExamEvent.TerminateExam,
            handler: () => {
              if (!isMounted) return;
              toast.info(t('exam_has_been_finished_by_teacher'));
              navigation.navigate(Routes.Auth.PopQuizResult, {
                quizId: currentQuizIdRef.current || route.params?.quizId,
                code,
                studentExamSessionId: studentExamSessionIdRef.current,
              });
            }
          }
        ];
        await subscribeChannel(pusher, channelName, handlers);
        didSubscribe = true;

        if (!isMounted) {
          unsubscribeChannelSafe(pusher, channelName);
        }
      } catch (error) {
        console.error('Failed to subscribe to pusher', error);
      }
    };

    setupPusher();

    return () => {
      isMounted = false;
      if (didSubscribe) {
        unsubscribeChannelSafe(pusher, channelName);
      }
    };
  }, [pusher, code, academyDomain, isFocused]);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!isFocused) return;
      try {
        setLoading(true);
        setQuestions([]);
        setAnswers({});
        setTextAnswers({});
        setCurrentQuestionIndex(0);
        setElapsedTime(0);
        setSessionStartTime(0);
        setInitialRunningTime(0);
        setQuestionStartTime(0);
        setQuizInfo(null);
        setIsEditingMode(false);
        setEditAnswers([]);
        setEditTextAnswers([]);
        setSaveLoading(false);
        setStudentExamSessionId(route.params?.studentExamSessionId);
        setCurrentQuizId(route.params?.quizId);

        let loadedQuestions: any[] = [];
        let runningTimeVal = 0;
        let examIdToFetch = route.params?.quizId;

        if (code) {
          const res = await getQuestionExam(code);
          const responseData = res.data?.data || res.data;
          loadedQuestions = responseData?.questionGroups?.flatMap((qg: any) => qg.questions) || [];
          runningTimeVal = responseData?.runningTime || 0;
          setRowVersion(responseData?.rowVersion || '');

          const activeSessionId = responseData?.studentExamSessionId || responseData?.id;
          if (activeSessionId) {
            setStudentExamSessionId(activeSessionId);
          }

          if (responseData?.examId) {
            examIdToFetch = responseData.examId;
            setCurrentQuizId(responseData.examId);
          } else if (responseData?.id) {
            examIdToFetch = responseData.id;
            setCurrentQuizId(responseData.id);
          }

          const hasFinished = responseData?.finishTime && !String(responseData.finishTime).startsWith(DATE_TIME_MIN_VALUE);
          if (loadedQuestions.length === 0 && hasFinished) {
             navigation.navigate(Routes.Auth.PopQuizResult, {
              quizId: examIdToFetch || route.params?.quizId,
              code,
              studentExamSessionId: activeSessionId || studentExamSessionId,
            });
            return;
          }
        }

        if (examIdToFetch) {
          try {
            const infoRes = await getExamByIdApi(examIdToFetch);
            const infoData = infoRes.data?.data || infoRes.data;
            setQuizInfo(infoData);
            if (infoData?.id) {
              setCurrentQuizId(infoData.id);
            }
            if (!code) {
              loadedQuestions = infoData?.questionGroups?.flatMap((qg: any) => qg.questions) || [];
            }
          } catch (err) {
            console.warn('[PopQuiz] Failed to fetch exam info:', err);
          }
        }

        setQuestions(loadedQuestions);
        setInitialRunningTime(runningTimeVal);
        setSessionStartTime(getServerNow());
        setQuestionStartTime(getServerNow());

        const initialAnswers: Record<number, number[]> = {};
        const initialTextAnswers: Record<number, string[]> = {};
        loadedQuestions.forEach((q: any) => {
          const isShort = [
            QuestionAnswerType.ShortAnswer,
            QuestionAnswerType.OrderMatters,
            QuestionAnswerType.OrderDoesNotMatters,
            QuestionAnswerType.SynonymProcessing
          ].includes(q.questionAnswerType);

          if (isShort) {
            if (q.textualAnswers && q.textualAnswers.length > 0) {
              initialTextAnswers[q.id] = q.textualAnswers;
            } else {
              const size = q.numberOfAnswers || q.correctTextualAnswers?.length || 1;
              initialTextAnswers[q.id] = Array.from({ length: size }, () => '');
            }
          } else {
            if (q.selectedAnswers && q.selectedAnswers.length > 0) {
              initialAnswers[q.id] = q.selectedAnswers;
            } else {
              initialAnswers[q.id] = [];
            }
          }
        });
        setAnswers(initialAnswers);
        setTextAnswers(initialTextAnswers);

        // Find the first unanswered question
        const firstUnansweredIndex = loadedQuestions.findIndex((q: any) => {
          const isShort = [
            QuestionAnswerType.ShortAnswer,
            QuestionAnswerType.OrderMatters,
            QuestionAnswerType.OrderDoesNotMatters,
            QuestionAnswerType.SynonymProcessing
          ].includes(q.questionAnswerType);

          if (isShort) {
            return !q.textualAnswers || q.textualAnswers.length === 0 || q.textualAnswers.every((ans: string) => !ans || ans.trim() === '');
          } else {
            return !q.selectedAnswers || q.selectedAnswers.length === 0;
          }
        });
        setCurrentQuestionIndex(firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0);

        setElapsedTime(0);
      } catch (err) {
        console.error('Failed to load questions', err);
        toast.error(t('failed_to_load_questions'));
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [code, route.params?.quizId, route.params?.studentExamSessionId, routeRestartAt, restartSeq, isFocused]);

  const handleSaveAnswers = async () => {
    const activeQuizId = quizInfo?.id || currentQuizId || route.params?.quizId;
    if (!activeQuizId) return;
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    const isShortAnswer = [
      QuestionAnswerType.ShortAnswer,
      QuestionAnswerType.OrderMatters,
      QuestionAnswerType.OrderDoesNotMatters,
      QuestionAnswerType.SynonymProcessing
    ].includes(currentQuestion.questionAnswerType);

    try {
      setSaveLoading(true);
      if (!isShortAnswer && editAnswers.length === 0) {
        toast.error(t('must_have_at_least_one_correct_answer'));
        return;
      }
      if (isShortAnswer && editTextAnswers.every(ans => !ans || ans.trim() === '')) {
        toast.error(t('must_have_at_least_one_correct_answer'));
        return;
      }

      const res = await updatePopQuizAnswersApi(Number(activeQuizId), {
        questionId: currentQuestion.id,
        questionAnswerType: currentQuestion.questionAnswerType,
        correctAnswers: isShortAnswer ? [] : editAnswers,
        correctTextualAnswers: isShortAnswer ? editTextAnswers : [],
      });

      const responseData = res.data;
      if (responseData?.status === 1 || res.status === 200 || res.status === 204) {
        toast.success(t('update_success'));
        setQuestions(prev => prev.map(q => {
          if (q.id === currentQuestion.id) {
            return {
              ...q,
              correctAnswers: isShortAnswer ? [] : editAnswers,
              correctTextualAnswers: isShortAnswer ? editTextAnswers : [],
            };
          }
          return q;
        }));
        setIsEditingMode(false);
      } else {
        toast.error(responseData?.message || t('action_failed'));
      }
    } catch (err: any) {
      console.error('Failed to update correct answer', err);
      toast.error(getErrorMessage(t, err));
    } finally {
      setSaveLoading(false);
    }
  };

  return {
    t,
    setTextAnswers,
    quizId: currentQuizId || route.params?.quizId,
    navigation,
    code,
    studentExamSessionId,
    loading,
    nextLoading,
    questions,
    currentQuestionIndex,
    answers,
    textAnswers,
    elapsedTime,
    formatTime,
    setAnswers,
    setNextLoading,
    setCurrentQuestionIndex,
    setQuestions,
    sessionStartTime,
    setSessionStartTime,
    initialRunningTime,
    setInitialRunningTime,
    questionStartTime,
    setQuestionStartTime,
    getServerNow,
    setStudentExamSessionId,
    rowVersion,
    setRowVersion,
    user,
    quizInfo,
    isEditingMode,
    setIsEditingMode,
    editAnswers,
    setEditAnswers,
    editTextAnswers,
    setEditTextAnswers,
    saveLoading,
    handleSaveAnswers,
  }
}

export default usePopQuizTake 
