import { getChapterResultsApi, getChapterResultsEffectSizeApi } from "@/containers/ExamResult/apiClients"
import useAuthStore from "@/store/useAuthStore"
import { getErrorMessage, toast } from "@/utils/helpers"
import { EffectSize, NoteResponse, QuestionData, TextbookResult } from "@/utils/types"
import { useCallback, useEffect, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { textbookChapterResultTabOptions, TextbookChapterResultTab } from "../configs/constants"
import useTextbookResultNote from "./useTextbookResultNote"
import useCreateQuestionDialog from "@/containers/ExamResult/hooks/useQADialog"
import { useFocusEffect } from "@react-navigation/native"

type Props = {
  chapterId?: number
}

const useTextbookChapterResultView = ({ chapterId }: Props) => {
  const { t } = useTranslation()
  const { user, setLoading } = useAuthStore()
  const [textbookResult, setTextbookResult] = useState<TextbookResult>()
  const [effectSize, setEffectSize] = useState<EffectSize[]>()
  const [activeTab, setActiveTab] = useState(TextbookChapterResultTab.MyAnswers)
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionData>()

  const handleChangeTab = (value: TextbookChapterResultTab) => {
    setActiveTab(value)
  }

  const getDataTextbookResult = async () => {
    if (!chapterId) return
    setLoading(true)
    try {
      const result = await Promise.all([
        getChapterResultsApi(chapterId, undefined),
        getChapterResultsEffectSizeApi(chapterId, undefined),
      ])
      setTextbookResult(result[0].data?.data)
      setEffectSize(result[1].data?.data)
    } catch (error) {
      const message = getErrorMessage(t, error)
      toast.error(message)
    }
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      getDataTextbookResult()
      return () => {
        setActiveTab(TextbookChapterResultTab.MyAnswers)
      }
    }, [chapterId])
  )

  useEffect(() => {
    getDataTextbookResult()
  }, [chapterId, user?.email])

  const handleSelectQuestion = (question?: QuestionData) => {
    setSelectedQuestion(question)
  }

  const questionOptions = useMemo(() => {
    if (!textbookResult?.studentQuestionResults) return [];
    return textbookResult.studentQuestionResults.map((question) => ({
      label: t("question_order", { number: question.parentQuestionId ? `${question.parentQuestionOrder + 1}.${question.questionOrder + 1}` : question.questionOrder + 1 }),
      value: question.id
    }))
  }, [JSON.stringify(textbookResult?.studentQuestionResults)])

  const textbookResultNotes = useTextbookResultNote({
    questionOptions,
    handleSelectQuestion,
    studentTextbookSessionId: textbookResult?.studentTextbookSessionId,
    textbookResult
  })

  const QADialog = useCreateQuestionDialog(handleSelectQuestion)

  const { setOpenQuestionDialog, handleCloseQuestionContextMenu } = QADialog
  const { setOpenNoteDialog, handleCloseTooltip } = textbookResultNotes

  const handleOpenNoteDialogFromQuestion = (question: any) => {
    handleSelectQuestion(question)
    handleCloseQuestionContextMenu()
    setOpenNoteDialog(true)
  }

  const handleOpenQuestionDialogFromNote = (note: NoteResponse) => {
    if (!note.questionId || note.questionOrder === undefined) return
    const question: QuestionData = {
      id: note.questionId,
      questionOrder: note.questionOrder
    }
    handleSelectQuestion(question)
    handleCloseTooltip()
    setOpenQuestionDialog(true)
  }

  return {
    t,
    activeTab,
    textbookResult,
    effectSize,
    selectedQuestion,
    questionOptions,
    tabOptions: textbookChapterResultTabOptions(t),
    textbookResultNotes,
    QADialog,
    handleChangeTab,
    handleOpenNoteDialogFromQuestion,
    handleOpenQuestionDialogFromNote
  }
}

export default useTextbookChapterResultView
