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
    marginHorizontal: '-24@ms',
    marginTop: '-24@ms',
  },
  centered: {
    height: '120@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: '14@ms',
    color: palette.grey[400],
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: '12@ms',
  },
  button: {
    marginBottom: '-24@ms',
    paddingHorizontal: '16@ms',
    paddingVertical: '14@ms',
    borderRadius: '12@ms',
  },
  text: {
    color: palette.main[600],
    fontSize: '14@ms',
    lineHeight: '22@ms',
    fontWeight: '500',
  },
})

export default TextbookChapterResultDialog
