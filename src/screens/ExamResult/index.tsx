import { useCallback, useEffect, useRef, useState } from "react"
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { useFocusEffect, useIsFocused } from "@react-navigation/native"
import type { ParamListBase } from "@react-navigation/native"
import ExamResult from "@/containers/ExamResult/views"
import { goBack, navigate } from "@/navigators/NavigationHelpers"
import { Routes } from "@/navigators/RouteName"

type Props = BottomTabScreenProps<ParamListBase>

type ExamResultParams = {
  examCode?: string
  studentExamSessionId?: string
  examSessionId?: string
  wrongNoteQuestionSuperId?: number | string
  wrongNoteNoteId?: number | string
  wrongNoteReadOnly?: boolean
  wrongNoteRejectReason?: string
  wrongNoteReviewerName?: string
  wrongNoteReviewedAt?: string
  returnTo?: string
}

const toNumber = (value: unknown) =>
  value !== undefined && value !== null && value !== ""
    ? Number(value)
    : undefined

// Tab screens keep their params: every My Wrong Note param is cleared once consumed and on blur.
const CLEARED_WRONG_NOTE_PARAMS = {
  wrongNoteQuestionSuperId: undefined,
  wrongNoteNoteId: undefined,
  wrongNoteReadOnly: undefined,
  wrongNoteRejectReason: undefined,
  wrongNoteReviewerName: undefined,
  wrongNoteReviewedAt: undefined,
  returnTo: undefined,
  returnParams: undefined
}

const ExamResultScreen = ({ route, navigation }: Props) => {
  const isFocused = useIsFocused()
  const params = route?.params as ExamResultParams | undefined
  const examCode = params?.examCode
  const studentExamSessionId = params?.studentExamSessionId
  const examSessionId = params?.examSessionId
  const wrongNoteQuestionSuperId = toNumber(params?.wrongNoteQuestionSuperId)
  const wrongNoteNoteId = toNumber(params?.wrongNoteNoteId)
  const wrongNoteReadOnly = params?.wrongNoteReadOnly === true
  const wrongNoteRejectReason = params?.wrongNoteRejectReason
  const wrongNoteReviewerName = params?.wrongNoteReviewerName
  const wrongNoteReviewedAt = params?.wrongNoteReviewedAt

  // returnTo outlives the one-shot param clearing so onClose can still use it; dropped on blur.
  const returnToRef = useRef<string | undefined>(undefined)
  if (params?.returnTo) returnToRef.current = params.returnTo

  // A hub hand-over is in progress from the moment returnTo arrives until blur / close.
  const [isWrongNoteHandover, setWrongNoteHandover] = useState(false)
  useEffect(() => {
    if (params?.returnTo) setWrongNoteHandover(true)
  }, [params?.returnTo])

  const clearWrongNoteParams = useCallback(() => {
    try {
      navigation?.setParams?.(CLEARED_WRONG_NOTE_PARAMS as object)
    } catch (_e) {
      // screen may already be unmounting
    }
  }, [navigation])

  useFocusEffect(
    useCallback(
      () => () => {
        returnToRef.current = undefined
        setWrongNoteHandover(false)
        clearWrongNoteParams()
      },
      [clearWrongNoteParams]
    )
  )

  return (
    <ExamResult
      examCode={examCode}
      studentExamSessionId={studentExamSessionId}
      examSessionId={examSessionId}
      wrongNoteQuestionSuperId={wrongNoteQuestionSuperId}
      wrongNoteNoteId={wrongNoteNoteId}
      wrongNoteReadOnly={wrongNoteReadOnly}
      wrongNoteRejectReason={wrongNoteRejectReason}
      wrongNoteReviewerName={wrongNoteReviewerName}
      wrongNoteReviewedAt={wrongNoteReviewedAt}
      isWrongNoteHandover={isWrongNoteHandover}
      isScreenFocused={isFocused}
      showPendingLoader
      onWrongNoteConsumed={clearWrongNoteParams}
      onClose={() => {
        const returnTo = returnToRef.current
        setWrongNoteHandover(false)
        if (returnTo) {
          // No returnParams: the hub tab stays mounted with its selection.
          returnToRef.current = undefined
          navigate(returnTo)
          return
        }
        try {
          goBack()
        } catch (_e) {
          navigate(Routes.Auth.Home)
        }
      }}
    />
  )
}

export default ExamResultScreen
