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

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#CED2DA'
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    lineHeight: 19.09,
    color: '#202B37'
  },
  closeButton: {
    padding: 8
  },
  content: {
    paddingHorizontal: 24
  },
  examResultContainer: {
    marginVertical: 24
  },
  footer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#CED2DA',
    justifyContent: 'center',
    alignItems: 'center'
  },
  cancelButton: {
    padding: 8
  },
  cancelText: {
    color: '#6B7280',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 16.71
  }
})

export default ChapterProblemSolvingResultsDialog
