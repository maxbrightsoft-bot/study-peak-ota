import TextbookChapterResultView from '@/containers/TextbookChapterResult/views'

type Props = {
  open: boolean
  onClose: () => void
  chapterId?: number
}

const TextbookChapterResultDialog = ({ open, onClose, chapterId }: Props) => {
  return (
    <TextbookChapterResultView
      open={open}
      onClose={onClose}
      chapterId={chapterId}
    />
  )
}

export default TextbookChapterResultDialog
