import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast, utcToLocalTime } from "@/utils/helpers"
import { CategoryResponse, EffectSize, ExamResult, LongTimeSpendQuestion, NoteResponse, Question, QuestionData, TextbookResult, TimelyOrderQuestion } from "@/utils/types"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ProblemKey } from "@/utils/enums"
import { captureRef } from 'react-native-view-shot'
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useTranslation } from "react-i18next"
import { examStatusViewOptions } from "../../ExamResultList/configs/constants"
import useExamResultNote from "../../ExamResultList/hooks/useExamResultNote"
import useCreateQuestionDialog from "../../ExamResultList/hooks/useQADialog"
import { getChapterResultsApi, getChapterResultsCategoriesApi, getChapterResultsEffectSizeApi, getChapterResultsLongTimeSpendApi, getChapterResultsTimeOrderQuestionApi, getResults, getResultsCategories, getResultsEffectSize, getResultsLongTimeSpend, getResultsTimeOrderQuestion } from "../apiClients"
import { Platform, View } from "react-native"
import { useFocusEffect } from "@react-navigation/native"

type Props = {
  chapterId?: number
  examCode?: string
  isPrint: boolean
}
const useExamResult = ({ chapterId, examCode, isPrint }: Props) => {
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

    useFocusEffect(
    useCallback(() => {
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
          getResults(examCode),
          getResultsLongTimeSpend(examCode),
          getResultsEffectSize(examCode),
          getResultsTimeOrderQuestion(examCode),
          getResultsCategories(examCode)
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
    return questions.map(({ id, questionOrder }) => ({
      label: t("question_order", { number: questionOrder + 1 }),
      value: id
    }));
  }, [JSON.stringify(resultData?.questions)]);

  const handleSelectQuestion = (question?: QuestionData) => {
    setSelectedQuestion(question)
  }

  const examResultNotes = useExamResultNote(
    questionOptions,
    examStatusView,
    0,
    handleSelectQuestion,
    examCode,
    resultData
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
    if (!contentRef.current) return
    console.log({ contentRef: contentRef.current });
    try {
      const uri = await captureRef(contentRef.current, {
        format: 'png',
        quality: 1,
        result: 'base64'
      })

      const originalFileName = `${fileName}.pdf`;
      const sanitizedFileName = originalFileName.replace(/[ \(\):]/g, '_')
      const filePath = `${RNFS.DocumentDirectoryPath}/${sanitizedFileName}`;

      await RNFS.writeFile(filePath, uri, 'base64');

      await Share.open({
        url: Platform.OS === 'android' ? `file://${filePath}` : filePath,
        type: 'application/pdf',
        failOnCancel: false,
      });
    } catch (err) {
      console.error('Print error:', err)
    }
  }

  useFocusEffect(
    useCallback(() => {
      return () => {
        getData()
      };
    }, []))


  return {
    t,
    user,
    contentRef,
    QADialog,
    handlePrint,
    examResultData: {
      questionOptions,
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
      handleChangeExamStatusView,
      setOpenProblem,
    },
    examResultNotes,
    handleOpenNoteDialogFromQuestion,
    handleOpenQuestionDialogFromNote
  }
}
export default useExamResult