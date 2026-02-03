import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast, utcToLocalTime } from "@/utils/helpers"
import { CategoryResponse, EffectSize, ExamResult, LongTimeSpendQuestion, NoteResponse, Question, QuestionData, TextbookResult, TimelyOrderQuestion } from "@/utils/types"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ProblemKey } from "@/utils/enums"
import { captureRef } from 'react-native-view-shot'
import RNFS from 'react-native-fs';
import { useTranslation } from "react-i18next"
import { examStatusViewOptions } from "../../ExamResultList/configs/constants"
import useExamResultNote from "../../ExamResultList/hooks/useExamResultNote"
import useCreateQuestionDialog from "../../ExamResultList/hooks/useQADialog"
import { getChapterResultsApi, getChapterResultsCategoriesApi, getChapterResultsEffectSizeApi, getChapterResultsLongTimeSpendApi, getChapterResultsTimeOrderQuestionApi, getResults, getResultsCategories, getResultsEffectSize, getResultsLongTimeSpend, getResultsTimeOrderQuestion } from "../apiClients"
import { Platform, View } from "react-native"
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { useFocusEffect } from "@react-navigation/native"
import { navigate } from "@/navigators/NavigationHelpers"
import { restartExamApi } from "@/containers/DoExam/apiClients"
import { Routes } from "@/navigators/RouteName"

type Props = {
  chapterId?: number
  examCode: string
  isPrint: boolean
  examSessionId?: string
  studentExamSessionId: string
}

const useExamResult = ({ chapterId, examCode, isPrint, examSessionId, studentExamSessionId }: Props) => {
  const { t } = useTranslation()
  const contentRef = useRef<View>(null)
  const { user, setLoading } = useAuthStore()
  const [resultData, setResultData] = useState<ExamResult>();
  const [effectSize, setEffectSize] = useState<EffectSize[]>();
  const [longTimeSpend, setLongTimeSpend] = useState<LongTimeSpendQuestion[]>(
    []
  );
  const [timelyOrderQuestions, setTimelyOrderQuestions] = useState<
    TimelyOrderQuestion[]
  >([]);
  const [categoryResponses, setCategoryResponses] = useState<
    CategoryResponse[]
  >([]);
  const [openProblem, setOpenProblem] = useState<ProblemKey>();
  const [textbookResult, setTextbookResult] =
    useState<TextbookResult>()
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData>()
  const [errorMessage, setErrorMessage] = useState<string>()
  const [examStatusView, setExamStatusView] = useState(examStatusViewOptions(t)[0].value)
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [isOpenConfirmRestartExamDialog, setIsOpenConfirmRestartExamDialog] = useState(false)

  const handleCloseConfirmRestartExamDialog = () => {
    setIsOpenConfirmRestartExamDialog(false)
  }

  const handleOpenConfirmRestartExamDialog = () => {
    setIsOpenConfirmRestartExamDialog(true)
  }

  useFocusEffect(
    useCallback(() => {
      getData()
      return () => {
        setExamStatusView(examStatusViewOptions(t)[0].value);
      };
    }, [])
  );

  const handleChangeExamStatusView = (value: any) => {
    setExamStatusView(value)
  }

  const resetData = () => {
    setResultData(undefined);
    setErrorMessage(undefined)
    setLongTimeSpend([]);
    setEffectSize([]);
    setTimelyOrderQuestions([]);
    setCategoryResponses([])
  }

  const getDataTextbookResult = async () => {
    if (!chapterId) return
    setLoading(true)
    try {
      const result = await Promise.all([
        getChapterResultsApi(chapterId, undefined),
        getChapterResultsLongTimeSpendApi(chapterId, undefined),
        getChapterResultsEffectSizeApi(chapterId, undefined),
        getChapterResultsTimeOrderQuestionApi(chapterId, undefined),
        getChapterResultsCategoriesApi(chapterId, undefined)
      ])
      setTextbookResult(result[0].data?.data)
      setLongTimeSpend(result[1].data?.data)
      setEffectSize(result[2].data?.data)
      setTimelyOrderQuestions(result[3].data?.data)
      setCategoryResponses(result[4].data?.data || [])
    } catch (error) {
      const message = getErrorMessage(t, error)
      !isPrint && toast.error(message)
      setErrorMessage(message)
    }
    setLoading(false)
  }

  const getStudentData = async (examCode: string) => {
    if (!examCode) return
    setLoading(true)
    try {
      const result = await Promise.all(
        [
          getResults(examCode, { studentExamSessionId }),
          getResultsLongTimeSpend(examCode, { studentExamSessionId }),
          getResultsEffectSize(examCode, { studentExamSessionId }),
          getResultsTimeOrderQuestion(examCode, { studentExamSessionId }),
          getResultsCategories(examCode, { studentExamSessionId })
        ])

      setResultData(result[0].data?.data);
      setLongTimeSpend(result[1].data?.data);
      setEffectSize(result[2].data?.data);
      setTimelyOrderQuestions(result[3].data?.data);
      setCategoryResponses(result[4].data?.data || [])
    } catch (error) {
      const message = getErrorMessage(t, error)
      !isPrint && toast.error(message)
      setErrorMessage(message)
    }
    setLoading(false)
  }

  const getData = () => {
    resetData()
    if (!user?.email) return
    if (chapterId)
      getDataTextbookResult()
    else
      getStudentData(examCode || '')
  }

  useEffect(() => {
    getData()
  }, [examCode, user?.email]);

  const totalTime = useMemo(() => {
    let totalTime = 0

    if (!resultData?.questions?.length) return `0${t("seconds")}`
    totalTime = resultData?.questions.reduce(
      (val: number, current: any) =>
        val + Math.round(current?.duration || 0),
      0
    )

    return totalTime < 60
      ? `${totalTime}${t("seconds")}`
      : t("mins_mins_seconds_seconds", {
        mins: Math.floor(totalTime / 60),
        seconds: totalTime % 60
      })
  }, [JSON.stringify(resultData?.questions)])

  const questionOptions = useMemo(() => {
    const questions = resultData?.questions
    if (!questions) return [];
    return questions.map(({ parentQuestionId, parentQuestionOrder, id, questionOrder }) => ({
      label: t("question_order", { number: parentQuestionId ? `${parentQuestionOrder + 1}.${questionOrder + 1}` : questionOrder + 1 }),
      value: id
    }));
  }, [JSON.stringify(resultData?.questions)]);

  const studentTextbookQuestions = useMemo(() => {
    if (!textbookResult?.studentQuestionResults) return [];
    return textbookResult?.studentQuestionResults.map((question) => ({
      label: t("question_order", { number: question.parentQuestionId ? `${question.parentQuestionOrder + 1}.${question.questionOrder + 1}` : question.questionOrder + 1 }),
      value: question.id
    }))
  }, [JSON.stringify(textbookResult?.studentQuestionResults)])

  const handleSelectQuestion = (question?: QuestionData) => {
    setSelectedQuestion(question)
  }

  const examResultNotes = useExamResultNote({
    questionOptions,
    handleSelectQuestion,
    examSessionId,
    studentExamSessionId,
    examCode,
    examResult: resultData
  }
  )

  const QADialog = useCreateQuestionDialog(handleSelectQuestion)

  const { setOpenQuestionDialog, handleCloseQuestionContextMenu } =
    QADialog

  const { setOpenNoteDialog, handleCloseTooltip } =
    examResultNotes

  const handleOpenNoteDialogFromQuestion = (
    question: Question
  ) => {
    handleSelectQuestion(question)
    handleCloseQuestionContextMenu()
    setOpenNoteDialog(true)
  }

  const handleOpenQuestionDialogFromNote = (
    note: NoteResponse
  ) => {
    if (!note.questionId || note.questionOrder === undefined)
      return
    const question: QuestionData = {
      id: note.questionId,
      questionOrder: note.questionOrder
    }
    handleSelectQuestion(question)
    handleCloseTooltip()
    setOpenQuestionDialog(true)
  }

  const handleRestartExam = async () => {
    if (!studentExamSessionId) return
    setLoading(true)
    try {
      await restartExamApi(examCode);
      navigate(Routes.Auth.DoExam, { examCode })
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const fileExamName = !resultData
    ? ""
    : `Exam-Result_${resultData!.student.fullName}_${resultData!.title}_(${utcToLocalTime(resultData!.startTime, "MM-DD-YYYY HH:mm")})`

  const fileTextbookName = !textbookResult
    ? ""
    : `Textbook-Result_${textbookResult!.chapterName}_(${utcToLocalTime(textbookResult!.startTime, "MM-DD-YYYY HH:mm")})`

  const fileName = chapterId ? fileTextbookName : fileExamName

  const examTime = useMemo(() => {
    return `${utcToLocalTime(resultData?.startTime, "HH:mm")} ~ ${utcToLocalTime(resultData?.finishTime, "HH:mm")}`
  }
    , [resultData?.startTime, resultData?.finishTime])

  const handlePrint = async () => {
  if (!contentRef.current) return;

  setLoading(true)
  try {
    const uri = await captureRef(contentRef, {
      format: 'png',
      quality: 1,
      result: 'base64',
    });

    const sanitizedFileName = fileName.replace(/[ \(\):]/g, '_');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { margin: 0; }
            img { width: 100%; }
          </style>
        </head>
        <body>
          <img src="data:image/png;base64,${uri}" />
        </body>
      </html>
    `;

    const pdf = await RNHTMLtoPDF.convert({
      html: htmlContent,
      fileName: sanitizedFileName,
      width: 595,
      height: 842,
      bgColor: '#FFFFFF',
    });

    if (!pdf.filePath) return;

    const targetPath =
      Platform.OS === 'android'
        ? `${RNFS.DownloadDirectoryPath}/${sanitizedFileName}.pdf`
        : `${RNFS.DocumentDirectoryPath}/${sanitizedFileName}.pdf`;

    await RNFS.copyFile(pdf.filePath, targetPath);

    toast.success(`${t('file_saved_at')} ${targetPath}`)

  } catch (err) {
    console.error('Print error:', err);
  }
  finally {
    setLoading(false)
  }
};

  const onContentLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout;
    setContentSize({ width, height });
  };

  return {
    t,
    user,
    contentRef,
    QADialog,
    handlePrint,
    examResultData: {
      questionOptions: chapterId ? studentTextbookQuestions : questionOptions,
      examTime,
      examStatusView,
      totalTime,
      resultData,
      effectSize,
      textbookResult,
      longTimeSpend,
      timelyOrderQuestions,
      openProblem,
      categoryResponses,
      examCode,
      errorMessage,
      selectedQuestion,
      handleRestartExam,
      handleChangeExamStatusView,
      setOpenProblem,
    },
    onContentLayout,
    examResultNotes,
    isOpenConfirmRestartExamDialog,
    handleCloseConfirmRestartExamDialog,
    handleOpenConfirmRestartExamDialog,
    handleOpenNoteDialogFromQuestion,
    handleOpenQuestionDialogFromNote
  }
}
export default useExamResult