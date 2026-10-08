import { getRecentPopQuizzesApi, startPopQuizSessionApi, endPopQuizSessionApi } from '@/services/api/popQuizApi';
import { getReceivedPopQuizzesApi } from '@/services/api/examService';
import { useState, useCallback } from 'react';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import useAuthStore from '@/store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { toast } from '@/utils/helpers';
import { ExamStatus } from '@/utils/enums';
import { Routes } from '@/navigators/RouteName';

const usePopQuiz = () => {
  const navigation = useNavigation<any>();
  const user = useAuthStore(state => state.user);
  const { t } = useTranslation();

  const [code, setCode] = useState('');
  const [recentQuizzes, setRecentQuizzes] = useState<any[]>([]);
  const [receivedQuizzes, setReceivedQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchMyQuizzes = useCallback(async () => {
    try {
      const res = await getRecentPopQuizzesApi();
      setRecentQuizzes(res.data?.items || res.data || []);
    } catch (err) {
    }
  }, [user?.academyDomain]);

  const fetchReceivedQuizzes = useCallback(async () => {
    try {
      const res = await getReceivedPopQuizzesApi();
      setReceivedQuizzes(res.data?.items || res.data || []);
    } catch (err) {
    }
  }, []);

  const popQuizStatusLabel = useCallback((status: ExamStatus) => {
    if (status === ExamStatus.Default) return { label: t('pop_quiz_status_inactive'), color: '#6B7280' };
    if (status === ExamStatus.InProgress) return { label: t('pop_quiz_status_active'), color: '#10B981' };
    if (status === ExamStatus.Completed) return { label: t('pop_quiz_status_completed'), color: '#EF4444' };
    return { label: '', color: '#6B7280' };
  }, [t]);

  const handleStatusChange = useCallback(async (status: ExamStatus) => {
    if (!selectedQuiz) return;
    setActionLoading(true);
    try {
      if (status === ExamStatus.InProgress) {
        try {
          const activeQuiz = recentQuizzes.find((q: any) => q.popQuizStatus === ExamStatus.InProgress);
          if (activeQuiz) {
            await endPopQuizSessionApi(activeQuiz.id, ExamStatus.Completed);
          }
        } catch (e) {
          console.error("Failed to end active session before starting new one", e);
        }

        await startPopQuizSessionApi(selectedQuiz.id, []);
      } else {
        await endPopQuizSessionApi(selectedQuiz.id, status);
      }
      setSelectedQuiz(null);
      await fetchMyQuizzes();
      await fetchReceivedQuizzes();
    } catch (err) {
      toast.error(t('action_failed'));
    } finally {
      setActionLoading(false);
    }
  }, [selectedQuiz, recentQuizzes, fetchMyQuizzes, fetchReceivedQuizzes, t]);


  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const fetchData = async () => {
        setLoading(true);
        await fetchMyQuizzes();
        await fetchReceivedQuizzes();
        if (isActive) {
          setLoading(false);
        }
      };
      fetchData();
      return () => {
        isActive = false;
        setCode('');
        setRecentQuizzes([]);
        setReceivedQuizzes([]);
        setSelectedQuiz(null);
      };
    }, [fetchMyQuizzes, fetchReceivedQuizzes])
  );

  const [isOpenConfirmEnd, setIsOpenConfirmEnd] = useState<boolean>(false);

  const setLoadingGlobal = useAuthStore(state => state.setLoading);

  const proceedOpenModalAndCompleteLive = async () => {
    const activeQuiz = recentQuizzes.find((q: any) => q.popQuizStatus === ExamStatus.InProgress);
    if (activeQuiz) {
      setLoadingGlobal(true);
      try {
        await endPopQuizSessionApi(activeQuiz.id, ExamStatus.Completed);
        await fetchMyQuizzes();
      } catch (e) {
        toast.error(t('action_failed'));
      } finally {
        setLoadingGlobal(false);
        setIsOpenConfirmEnd(false);
        navigation.navigate(Routes.Auth.PopQuizCreate);
      }
    }
  };

  const handleCreateNewPopQuiz = useCallback(async () => {
    const activeQuiz = recentQuizzes.find((q: any) => q.popQuizStatus === ExamStatus.InProgress);
    if (activeQuiz) {
      setIsOpenConfirmEnd(true);
    } else {
      navigation.navigate(Routes.Auth.PopQuizCreate);
    }
  }, [recentQuizzes, navigation]);

  return {
    t,
    navigation,
    user,
    code,
    setCode,
    recentQuizzes,
    receivedQuizzes,
    loading,
    selectedQuiz,
    setSelectedQuiz,
    actionLoading,
    popQuizStatusLabel,
    handleStatusChange,
    handleCreateNewPopQuiz,
    isOpenConfirmEnd,
    setIsOpenConfirmEnd,
    proceedOpenModalAndCompleteLive
  };
};

export default usePopQuiz;