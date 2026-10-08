import { Routes } from "@/navigators/RouteName";
import { getExamInfoByCodeApi, joinExamByCodeApi } from "@/services";
import { getExamByIdApi } from "@/services/api/popQuizApi";
import { getMessageFromError } from "@/utils/helpers";
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const usePopQuizIntro = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();
  const quizId = route.params?.quizId;
  const code = route.params?.code;
  const [loading, setLoading] = useState(true);
  const [startLoading, setStartLoading] = useState(false);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchInfo = async () => {
        try {
          setLoading(true);
          setQuizInfo(null);
          setError(null);
          if (quizId) {
            const res = await getExamByIdApi(quizId);
            const data = res.data?.data || res.data;
            setQuizInfo(data);
          } else if (code) {
            const res = await getExamInfoByCodeApi(code);
            const data = res.data?.data || res.data;
            
            if (data && (data.isPopQuiz === false || data.examType === 0)) {
              setError(t('this_code_is_for_normal_exam'));
              return;
            }

            setQuizInfo(data);
          } else {
            setError(t('quiz_not_found'));
          }
        } catch (err: any) {
          console.error('Failed to fetch quiz info', err);
          const errMsg = getMessageFromError(t, err, t('failed_to_load_quiz'));
          setError(errMsg);
        } finally {
          setLoading(false);
        }
      };

      fetchInfo();
    }, [quizId, code])
  );

  const handleStart = async () => {
    if (code) {
      if (quizInfo && quizInfo.studentExamSessionId && quizInfo.isSessionFinished) {
        navigation.navigate(Routes.Auth.PopQuizResult, {
          code,
          studentExamSessionId: quizInfo.studentExamSessionId,
        });
        return;
      }
      if (quizInfo && quizInfo.studentExamSessionId && !quizInfo.isSessionFinished) {
        navigation.navigate(Routes.Auth.PopQuizTake, {
          code,
          studentExamSessionId: quizInfo.studentExamSessionId,
          quizId: quizInfo.examId || quizInfo.id || quizId,
        });
        return;
      }
      try {
        setStartLoading(true);
        setError(null);
        const res = await joinExamByCodeApi(code, true);
        const responseData = res.data?.data || res.data;

        if (responseData && (responseData.isPopQuiz === false || responseData.examType === 0)) {
          setError(t('this_code_is_for_normal_exam'));
          return;
        }

        const studentExamSessionId = responseData?.studentExamSessionId || responseData?.id;

        navigation.navigate(Routes.Auth.PopQuizTake, {
          code,
          studentExamSessionId,
          quizId: responseData?.examId || quizId,
        });
      } catch (err: any) {
        console.error('Failed to join exam', err);
        const errMsg = getMessageFromError(t, err, t('failed_to_join_exam'));
        setError(errMsg);
      } finally {
        setStartLoading(false);
      }
    } else if (quizId) {
      navigation.navigate(Routes.Auth.PopQuizTake, {
        quizId,
      });
    }
  };


  return {
    t,
    navigation,
    route,
    quizId,
    code,
    loading,
    quizInfo,
    startLoading,
    handleStart,
    error,
    setError
  }
}

export default usePopQuizIntro 