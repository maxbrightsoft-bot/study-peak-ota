import { palette, TYPO } from '@/theme'
import React from 'react'
import { ScrollView, View, StyleSheet, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-paper'
import CalendarSchedule from './components/CalendarSchedule'
import ModalExamCode from './components/Dialog/ModalExamCode'
import useProblemSolving from './hooks/useProblemSolving'
import ArrowRight from '@/assets/iconJSX/arrowRight'
import Verify from '@/assets/iconJSX/verify'
import CustomCard from '@/components/Card/CustomCard'
import WaitingExamStart from './components/Dialog/WaitingExamStart'
import ConfirmExamCode from './components/Dialog/ConfirmExamCode'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import ExamHistoryDialog from './components/Dialog/ExamHistoryDialog'
import { ScheduleStatus } from './configs/type'
import RecentTextbook from './components/RecentTextbook'

const Home = () => {
  const {
    t,
    open,
    user,
    schedules,
    codeExam,
    scrollRef,
    setCodeExam,
    openCloseModal,
    openSchedule,
    openConfirmDialog,
    examSession,
    openExamHistoryDialog,
    handleOpenExamHistoryDialog,
    handleCloseExamHistoryDialog,
    selectedSchedule,
    enableCheckSchedule,
    handleCheckSchedule,
    handleGetInfoExam,
    handleCloseConfirmDialog,
    handleToggleSchedule,
    handleCodeExam,
    isCheckTeacherStart
  } = useProblemSolving()

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollRef} style={{ backgroundColor: palette.main[600] }}>
        <View style={styles.container}>
          <TouchableOpacity
            onPress={handleToggleSchedule}
            style={{
              ...styles.card,
              backgroundColor: palette.grey[100],
              paddingVertical: 14,
              paddingHorizontal: 15,
              marginBottom: 24
            }}
          >
            <View style={styles.rowBetween}>
              <Text style={{ fontSize: 12, fontWeight: 500, color: palette.grey[900] }}>오늘의 스케줄</Text>
              <ArrowRight color={palette.grey[500]} />
            </View>

            {schedules?.map((schedule, index) => (
              <View key={index} style={styles.scheduleRow}>
                <View style={styles.dot}></View>
                <Text style={styles.bold}>{schedule.title}</Text>
                <Text style={styles.time}>
                  {timeSpanToLocalMoment(schedule.startTime, schedule.date)?.format('HH:mm')} ~{' '}
                  {timeSpanToLocalMoment(schedule.endTime, schedule.date)?.format('HH:mm')}
                </Text>
              </View>
            ))}
          </TouchableOpacity>

          {user?.academyDomain && <View style={{ ...styles.row, marginBottom: 28, gap: 14 }}>
            <CustomCard
              style={[
                styles.card,
                styles.half,
                {
                  flex: 1
                }
              ]}
            >
              <View
                style={{
                  paddingHorizontal: 15,
                  paddingVertical: 16,
                  height: '100%',
                  justifyContent: 'space-between'
                }}
              >
                <View style={{}}>
                  <Text style={{ fontSize: 12, fontWeight: 400, marginBottom: 19 }}>오늘의 출석</Text>
                  <Text style={{ ...styles.bold, fontSize: 16 }}>수학 심화반</Text>
                  {selectedSchedule && (
                    <Text style={styles.time}>
                      {timeSpanToLocalMoment(selectedSchedule.startTime, selectedSchedule.date)?.format('HH:mm')} ~{' '}
                      {timeSpanToLocalMoment(selectedSchedule.endTime, selectedSchedule.date)?.format('HH:mm')}
                    </Text>
                  )}
                </View>
                <TouchableOpacity
                  style={[
                    styles.attendBtn,
                    {
                      backgroundColor:
                        selectedSchedule?.status === ScheduleStatus.Completed ? palette.sub[400] : palette.grey[200]
                    }
                  ]}
                  onPress={handleCheckSchedule}
                  disabled={!enableCheckSchedule}
                >
                  <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ padding: 4 }}>
                      <Verify
                        color={selectedSchedule?.status === ScheduleStatus.Completed ? '#FFF' : palette.grey[400]}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: selectedSchedule?.status === ScheduleStatus.Completed ? '#FFF' : palette.grey[400]
                      }}
                    >
                      출석하기
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </CustomCard>

            <View style={styles.half}>
              <CustomCard style={{ ...styles.card, paddingHorizontal: 12, paddingVertical: 15, width: '100%' }}>
                <Text style={{ fontSize: 12 }}>새로운 시험</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#F6F6F6', padding: 12, borderRadius: 10, marginTop: 6 }}
                  onPress={() => openCloseModal()}
                >
                  <Text style={{ fontSize: 14, fontWeight: 400, color: '#C0C0C0' }}>시험코드 입력</Text>
                </TouchableOpacity>
              </CustomCard>
              <View style={{ height: 12 }} />

              <CustomCard style={[styles.card, { paddingHorizontal: 12, paddingVertical: 15, width: '100%' }]}>
                <Text style={{ fontSize: 12, fontWeight: 400, color: '#2E2E2E', marginBottom: 6 }}>지난 시험</Text>
                <TouchableOpacity onPress={handleOpenExamHistoryDialog}>
                  <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={{ fontSize: 16, fontWeight: 600, color: '#36BFEC', lineHeight: 24, paddingVertical: 6 }}>
                      지난 시험 풀기
                    </Text>
                    <ArrowRight color="#E2F4FC" />
                  </View>
                </TouchableOpacity>
              </CustomCard>
            </View>
          </View>}
          <View style={{ marginBottom: 28 }}>
            <RecentTextbook />
          </View>
        </View>
        {openSchedule && <CalendarSchedule isVisible={openSchedule} onClose={handleToggleSchedule} />}
      </ScrollView>
      <ModalExamCode
        codeExam={codeExam}
        setCodeExam={setCodeExam}
        open={open}
        onClose={() => openCloseModal()}
        handleGetInfoExam={handleGetInfoExam}
      />
      <ConfirmExamCode
        codeExam={codeExam}
        open={openConfirmDialog}
        examSession={examSession}
        onClose={handleCloseConfirmDialog}
        handleCodeExam={handleCodeExam}
      />
      {isCheckTeacherStart && <WaitingExamStart visible={isCheckTeacherStart} onClose={() => openCloseModal(false)} />}
      <ExamHistoryDialog t={t} open={openExamHistoryDialog} onClose={handleCloseExamHistoryDialog} />
    </View>
  )
}

export default Home
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: palette.grey[50],
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  card: {
    borderRadius: 14
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  half: {
    flex: 1
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6
  },
  dot: {
    marginRight: 6,
    width: 4,
    height: 4,
    borderRadius: '50%',
    backgroundColor: palette.main[300]
  },
  bold: {
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
    color: '#222222',
    lineHeight: 22
  },
  time: {
    color: palette.grey[400],
    fontSize: 13,
    fontWeight: 400
  },
  attendBtn: {
    alignSelf: 'flex-end',
    borderRadius: 26,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: palette.grey[200]
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12
  },
  progress: {
    flex: 1,
    height: 6,
    borderRadius: 4
  }
})
