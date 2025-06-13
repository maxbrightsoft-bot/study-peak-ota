import { palette, TYPO } from '@/theme'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View, StyleSheet } from 'react-native'
import { Text, Button } from 'react-native-paper'
import { Ionicons } from '@expo/vector-icons'
import Notice from './components/Notice'
import RecentTextbook from './components/RecentTextbook'
import useAuthStore from '@/store/useAuthStore'
import CalendarSchedule from './components/CalendarSchedule'
import ModalExamCode from './components/Dialog/ModalExamCode'
import useProblemSolving from './hooks/useProblemSolving'
import useDrawer from './hooks/useDrawer'
import NoticeDrawer from './components/NoticeDrawer'
import TextbookDrawer from '../Textbook/components/Dialog/TextbookDrawer'

const Home = () => {
  const { selectedAcademy } = useAuthStore()
  const {
    t,
    open,
    codeExam,
    setCodeExam,
    openCloseModal,
    handleCodeExam,
    isCheckTeacherStart,
    isOpenTextbookResult,
    handleOpenTextbookResult,
    handleCloseTextbookResult,
    selectedTextbook
  } = useProblemSolving()
  const { isOpenDialog, handleCloseDialog, handleOpenDialog, notification } = useDrawer()

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          style={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          {!!selectedAcademy && <Notice handleOpenDialog={handleOpenDialog} />}
          <RecentTextbook handleOpenTextbookResult={handleOpenTextbookResult} />
          <CalendarSchedule />

          <View style={{ marginTop: 24 }}>
            <Button mode="contained" style={styles.button} onPress={openCloseModal} buttonColor={palette.main[500]}>
              <View style={styles.buttonContent}>
                <Ionicons name="receipt" size={20} color="#FFF" />
                <Text style={styles.buttonText}>시험 시작하기</Text>
              </View>
            </Button>
          </View>

          <ModalExamCode
            codeExam={codeExam}
            setCodeExam={setCodeExam}
            open={open}
            onClose={openCloseModal}
            handleCodeExam={handleCodeExam}
            isCheckTeacherStart={isCheckTeacherStart}
          />
        </ScrollView>
      </KeyboardAvoidingView>
      <TextbookDrawer
        isOpen={isOpenTextbookResult}
        onClose={handleCloseTextbookResult}
        textbookId={selectedTextbook?.id}
      />
      <NoticeDrawer
        t={t}
        open={!!notification && isOpenDialog}
        onClose={handleCloseDialog}
        notification={notification}
      />
    </View>
  )
}

export default Home

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContainer: {
    backgroundColor: '#fff',
    paddingBottom: 40
  },
  button: {
    margin: 24,
    paddingVertical: 6,
    borderRadius: 6
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  buttonText: {
    ...TYPO.button1,
    color: '#FFF'
  }
})
