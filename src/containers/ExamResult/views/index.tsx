import { palette, TYPO } from '@/theme'
import { Action, NoteResponse, Question, RestartTextbookRequest } from '@/utils/types'
import { FontAwesome, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { useEffect, useMemo, useState } from 'react'
import { Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { ExamStatus, ExamStatusView } from '@/utils/enums'
import ExamMyAnswer from '@/containers/MyAnswer/views/ExamMyAnswer'
import TextbookMyAnswer from '@/containers/MyAnswer/views/TextbookMyAnswer'
import ExamQuestionAnalysis from '@/containers/QuestionAnalysis/views/ExamQuestionAnalysis'
import TextbookQuestionAnalysis from '@/containers/QuestionAnalysis/views/TextbookQuestionAnalysis'
import IncorrectAnswerNotes from '@/containers/IncorrectAnswerNotes'
import { NotesContainerProps } from '@/containers/IncorrectAnswerNotes/configs/interfaces'
import ExamNoteDialog from '@/containers/IncorrectAnswerNotes/components/ExamNoteDialog'
import CreateNewQuestionDialog from '../components/CreateNewQuestionDialog'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import StartPageDialog from '@/containers/Textbook/components/Dialog/StartPageDialog'
import { getTextbookByIdApi, restartTextbookApi, startPageApi } from '@/containers/Textbook/apiClients/textbookService'
import { getQuestionsTextbookApi } from '@/containers/DoTextbook/apiClients'
import useAuthStore from '@/store/useAuthStore'
import { getErrorMessage, toast } from '@/utils/helpers'
import { examStatusViewOptions } from '../configs/constants'
import useExamResult from '../hooks/useExamResult'
import PrintExamResult from './PrintExamResult'
import useCategoriesOverallChartContainer from '../hooks/useCategoriesOverallChartContainer'
import useOverallChartContainer from '../hooks/useOverallChartContainer'
import useOverallTimeChartContainer from '../hooks/useOverallTimeChartContainer'
import MyOverall from '@/containers/MyOverall'
import useQuestionTypesOverallChartContainer from '../hooks/useQuestionTypesOverallChartContainer'
import NoteDrawer from '@/containers/IncorrectAnswerNotes/components/NoteDrawer'
import CompareSolution from '@/containers/CompareSolution'
import SolutionOrderChart from '../components/SolutionOrderChart'
import SlideDrawerRoot from '@/components/ModalBase/SlideDrawerRoot'
import { Menu, TouchableRipple } from 'react-native-paper'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import TextTooltip from '@/components/Tooltip/TextTooltip'

type Props = {
  examCode?: string
  code?: string
  examSessionId?: any
  onClose?: () => void
  chapterId?: number
  /** Textbook-level result opened from history (aggregated for `date`) */
  textbookId?: number
  date?: string
  studentId?: number
  studentExamSessionId?: any
  onViewQA?: (studentId: number, sessionId?: number, questionId?: number, isTextbook?: boolean) => void
}

const ExamResult = ({ onClose, code, examSessionId, examCode, chapterId: chapterIdProp, textbookId, date, studentExamSessionId, onViewQA }: Props) => {
  // Both chapter and textbook results share the same textbook UI branches
  const chapterId = chapterIdProp || textbookId
  const {
    t,
    contentRef,
    QADialog,
    openActionMenu,
    handleOpenActionMenu,
    handleCloseActionMenu,
    examResultData,
    examResultNotes,
    isOpenConfirmRestartExamDialog,
    handleOpenConfirmRestartExamDialog,
    handleCloseConfirmRestartExamDialog,
    handleOpenQuestionDialogFromNote,
    handleOpenNoteDialogFromQuestion
  } = useExamResult({
    examCode: examCode || code || '',
    chapterId,
    textbookId: chapterIdProp ? undefined : textbookId,
    date,
    examSessionId,
    studentExamSessionId,
    isPrint: false,
    onClose
  })

  // const {
  //       isLoadingLatestSession,
  //       latestSession,
  //       isOpenRestartDialog,
  //       isRestartAgain,
  //       handleClickRestart,
  //       handleContinueLatestExam,
  //       handleRestartExam,
  //       handleViewLatestResult,
  //       handleCloseRestartModal,
  //       handleConfirmRestartExam,
  //       handleCloseConfirmRestartExamDialog
  //   } = useRestartExamSession(navigate, role, examCode)

  const {
    examStatusView,
    resultData,
    isLatestSessionUnfinished,
    timelyOrderQuestions,
    longTimeSpend,
    openProblem,
    effectSize,
    handleRestartExam,
    handleSolveExam,
    textbookResult,
    categoryResponses,
    questionOptions,
    selectedQuestion,
    handleChangeExamStatusView,
    setOpenProblem
  } = examResultData

  const {
    notes,
    noteDialogProps,
    noteIdContextMenu,
    isLoadingNotes,
    openDeleteNoteDialog,
    handleLoadMore,
    handleDeleteNote,
    handleOpenNoteDialogCreateNote,
    handleCloseTooltip,
    handleOpenTooltip,
    handleOpenEditNote,
    handleOpenDeleteNoteDialog,
    handleCloseDeleteDialog
  } = examResultNotes

  const {
    isOpenQuestionDialog,
    handleCloseQuestionDialog,
    handleCreateQuestion,
    handleOpenQuestionDialog
  } = QADialog

  const { setLoading } = useAuthStore()
  const [isOpenStartPageDialog, setOpenStartPageDialog] = useState(false)
  const [isOpenRestartConfirmDialog, setOpenRestartConfirmDialog] = useState(false)
  const [textbookDetail, setTextbookDetail] = useState<any>(null)

  const effectiveTextbookId =
    textbookId ||
    textbookResult?.textbookId ||
    (textbookResult as any)?.textbook?.id ||
    (textbookResult as any)?.studentTextbookId

  useEffect(() => {
    if (!effectiveTextbookId) return
    getTextbookByIdApi(effectiveTextbookId)
      .then(res => {
        if (res?.data?.data) {
          setTextbookDetail(res.data.data)
        }
      })
      .catch(() => {})
  }, [effectiveTextbookId])

  const startPageOptions = useMemo(() => {
    const arrOptions: { label: string; value: number }[] = []
    const obj: any = {}

    textbookDetail?.chapters?.forEach((chapter: any) => {
      if (chapter.pageFrom) {
        const label =
          chapter.pageTo && chapter.pageTo > chapter.pageFrom
            ? `${chapter.pageFrom}~${chapter.pageTo}`
            : `${chapter.pageFrom}`

        arrOptions.push({
          label,
          value: chapter.pageFrom
        })
      }
    })

    return arrOptions
      .filter(option => {
        if (!obj[option.label]) {
          obj[option.label] = 1
          return true
        }
        return false
      })
      .sort((a, b) => a.value - b.value)
  }, [textbookDetail])

  const isMockTextbook = Boolean(textbookResult?.isMock ?? textbookDetail?.isMock)

  const handleDoTextbook = async () => {
    if (!effectiveTextbookId) return
    setLoading(true)
    try {
      await startPageApi({ textbookId: effectiveTextbookId })
    } catch {}
    finally {
      setLoading(false)
      onClose?.()
      navigate(Routes.Auth.DoTextbook, { textbookId: effectiveTextbookId })
    }
  }

  const handleStartFromPage = async (values: { startPage: number }) => {
    if (!effectiveTextbookId || !values.startPage) return
    setLoading(true)
    try {
      await startPageApi({
        textbookId: effectiveTextbookId,
        startPage: values.startPage
      })
    } catch {}
    finally {
      setLoading(false)
      setOpenStartPageDialog(false)
      onClose?.()
      navigate(Routes.Auth.DoTextbook, {
        textbookId: effectiveTextbookId,
        page: values.startPage,
        reqTime: Date.now().toString()
      })
    }
  }

  const handleConfirmRestartResultPart = async () => {
    if (!effectiveTextbookId) {
      console.warn('[ExamResult] effectiveTextbookId is undefined, cannot restart')
      return
    }
    setLoading(true)
    try {
      const questions = (textbookResult?.studentQuestionResults || []) as any[]
      let minPage: number | undefined
      let maxPage: number | undefined
      let firstQuestion: any = null

      let freshRowVersion = textbookResult?.rowVersion || textbookDetail?.rowVersion
      const groupPageMap = new Map<number, { pageFrom: number; pageTo: number }>()
      const questionToPageMap = new Map<number, { pageFrom: number; pageTo: number }>()
      let allBookQuestions: any[] = []

      try {
        const [latestRes, questionsRes] = await Promise.all([
          getTextbookByIdApi(effectiveTextbookId).catch(() => null),
          getQuestionsTextbookApi(Number(effectiveTextbookId)).catch(() => null)
        ])
        const latestData = latestRes?.data?.data
        if (latestData?.rowVersion) freshRowVersion = latestData.rowVersion

        const qGroups = questionsRes?.data?.data?.questionGroups || []
        allBookQuestions = qGroups.flatMap((g: any) =>
          (g.questions || []).map((q: any) => ({
            ...q,
            questionGroupId: q.questionGroupId || g.id || g.chapterId,
            pageFrom: g.pageFrom || g.chapterPageFrom || g.parentChapterPageFrom,
            pageTo: g.pageTo || g.chapterPageTo || g.parentChapterPageTo
          }))
        )

        qGroups.forEach((g: any) => {
          const pFrom = g.pageFrom || g.chapterPageFrom || g.parentChapterPageFrom
          const pTo = g.pageTo || g.chapterPageTo || g.parentChapterPageTo || pFrom
          if (pFrom) {
            groupPageMap.set(g.id, { pageFrom: pFrom, pageTo: pTo || pFrom })
            g.questions?.forEach((q: any) => {
              if (q.id) questionToPageMap.set(q.id, { pageFrom: pFrom, pageTo: pTo || pFrom })
            })
          }
        })
      } catch {}

      // Tìm firstQuestion chuẩn xác nhất từ allBookQuestions của giáo trình (theo đúng thứ tự hiển thị của DoTextbook)
      const resultQuestionIds = new Set(questions.map((q: any) => q.questionId || q.id))
      const bookFirstQuestion = allBookQuestions.find(
        (q: any) => resultQuestionIds.has(q.id) || resultQuestionIds.has(q.questionId)
      )

      if (bookFirstQuestion) {
        firstQuestion = bookFirstQuestion
      } else if (questions.length > 0) {
        const sortedQuestions = [...questions].sort((a: any, b: any) => {
          const orderA = a.questionOrder ?? a.order ?? 0
          const orderB = b.questionOrder ?? b.order ?? 0
          if (orderA !== orderB) return orderA - orderB

          if (a.parentQuestionId && b.parentQuestionId) {
            const pA = a.parentQuestionOrder ?? 0
            const pB = b.parentQuestionOrder ?? 0
            if (pA !== pB) return pA - pB
          }

          return (a.id || 0) - (b.id || 0)
        })
        firstQuestion = sortedQuestions[0]
      }

      // 1. Duyệt qua TẤT CẢ questions có trong result này để lấy chính xác dải trang [minPage, maxPage]
      questions.forEach((q: any) => {
        const pageInfo = questionToPageMap.get(q.id) || groupPageMap.get(q.questionGroupId)
        const pFrom = q.pageNumber || q.pageFrom || q.page || pageInfo?.pageFrom
        const pTo = q.pageTo || q.pageNumber || q.pageFrom || q.page || pageInfo?.pageTo || pFrom

        if (pFrom && pFrom > 0) {
          if (minPage === undefined || pFrom < minPage) minPage = pFrom
          if (maxPage === undefined || pFrom > maxPage) maxPage = pFrom
        }
        if (pTo && pTo > 0) {
          if (minPage === undefined || pTo < minPage) minPage = pTo
          if (maxPage === undefined || pTo > maxPage) maxPage = pTo
        }
      })

      // 2. Kết hợp với questionGroups từ textbookResult
      textbookResult?.questionGroups?.forEach((g: any) => {
        const pFrom = g.pageFrom || g.chapterPageFrom || g.parentChapterPageFrom
        const pTo = g.pageTo || g.chapterPageTo || g.parentChapterPageTo || pFrom
        if (pFrom) {
          if (minPage === undefined || pFrom < minPage) minPage = pFrom
          if (maxPage === undefined || (pTo || pFrom) > maxPage) maxPage = pTo || pFrom
        }
      })

      // 3. Kết hợp với chapter đang xem trong textbookDetail (và subChapters)
      const targetChapterId = chapterId || textbookResult?.id
      const findChapterRecursive = (chapters: any[] = []): any => {
        for (const c of chapters) {
          if (c.id === targetChapterId) return c
          if (c.subChapters?.length) {
            const found = findChapterRecursive(c.subChapters)
            if (found) return found
          }
        }
        return null
      }

      const currentChapter = findChapterRecursive(textbookDetail?.chapters || [])
      if (currentChapter) {
        if (currentChapter.pageFrom) {
          if (minPage === undefined || currentChapter.pageFrom < minPage) minPage = currentChapter.pageFrom
        }
        const chMax = currentChapter.pageTo || currentChapter.pageFrom
        if (chMax) {
          if (maxPage === undefined || chMax > maxPage) maxPage = chMax
        }
        currentChapter.subChapters?.forEach((sub: any) => {
          if (sub.pageFrom && (minPage === undefined || sub.pageFrom < minPage)) minPage = sub.pageFrom
          const subMax = sub.pageTo || sub.pageFrom
          if (subMax && (maxPage === undefined || subMax > maxPage)) maxPage = subMax
        })
      }

      console.log('[ExamResult] Restarting textbook with page range:', { minPage, maxPage, effectiveTextbookId })

      const req: RestartTextbookRequest = {
        rowVersion: freshRowVersion,
        startPage: minPage,
        endPage: maxPage
      }
      await restartTextbookApi(effectiveTextbookId, req)

      const firstPage = firstQuestion?.pageNumber || firstQuestion?.pageFrom || minPage
      setOpenRestartConfirmDialog(false)
      onClose?.()
      navigate(Routes.Auth.DoTextbook, {
        textbookId: effectiveTextbookId,
        page: firstPage,
        questionId: firstQuestion?.questionId || firstQuestion?.id,
        restart: true,
        reqTime: Date.now().toString()
      })
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      setLoading(false)
    }
  }

  const questionActions: Action<Question>[] = chapterId
    ? [
      {
        label: 'ask_a_question',
        textStyle: {
          color: '#3dc674'
        },
        onPress: handleOpenQuestionDialog
      }
    ]
    : [
      {
        label: 'write_a_note_of_incorrect_answers',
        textStyle: {
          color: '#3dc674'
        },
        onPress: handleOpenNoteDialogFromQuestion
      },
      {
        label: 'ask_a_question',
        textStyle: {
          color: '#3dc674'
        },
        onPress: handleOpenQuestionDialog
      }
    ]

  const [selectedNoteView, setSelectedNoteView] = useState<NoteResponse>()

  const handleOpenNoteDrawer = (note: NoteResponse) => {
    setSelectedNoteView(note)
  }

  const handleCloseNoteDrawer = () => {
    setSelectedNoteView(undefined)
  }

  const overallChartContainer = useOverallChartContainer(
    examCode ?? '',
    studentExamSessionId,
    code ?? '',
    chapterId ?? 0
  )

  const categoriesOverallChartContainer = useCategoriesOverallChartContainer(
    examResultData.resultData,
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0,
    false
  )

  const subcategoriesOverallChartContainer = useCategoriesOverallChartContainer(
    examResultData.resultData,
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0,
    true
  )

  const questionTypesOverallChartContainer = useQuestionTypesOverallChartContainer(
    examResultData.resultData,
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0,
    true
  )

  const overallTimeChartContainer = useOverallTimeChartContainer(
    examCode || code || '',
    studentExamSessionId,
    chapterId ?? 0
  )



  const noteItemActions: Action<NoteResponse>[] = [
    {
      label: 'edit_note',
      startIcon: <Ionicons name="create-outline" size={19} color={palette.grey[700]} />,
      textStyle: {
        color: palette.grey[700]
      },
      onPress: (data: NoteResponse) => handleOpenEditNote(data)
    },
    {
      label: 'delete_note',
      startIcon: <Ionicons name="trash-outline" size={19} color={palette.error.main} />,
      textStyle: {
        color: palette.error.main
      },
      onPress: (data: NoteResponse) => handleOpenDeleteNoteDialog(data)
    }
  ]

  const notesContainerProps: NotesContainerProps = {
    data: notes,
    examResultData: resultData,
    noteIdContextMenu: noteIdContextMenu,
    itemActions: noteItemActions,
    onCloseTooltip: handleCloseTooltip,
    onOpenTooltip: handleOpenTooltip,
    onLoadMore: handleLoadMore,
    onItemClick: handleOpenNoteDrawer,
    isLoading: isLoadingNotes
  }

  const renderBody = () => {
    switch (examStatusView) {
      case ExamStatusView.MyOverall:
        return chapterId
          ? null
          : resultData && (
            <MyOverall
              resultData={resultData}
              examCode={examCode || code || ''}
              subcategoriesOverallChartContainerProps={subcategoriesOverallChartContainer}
              overallChartContainerProps={overallChartContainer}
              categoriesOverallChartContainerProps={categoriesOverallChartContainer}
              overallTimeChartContainerProps={overallTimeChartContainer}
              questionTypesOverallChartContainerProps={questionTypesOverallChartContainer}
            />
          )
      case ExamStatusView.CompareSolution:
        return effectSize && <CompareSolution effectSize={effectSize} isTextbook={!!chapterId} />
      case ExamStatusView.MyAnswers:
        return chapterId
          ? textbookResult && <TextbookMyAnswer data={textbookResult} effectSize={effectSize} onCreateNote={handleOpenNoteDialogFromQuestion} onCreateQuestion={(q) => handleOpenQuestionDialog(null as any, q)} />
          : resultData && <ExamMyAnswer data={resultData} categories={categoryResponses} effectSize={effectSize} onCreateNote={handleOpenNoteDialogFromQuestion} onCreateQuestion={(q) => handleOpenQuestionDialog(null as any, q)} />
      case ExamStatusView.QuestionAnalysis:
        return chapterId
          ? textbookResult && (
            <TextbookQuestionAnalysis
              longTimeSpend={longTimeSpend}
              categoryResponses={categoryResponses}
              resultData={textbookResult}
            />
          )
          : resultData && (
            <ExamQuestionAnalysis
              longTimeSpend={longTimeSpend}
              categoryResponses={categoryResponses}
              resultData={resultData}
            />
          )
      case ExamStatusView.SolutionOrder:
        return <SolutionOrderChart data={timelyOrderQuestions} />
      case ExamStatusView.IncorrectAnswerNotes:
        return (
          <IncorrectAnswerNotes
            notesContainerProps={notesContainerProps}
            onCreateNote={handleOpenNoteDialogCreateNote}
          />
        )
      default:
        return
    }
  }

  return (
    <SlideDrawerRoot visible={!!resultData || !!textbookResult} onClose={onClose} backgroundColor={palette.grey[100]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onClose}>
          <Ionicons name="chevron-back-outline" size={24} color={palette.grey[300]} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 16, fontWeight: 600, color: '#222222' }}>{t('exam_results')}</Text>
        </View>
        <View>
          {(resultData || textbookResult) && <Menu
            visible={openActionMenu}
            onDismiss={handleCloseActionMenu}
            anchorPosition="bottom"
            anchor={
              <TouchableOpacity
                onPress={handleOpenActionMenu}
                hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                style={{ padding: 10, margin: -10, justifyContent: 'center', alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="dots-vertical" size={26} color={palette.grey[700]} />
              </TouchableOpacity>
            }
            contentStyle={{
              backgroundColor: '#FFF',
              paddingVertical: 4,
              borderRadius: 12,
              overflow: 'hidden',
              minWidth: 250,
              top: Platform.OS === 'ios' ? -50 : 10
            }}
          >
            {resultData ? (
              <>
                <TouchableRipple
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0'
                  }}
                  onPress={() => {
                    handleCloseActionMenu()
                    onClose?.()
                    navigate(Routes.Auth.StudentExamHistory, { examCode, examSessionId })
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      gap: 12
                    }}
                  >
                    <FontAwesome5 name="history" size={18} color={palette.main[600]} />
                    <Text style={{ fontWeight: '600', color: palette.main[600] }}>{t('history')}</Text>
                  </View>
                </TouchableRipple>
                <TouchableRipple
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0'
                  }}
                  onPress={(e) => {
                    handleCloseActionMenu()
                    handleOpenQuestionDialog(e);
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      gap: 12
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={18} color={palette.main[600]} />
                    <Text style={{ fontWeight: '600', color: palette.main[600] }}>{t('ask_a_question2')}</Text>
                  </View>
                </TouchableRipple>
                <TouchableRipple
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0'
                  }}
                  onPress={() => {
                    handleCloseActionMenu()
                    handleOpenConfirmRestartExamDialog()
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      gap: 12
                    }}
                  >
                    <FontAwesome name="refresh" size={18} color="#3498db" />
                    <Text style={{ fontWeight: '600', color: '#3498db' }}>{t('restart_exam')}</Text>
                  </View>
                </TouchableRipple>
                {isLatestSessionUnfinished && (
                  <TouchableRipple
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderColor: '#E0E0E0'
                    }}
                    onPress={() => {
                      handleCloseActionMenu()
                      handleSolveExam()
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 12,
                        gap: 12
                      }}
                    >
                      <FontAwesome5 name="edit" size={18} color="#3498db" />
                      <Text style={{ fontWeight: '600', color: '#3498db' }}>{t('solve_undone_questions')}</Text>
                    </View>
                  </TouchableRipple>
                )}
              </>
            ) : (
              <>
                <TouchableRipple
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0'
                  }}
                  onPress={() => {
                    handleCloseActionMenu()
                    handleDoTextbook()
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      gap: 12
                    }}
                  >
                    <FontAwesome5 name="edit" size={18} color={palette.main[600]} />
                    <Text style={{ fontWeight: '600', color: palette.main[600] }}>{t('continue_solving')}</Text>
                  </View>
                </TouchableRipple>
                {!isMockTextbook && (
                  <TouchableRipple
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      borderColor: '#E0E0E0'
                    }}
                    onPress={() => {
                      handleCloseActionMenu()
                      setOpenStartPageDialog(true)
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 12,
                        gap: 12
                      }}
                    >
                      <Ionicons name="book-outline" size={18} color={palette.main[600]} />
                      <Text style={{ fontWeight: '600', color: palette.main[600] }}>{t('unravel_from_page')}</Text>
                    </View>
                  </TouchableRipple>
                )}
                <TouchableRipple
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0'
                  }}
                  onPress={() => {
                    handleCloseActionMenu()
                    setOpenRestartConfirmDialog(true)
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      gap: 12
                    }}
                  >
                    <FontAwesome name="refresh" size={18} color="#3498db" />
                    <Text style={{ fontWeight: '600', color: '#3498db' }}>{t('solve_again')}</Text>
                  </View>
                </TouchableRipple>
                <TouchableRipple
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderColor: '#E0E0E0'
                  }}
                  onPress={(e) => {
                    handleCloseActionMenu()
                    handleOpenQuestionDialog(e)
                  }}
                >
                  <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      paddingVertical: 12,
                      gap: 12
                    }}
                  >
                    <Ionicons name="chatbubble-ellipses" size={18} color={palette.main[600]} />
                    <Text style={{ fontWeight: '600', color: palette.main[600] }}>{t('ask_a_question2')}</Text>
                  </View>
                </TouchableRipple>
              </>
            )}
          </Menu>}
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.tabs}>
          {examStatusViewOptions(t, chapterId).map(({ label, value }, index) => {
            const active = value === examStatusView
            return (
              <Pressable
                key={index}
                onPress={() => handleChangeExamStatusView(value)}
                style={[styles.tabButton, active && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{t(label)}</Text>
              </Pressable>
            )
          })}
        </View>
        {resultData && (
          <View
            style={{ flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 8, gap: 10, alignItems: 'center', backgroundColor: '#fff' }}
          >
            <Text style={{ color: '#222222', fontSize: 12, fontWeight: '600' }}>{resultData?.subjectName}</Text>
            <View style={{ height: 12, width: 2, backgroundColor: palette.grey[300] }} />
            <TextTooltip
              text={resultData?.title || ''}
              numberOfLines={1}
              textStyle={{ color: '#222222', fontSize: 12, fontWeight: '400' }}
              containerStyle={{ flex: 1 }}
            />
          </View>
        )}
        <View style={styles.contentContainer}>{renderBody()}</View>
      </View>
      {!!textbookResult && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarContainer}>
            <TouchableOpacity
              style={[styles.button, styles.continueBtn]}
              onPress={handleDoTextbook}
            >
              <Text style={styles.buttonText}>{t('continue_solving')}</Text>
            </TouchableOpacity>

            <View style={styles.secondaryButtonRow}>
              {!isMockTextbook && (
                <TouchableOpacity
                  style={[styles.button, styles.pageBtn]}
                  onPress={() => setOpenStartPageDialog(true)}
                >
                  <Text style={styles.outlineButtonText}>{t('unravel_from_page')}</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => setOpenRestartConfirmDialog(true)}
              >
                <Ionicons name="refresh" size={16} color={palette.main[500]} />
                <Text style={styles.outlineButtonText}>{t('solve_again')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      <View style={{ opacity: 0, position: 'absolute', top: -9999 }} pointerEvents="none">
        <PrintExamResult
          contentRef={contentRef as any}
          categoryResponses={categoryResponses}
          resultData={resultData}
          overallChartContainer={overallChartContainer}
          categoriesOverallChartContainer={categoriesOverallChartContainer}
          overallTimeChartContainer={overallTimeChartContainer}
          chapterId={chapterId ?? 0}
          openProblem={openProblem}
          setOpenProblem={setOpenProblem}
          longTimeSpend={longTimeSpend}
          textbookResult={textbookResult}
        />
      </View>
      {!!selectedNoteView && (
        <NoteDrawer
          open={!!selectedNoteView}
          data={selectedNoteView}
          onClose={handleCloseNoteDrawer}
          showStudentInfo={false}
          onEdit={(note) => {
            handleCloseNoteDrawer()
            handleOpenEditNote(note)
          }}
          onDelete={(note) => {
            handleCloseNoteDrawer()
            handleOpenDeleteNoteDialog(note)
          }}
        />
      )}
      <CreateNewQuestionDialog
        examSessionId={resultData?.examSessionId}
        studentTextbookId={textbookResult?.studentTextbookSessionId}
        handleCreateQuestion={handleCreateQuestion}
        openCreateQuestionDialog={isOpenQuestionDialog}
        onCloseCreateQuestion={handleCloseQuestionDialog}
        questionOptions={questionOptions}
        selectedQuestion={selectedQuestion}
      />
      <ConfirmDialog
        open={openDeleteNoteDialog}
        toggle={handleCloseDeleteDialog}
        onConfirm={handleDeleteNote}
        text={t('are_you_sure_you_want_to_delete_the_note')}
        title={t('delete_note')}
        okText={t('delete_note')}
        cancelText={t('cancel')}
        isDelete
      />
      <ConfirmDialog
        open={!!isOpenConfirmRestartExamDialog}
        toggle={() => handleCloseConfirmRestartExamDialog?.()}
        text={t('are_you_sure_you_want_to_restart_the_exam')}
        onConfirm={() => {
          handleCloseConfirmRestartExamDialog?.()
          onClose?.()
          handleRestartExam?.()
        }}
      />
      <StartPageDialog
        options={startPageOptions}
        t={t}
        loading={false}
        open={isOpenStartPageDialog}
        onClose={() => setOpenStartPageDialog(false)}
        onSubmit={handleStartFromPage}
      />
      <ConfirmDialog
        open={isOpenRestartConfirmDialog}
        toggle={() => setOpenRestartConfirmDialog(false)}
        title={t('solve_again')}
        text={t('this_will_delete_the_previous_one')}
        okText={t('solve_again')}
        cancelText={t('cancel')}
        onConfirm={handleConfirmRestartResultPart}
      />
      <ExamNoteDialog examResultData={resultData} textbookResult={textbookResult} {...noteDialogProps} selectedQuestion={selectedQuestion} />
    </SlideDrawerRoot>
  )
}

export default ExamResult

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[100]
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '20@ms',
    paddingVertical: '16@ms',
    backgroundColor: '#fff'
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12@ms',
    borderBottomWidth: '1@ms',
    borderTopWidth: '1@ms',
    borderColor: palette.grey[100],
    backgroundColor: '#fff'
  },
  tabButton: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '8@ms'
  },
  tabButtonActive: {
    backgroundColor: palette.main[600]
  },
  tabText: {
    fontSize: '14@ms',
    fontWeight: '500',
    lineHeight: '22@ms',
    color: palette.grey[400]
  },
  tabTextActive: {
    color: '#FFFF'
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  backText: {
    ...TYPO.button2,
    fontWeight: 700,
    color: palette.grey[900]
  },
  action: { paddingHorizontal: '24@ms', gap: '8@ms', flexDirection: 'row', justifyContent: 'space-between' },
  printButton: {
    paddingVertical: '8@ms'
  },
  printText: {
    ...TYPO.button2,
    fontWeight: 700,
    color: palette.grey[900]
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    borderWidth: '1@ms',
    borderColor: '#d0d0c8',
    borderRadius: '6@ms'
  },
  iconWrapper: {
    marginRight: '6@ms'
  },
  restartText: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#3498db'
  },
  titleContainer: {
    flexDirection: 'row',
    borderTopWidth: '1@ms',
    borderColor: palette.grey[100],
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: '16@ms',
    paddingHorizontal: '24@ms'
  },
  examTitle: {
    ...TYPO.button3,
    fontWeight: 700,
    color: palette.grey[900]
  },
  examDate: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  section: {
    paddingHorizontal: '24@ms',
    paddingVertical: '12@ms',
    backgroundColor: palette.grey[50],
    borderTopWidth: '1@ms',
    borderBottomWidth: '1@ms',
    borderColor: palette.grey[100]
  },
  sectionTitle: {
    marginLeft: '4@ms'
  },
  dropdownContainer: {
    alignSelf: 'flex-start'
  },
  overviewContainer: {
    paddingVertical: '24@ms',
    gap: '16@ms'
  },
  overviewValue: {
    ...TYPO.button3,
    color: palette.grey[900]
  },
  doubleColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '16@ms'
  },
  columnItem: {
    width: '48%'
  },
  contentContainer: {
    flex: 1,
    padding: '20@ms',
    backgroundColor: palette.grey[100],
    paddingBottom: '40@ms'
  },
  bottomBar: {
    borderTopWidth: '1@ms',
    borderColor: palette.grey[100],
    backgroundColor: '#FFF'
  },
  bottomBarContainer: {
    paddingHorizontal: '20@ms',
    paddingTop: '12@ms',
    paddingBottom: Platform.OS === 'ios' ? '28@ms' : '16@ms',
    gap: '8@ms'
  },
  secondaryButtonRow: {
    flexDirection: 'row',
    gap: '8@ms',
    width: '100%'
  },
  button: {
    paddingHorizontal: '12@ms',
    paddingVertical: '12@ms',
    borderRadius: '8@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6@ms'
  },
  pageBtn: {
    flex: 1,
    borderWidth: '1@ms',
    borderColor: '#C7C7C8',
    borderRadius: '8@ms',
    backgroundColor: '#FFF'
  },
  continueBtn: {
    backgroundColor: palette.main[600],
    borderRadius: '8@ms',
    width: '100%'
  },
  outlineButton: {
    flex: 1,
    borderWidth: '1@ms',
    borderColor: palette.main[600],
    borderRadius: '8@ms',
    backgroundColor: '#FFF'
  },
  buttonText: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: 'white'
  },
  outlineButtonText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#222222'
  }
})
