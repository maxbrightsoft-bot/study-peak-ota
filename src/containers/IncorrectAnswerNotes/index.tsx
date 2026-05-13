import { Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import NewNoteButton from './components/NewNoteButton'
import NotesContainer from './components/NoteContainer'
import { NotesContainerProps } from './configs/interfaces'
import { palette } from '@/theme'
import { useTranslation } from 'react-i18next'

type Props = {
  onCreateNote?: () => void
  notesContainerProps: NotesContainerProps
}
const IncorrectAnswerNotes = ({ onCreateNote, notesContainerProps }: Props) => {
  const { t } = useTranslation()
  const handleCreateNote = () => {
    onCreateNote?.()
  }
  return (
    <View style={styles.container}>
      <View
        style={{
          borderRadius: 6,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#FFF',
          paddingVertical: 8,
        }}
      >
        <Text style={{ color: palette.main[600], fontSize: 16, fontWeight: 600 }}>{t('incorrect_answer_notes')}</Text>
      </View>
      <NewNoteButton onPress={handleCreateNote} />
      <NotesContainer {...notesContainerProps} />
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    gap: '12@ms'
  }
})

export default IncorrectAnswerNotes
