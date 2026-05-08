import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import ExamResult from '@/containers/ExamResult/views'

type Props = {
  open: boolean
  onClose: () => void
  chapterId?: number
}

const TextbookChapterResultDialog = ({ open, onClose, chapterId }: Props) => {
  return (
    open ? <ExamResult chapterId={chapterId} onClose={onClose}/> : null
  )
}

const styles = ScaledSheet.create({
  content: {
    marginHorizontal: -24,
    marginTop: -24,
  },
  centered: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: palette.grey[400],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
  },
  button: {
    marginBottom: -24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
  },
  text: {
    color: palette.main[600],
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
})

export default TextbookChapterResultDialog
