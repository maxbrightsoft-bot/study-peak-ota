import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast, utcToLocalTime } from "@/utils/helpers"
import { CategoryResponse, EffectSize, ExamResult, LongTimeSpendQuestion, NoteResponse, Question, QuestionData, TextbookResult, TimelyOrderQuestion } from "@/utils/types"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { ExamStatus, ProblemKey } from "@/utils/enums"
import { captureRef } from 'react-native-view-shot'
import RNFS from 'react-native-fs';
import { useTranslation } from "react-i18next"
import useExamResultNote from "./useExamResultNote"
import useCreateQuestionDialog from "./useQADialog"
import { getChapterResultsApi, getChapterResultsCategoriesApi, getChapterResultsEffectSizeApi, getChapterResultsLongTimeSpendApi, getChapterResultsTimeOrderQuestionApi, getLatestSessionApi, getResults, getResultsCategories, getResultsEffectSize, getResultsLongTimeSpend, getResultsTimeOrderQuestion, getTextbookResultsApi, getTextbookResultsCategoriesApi, getTextbookResultsEffectSizeApi, getTextbookResultsLongTimeSpendApi, getTextbookResultsTimeOrderQuestionApi } from "../apiClients"
import { Platform, View } from "react-native"
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { useFocusEffect } from "@react-navigation/native"
import { navigate } from "@/navigators/NavigationHelpers"
import { restartExamApi } from "@/containers/DoExam/apiClients"
import { Routes } from "@/navigators/RouteName"
import { examStatusViewOptions } from "../configs/constants"
import _ from "lodash"
import { ExamResultRequest, ExamResultRequestArgs, isLatestResponse, isRequestPending, resultRequestKey } from "../configs/requestGuard"

type Props = {
  chapterId?: number
  textbookId?: number
  date?: string
  examCode: string
  isPrint: boolean
  examSessionId?: string
  studentExamSessionId: string
  wrongNoteQuestionSuperId?: number
  wrongNoteNoteId?: number
  wrongNoteReadOnly?: boolean
  wrongNoteRejectReason?: string
  wrongNoteReviewerName?: string
  wrongNoteReviewedAt?: string
  onWrongNoteConsumed?: () => void
  onClose?: () => void
}

const useExamResult = ({ chapterId, textbookId, date, examCode, isPrint, examSessionId, studentExamSessionId, onClose, wrongNoteQuestionSuperId, wrongNoteNoteId, wrongNoteReadOnly, wrongNoteRejectReason, wrongNoteReviewerName, wrongNoteReviewedAt, onWrongNoteConsumed }: Props) => {
  const { t } = useTranslation()
  const contentRef = useRef<View>(null)
  const user = useAuthStore(state => state.user)
  const setLoading = useAuthStore(state => state.setLoading)
  const [resultData, setResultData] = useState<ExamResult>();
  const [latestSession, setLatestSession] = useState<any>();
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
  const [examStatusView, setExamStatusView] = useState(examStatusViewOptions(t, chapterId)[0].value)
  const [contentSize, setContentSize] = useState({ width: 0, height: 0 });
  const [isOpenConfirmRestartExamDialog, setIsOpenConfirmRestartExamDialog] = useState(false)
  const [openActionMenu, setOpenActionMenu] = useState(false)

  const isLatestSessionUnfinished = useMemo(() => {
    const data = latestSession || resultData
    if (!data) return false
    const sessionStatus = data.isLate ? data.lateStatus : data.status
    return sessionStatus !== ExamStatus.Completed
  }, [latestSession, resultData])

  const handleOpenActionMenu = () => {
    setOpenActionMenu(true)
  }

  const handleCloseActionMenu = () => {
    setOpenActionMenu(false)
  }

  const handleCloseConfirmRestartExamDialog = () => {
    setIsOpenConfirmRestartExamDialog(false)
  }

  const handleOpenConfirmRestartExamDialog = () => {
    setIsOpenConfirmRestartExamDialog(true)
  }

  // The args of the result this screen should show now. A response is applied only while its args are still these
  // (the focus refetch and the params effect can race; a late response for a previous attempt must be dropped).
  const latestArgsRef = useRef<ExamResultRequestArgs>({ examCode, studentExamSessionId, chapterId, textbookId, date })
  latestArgsRef.current = { examCode, studentExamSessionId, chapterId, textbookId, date }
  // Every started request gets a sequence number; only the latest one for the current args is applied (RV-104).
  const requestSeqRef = useRef(0)
  const latestSeqByKeyRef = useRef<Record<string, number>>({})
  const pendingSeqsRef = useRef<Set<number>>(new Set())

  // RV-101: a new attempt / exam never shows the previous one's result or error (the pending spinner shows instead,
  // and no note can be written against a result that is not the requested attempt). Reset during render: no stale frame.
  const sessionKey = `${examCode}|${studentExamSessionId ?? ''}`
  const [shownSessionKey, setShownSessionKey] = useState(sessionKey)
  if (shownSessionKey !== sessionKey) {
    setShownSessionKey(sessionKey)
    setResultData(undefined)
    setLatestSession(undefined)
    setErrorMessage(undefined)
  }

  const startRequest = (args: ExamResultRequestArgs): ExamResultRequest => {
    requestSeqRef.current += 1
    const request = { seq: requestSeqRef.current, args }
    latestSeqByKeyRef.current[resultRequestKey(args)] = request.seq
    pendingSeqsRef.current.add(request.seq)
    setErrorMessage(undefined) // RV-102
    setLoading(true)
    return request
  }

  const isCurrentResponse = (request: ExamResultRequest) =>
    isLatestResponse(request, latestArgsRef.current, latestSeqByKeyRef.current)

  const finishRequest = (request: ExamResultRequest) => {
    pendingSeqsRef.current.delete(request.seq)
    if (pendingSeqsRef.current.size === 0) setLoading(false)
  }

  // Focus calls the latest getData (current params), not the one of the render that created the callback.
  const getDataRef = useRef<() => void>(() => {})

  useFocusEffect(
    useCallback(() => {
      getDataRef.current()
      return () => {
        setExamStatusView(examStatusViewOptions(t, chapterId)[0].value);
      };
    }, [chapterId, textbookId])
  );

  useEffect(() => {
    setExamStatusView(examStatusViewOptions(t, chapterId)[0].value);
  }, [chapterId, textbookId, t]);

  const handleChangeExamStatusView = (value: any) => {
    setExamStatusView(value)
  }

  const resetData = () => {
    setResultData(undefined);
    setTextbookResult(undefined);
    setErrorMessage(undefined)
    setLongTimeSpend([]);
    setEffectSize([]);
    setTimelyOrderQuestions([]);
    setCategoryResponses([])
  }

  const getDataTextbookResult = async (args: ExamResultRequestArgs) => {
    const { chapterId, textbookId, date } = args
    if (!chapterId) return
    const request = startRequest(args)
    try {
      // textbookId (history mode) -> textbook-level APIs filtered by the answered date;
      // otherwise legacy chapter-level APIs.
      const isTextbookMode = !!textbookId
      const result = await Promise.all(isTextbookMode ? [
        getTextbookResultsApi(chapterId, undefined, date),
        getTextbookResultsLongTimeSpendApi(chapterId, undefined, date),
        getTextbookResultsEffectSizeApi(chapterId, undefined, date),
        getTextbookResultsTimeOrderQuestionApi(chapterId, undefined, date),
        getTextbookResultsCategoriesApi(chapterId, undefined, date)
      ] : [
        getChapterResultsApi(chapterId, undefined),
        getChapterResultsLongTimeSpendApi(chapterId, undefined),
        getChapterResultsEffectSizeApi(chapterId, undefined),
        getChapterResultsTimeOrderQuestionApi(chapterId, undefined),
        getChapterResultsCategoriesApi(chapterId, undefined)
      ])
      if (!isCurrentResponse(request)) return
      setTextbookResult(result[0].data?.data)
      setLongTimeSpend(result[1].data?.data)
      setEffectSize(result[2].data?.data)
      setTimelyOrderQuestions(result[3].data?.data)
      setCategoryResponses(result[4].data?.data || [])
    } catch (error) {
      if (!isCurrentResponse(request)) return
      const message = getErrorMessage(t, error)
      !isPrint && toast.error(message)
      setErrorMessage(message)
    } finally {
      finishRequest(request)
    }
  }

  const getStudentData = async (args: ExamResultRequestArgs) => {
    const { examCode, studentExamSessionId } = args
    if (!examCode) return
    const request = startRequest(args)
    try {
      const result = await Promise.all(
        [
          getResults(examCode, { studentExamSessionId }),
          getResultsLongTimeSpend(examCode, { studentExamSessionId }),
          getResultsEffectSize(examCode, { studentExamSessionId }),
          getResultsTimeOrderQuestion(examCode, { studentExamSessionId }),
          getResultsCategories(examCode, { studentExamSessionId }),
          getLatestSessionApi(examCode).catch((e) => {
            return null
          })
        ])

      if (!isCurrentResponse(request)) return
      setResultData(result[0].data?.data);
      setLongTimeSpend(result[1].data?.data);
      setEffectSize(result[2].data?.data);
      setTimelyOrderQuestions(result[3].data?.data);
      setCategoryResponses(result[4].data?.data || [])
      
      const latestRes = result[5]?.data
      const sessionData = latestRes?.data !== undefined ? latestRes.data : latestRes
      setLatestSession(sessionData)
    } catch (error) {
      if (!isCurrentResponse(request)) return
      const message = getErrorMessage(t, error)
      !isPrint && toast.error(message)
      setErrorMessage(message)
    } finally {
      finishRequest(request)
    }
  }

  const getData = () => {
    if (!user?.email) return
    const args = latestArgsRef.current
    // Focus right after a params change (or a refocus): the latest fetch for these args is still running.
    if (isRequestPending(args, latestSeqByKeyRef.current, pendingSeqsRef.current)) return
    if (args.chapterId)
      getDataTextbookResult(args)
    else
      getStudentData({ ...args, examCode: args.examCode || '' })
  }
  getDataRef.current = getData
  useEffect(() => {
    getData()
  }, [studentExamSessionId, examCode, user?.email, chapterId, textbookId, date])

  const totalTime = useMemo(() => {
    let time = 0

    if (chapterId) {
      time = textbookResult?.totalTime || 0
    } else {
      if (!resultData?.questions?.length) return `0${t("seconds")}`
      time = resultData?.questions.reduce(
        (val: number, current: any) =>
          val + Math.round(current?.duration || 0),
        0
      )
    }

    return time < 60
      ? `${time}${t("seconds")}`
      : t("mins_mins_seconds_seconds", {
        mins: Math.floor(time / 60),
        seconds: time % 60
      })
  }, [JSON.stringify(resultData?.questions), textbookResult?.totalTime, chapterId])

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
    questionOptions: chapterId ? studentTextbookQuestions : questionOptions,
    handleSelectQuestion,
    selectedQuestion,
    examSessionId,
    studentExamSessionId,
    studentTextbookSessionId: textbookResult?.studentTextbookSessionId,
    examCode,
    examResult: resultData,
    textbookResult,
    wrongNoteQuestionSuperId,
    wrongNoteNoteId,
    wrongNoteReadOnly,
    wrongNoteRejectReason,
    wrongNoteReviewerName,
    wrongNoteReviewedAt,
    onWrongNoteConsumed
  }
  )

  const QADialog = useCreateQuestionDialog(handleSelectQuestion)

  const { setOpenQuestionDialog, handleCloseQuestionContextMenu } =
    QADialog

  const { handleOpenNoteDialogForQuestion, handleCloseTooltip } =
    examResultNotes

  // My answers "Note" / question menu: opens the question's actionable note (rejected, else latest), like web.
  const handleOpenNoteDialogFromQuestion = (
    question: Question
  ) => {
    handleCloseQuestionContextMenu()
    handleOpenNoteDialogForQuestion(question)
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
    if (!examCode) return
    setLoading(true)
    try {
      await restartExamApi(examCode, false);
      resetData();
      onClose?.();
      setLoading(false);
      navigate(Routes.Auth.DoExam, { examCode, reqTime: Date.now() });
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
    setLoading(false)
  }

  const handleSolveExam = () => {
    if (!examCode) return
    resetData()
    onClose?.()
    navigate(Routes.Auth.DoExam, { examCode })
  }

  const fileExamName = !resultData
    ? ""
    : `Exam-Result_${resultData!.student.fullName}_${resultData!.title}_(${utcToLocalTime(resultData!.startTime, "MM-DD-YYYY HH:mm")})`

  const fileTextbookName = !textbookResult
    ? ""
    : `Textbook-Result_${textbookResult!.chapterName}_(${utcToLocalTime(textbookResult!.startTime, "MM-DD-YYYY HH:mm")})`

  const fileName = chapterId ? fileTextbookName : fileExamName

  const examTime = useMemo(() => {
    const start = chapterId ? textbookResult?.startTime : resultData?.startTime
    let finish = resultData?.finishTime;
    if (chapterId) {
      if (textbookResult?.startTime && textbookResult?.totalTime) {
         const startDate = new Date(textbookResult.startTime);
         startDate.setSeconds(startDate.getSeconds() + textbookResult.totalTime);
         finish = startDate.toISOString();
      } else {
         finish = textbookResult?.startTime;
      }
    }
    return `${utcToLocalTime(start, "HH:mm")} ~ ${utcToLocalTime(finish, "HH:mm")}`
  }, [resultData?.startTime, resultData?.finishTime, textbookResult?.startTime, textbookResult?.totalTime, chapterId])

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
    openActionMenu,
    handleOpenActionMenu,
    handleCloseActionMenu,
    examResultData: {
      questionOptions: chapterId ? studentTextbookQuestions : questionOptions,
      examTime,
      examStatusView,
      totalTime,
      resultData,
      latestSession,
      isLatestSessionUnfinished,
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
      handleSolveExam,
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