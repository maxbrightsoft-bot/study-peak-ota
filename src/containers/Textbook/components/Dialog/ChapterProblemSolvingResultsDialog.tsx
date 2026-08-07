import React from 'react'
import { StyleSheet } from 'react-native'
import _ from 'lodash'
import ExamResult from '@/containers/ExamResult/views'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'

type Props = {
  open: boolean
  onClose: () => void
  t: any
  chapterId?: number
  onViewQA?: (studentId: number, sessionId?: number, questionId?: number, isTextbook?: boolean) => void
}

const ChapterProblemSolvingResultsDialog = ({ t, onClose, open, chapterId }: Props) => {
  return <ExamResult chapterId={chapterId || 0} onClose={() => navigate(Routes.Auth.Textbook)} />
}

export default ChapterProblemSolvingResultsDialog
