import { getExamResult } from "@/containers/DoExam/apiClients";
import { restartExamApi } from "@/containers/DoExam/apiClients";
import { Routes } from "@/navigators/RouteName";
import { toast } from "@/utils/helpers";
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Share } from "react-native";
import { navigate } from "@/navigators/NavigationHelpers";

const usePopQuizResult = () => {
  const route = useRoute<any>();
  const { t } = useTranslation();

  const code = route.params?.code;
  const studentExamSessionId = route.params?.studentExamSessionId;

  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState<any>(null);

  const fetchResult = async () => {
    if (!code) {
      toast.error(t('no_code_provided'));
      navigate(Routes.Auth.PopQuiz);
      return;
    }

    try {
      setLoading(true); 
      const res = await getExamResult(code, studentExamSessionId);
      setResultData(res.data?.data);
    } catch (err) {
      console.error('Failed to fetch exam result', err);
      toast.error(t('failed_to_load_result'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, [code, studentExamSessionId]);

  const handleShare = async () => {
    if (!resultData) return;
    try {
      const calculatedScore = resultData.questions?.reduce((sum: number, q: any) => {
        const questionScore = Number(q?.score || 0);
        return q?.isCorrect ? sum + questionScore : sum;
      }, 0) ?? 0;
      const rawScore = Number(resultData?.score ?? 0);
      const score = Math.round(rawScore > 0 ? rawScore : calculatedScore);
      const title = resultData.title || '';
      let msg = t('share_quiz_result_msg', { title, score }) as string;
      if (msg === 'share_quiz_result_msg') {
        msg = `나는 팝퀴즈 "${title}"에서 ${score}점을 획득했습니다!`;
      }
      await Share.share({
        message: msg,
      });
    } catch (error) {
      console.error('Error sharing', error);
    }
  };

  const handleRetry = async () => {
    if (!code) return;
    try {
      const joinRes = await restartExamApi(code, true);
      const nextStudentExamSessionId = joinRes.data?.data?.studentExamSessionId
        || joinRes.data?.studentExamSessionId
        || joinRes.data?.data?.id
        || joinRes.data?.id;
      navigate(Routes.Auth.PopQuizTake, {
        code,
        studentExamSessionId: nextStudentExamSessionId,
        restartAt: Date.now(),
      });
    } catch (err: any) {
      console.error('[handleRetry] Failed:', err?.response?.data || err?.message);
      toast.error(t("exam_has_been_finished_by_teacher"));
    }
  };


  return {

    t,
    code,
    studentExamSessionId,
    loading,
    resultData,
    handleShare,
    handleRetry,
    fetchResult
  }
}

export default usePopQuizResult 
