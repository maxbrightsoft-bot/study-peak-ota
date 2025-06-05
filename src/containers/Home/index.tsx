import { palette, TYPO } from '@/theme'
import React from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
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
  const { t, open, codeExam, setCodeExam, openCloseModal, handleCodeExam, isCheckTeacherStart, isOpenTextbookResult, handleOpenTextbookResult, handleCloseTextbookResult, selectedTextbook } = useProblemSolving()
  const { isOpenDialog, handleCloseDialog, handleOpenDialog, notification } = useDrawer()
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', paddingBottom: 40 }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={80}>
        <ScrollView>
          {!!selectedAcademy && <Notice handleOpenDialog={handleOpenDialog} />}
          <RecentTextbook handleOpenTextbookResult={handleOpenTextbookResult}/>
          <CalendarSchedule />
        </ScrollView>
      </KeyboardAvoidingView>
      <View>
        <Button
          mode="contained"
          style={{ margin: 24, paddingVertical: 6, borderRadius: 6 }}
          onPress={openCloseModal}
          buttonColor={palette.main[500]}
        >
          <View
            style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}
          >
            <Ionicons name="receipt" size={20} color="#FFF" />
            <Text style={{ ...TYPO.button1, color: '#FFF' }}>시험 시작하기</Text>
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
      <TextbookDrawer isOpen={isOpenTextbookResult} onClose={handleCloseTextbookResult} textbookId={selectedTextbook?.id}/>
      <NoticeDrawer t={t} open={!!notification && isOpenDialog} onClose={handleCloseDialog} notification={notification} />
    </ScrollView>
  )
}

export default Home
