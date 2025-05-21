import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import NewNoteButton from './components/NewNoteButton'
import NotesContainer from './components/NoteContainer'
import { NotesContainerProps } from './configs/interfaces'

type Props = {
  onCreateNote?: () => void
  notesContainerProps: NotesContainerProps
}
const IncorrectAnswerNotes = ({ onCreateNote, notesContainerProps }: Props) => {
  const handleCreateNote = () => {
    onCreateNote?.()
  }
  return (
    <View style={styles.container}>
      <View style={styles.buttonCreate}>
        <NewNoteButton onPress={handleCreateNote}/>
      </View>
      <NotesContainer {...notesContainerProps} />
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: "24@ms",
    gap: 16,
  },
  buttonCreate: {
    marginBottom: 2
  }
})

export default IncorrectAnswerNotes
