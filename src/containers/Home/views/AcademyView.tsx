import ArrowRight from '@/assets/iconJSX/arrowRight'
import Verify from '@/assets/iconJSX/verify'
import CustomCard from '@/components/Card/CustomCard'
import WaitingExamStart from '../components/Dialog/WaitingExamStart'
import ConfirmExamCode from '../components/Dialog/ConfirmExamCode'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import ExamHistoryDialog from '../components/Dialog/ExamHistoryDialog'
import { ScheduleStatus } from '../configs/type'
import RecentTextbook from '../components/RecentTextbook'
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import CalendarSchedule from '../components/CalendarSchedule'
import ModalExamCode from '../components/Dialog/ModalExamCode'
import { palette } from '@/theme'
import useProblemSolving from '../hooks/useProblemSolving'
import StudyTimerCard from '../components/StudyTimerCard'
import { ScaledSheet } from 'react-native-size-matters'

const AcademyView = () => {
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
    <View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} ref={scrollRef} style={{ backgroundColor: palette.main[600] }}>
        <View style={styles.container}>
          <View style={{ marginBottom: 28 }}>
            <StudyTimerCard />
          </View>
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
              <Text style={{ fontSize: 12, fontWeight: 500, color: palette.grey[900] }}>{t('today_schedule')}</Text>
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
                  <Text style={{ fontSize: 12, fontWeight: 400, marginBottom: 19, color: palette.grey[500] }}>{t('today_attendance')}</Text>
                  <Text style={{ ...styles.bold, fontSize: 16, color: palette.grey[500] }}>{selectedSchedule ? selectedSchedule.title : t('no_class_today')}</Text>
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
                        selectedSchedule?.status === ScheduleStatus.Completed ? palette.grey[200] : palette.sub[400]
                    }
                  ]}
                  onPress={handleCheckSchedule}
                  disabled={!enableCheckSchedule}
                >
                  <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center', alignItems: 'center' }}>
                    <View style={{ padding: 4 }}>
                      <Verify
                        color={selectedSchedule?.status === ScheduleStatus.Completed ? palette.grey[400] : '#FFF'}
                      />
                    </View>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: selectedSchedule?.status === ScheduleStatus.Completed ? palette.grey[400] : '#FFF'
                      }}
                    >
                      {t('check_in')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </CustomCard>

            <View style={styles.half}>
              <CustomCard style={{ ...styles.card, paddingHorizontal: 12, paddingVertical: 15, width: '100%' }}>
                <Text style={{ fontSize: 12, color: palette.grey[500] }}>{t('new_exam')}</Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#F6F6F6', padding: 12, borderRadius: 10, marginTop: 6 }}
                  onPress={() => openCloseModal()}
                >
                  <Text style={{ fontSize: 14, fontWeight: 400, color: '#C0C0C0' }}>{t('enter_exam_code')}</Text>
                </TouchableOpacity>
              </CustomCard>
              <View style={{ height: 12 }} />

              <CustomCard style={[styles.card, { paddingHorizontal: 12, paddingVertical: 15, width: '100%' }]}>
                <Text style={{ fontSize: 12, fontWeight: 400, color: '#2E2E2E', marginBottom: 6 }}>{t('past_exam')}</Text>
                <TouchableOpacity onPress={handleOpenExamHistoryDialog}>
                  <View style={{ justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row' }}>
                    <Text style={{ fontSize: 16, fontWeight: 600, color: '#36BFEC', lineHeight: 24, paddingVertical: 6 }}>
                      {t('solve_past_exam')}
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

export default AcademyView

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingVertical: '24@ms',
    paddingHorizontal: '20@ms',
    backgroundColor: palette.grey[50],
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
  },
  card: {
    borderRadius: '14@ms'
  },
  row: {
    flexDirection: 'row',
    gap: '12@ms'
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: '8@ms'
  },
  half: {
    flex: 1
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '6@ms'
  },
  dot: {
    marginRight: '6@ms',
    width: '4@ms',
    height: '4@ms',
    borderRadius: '50%',
    backgroundColor: palette.main[300]
  },
  bold: {
    fontWeight: '600',
    fontSize: '14@ms',
    flex: 1,
    color: '#222222',
    lineHeight: '22@ms'
  },
  time: {
    color: palette.grey[400],
    fontSize: '13@ms',
    fontWeight: 400
  },
  attendBtn: {
    alignSelf: 'flex-end',
    borderRadius: '26@ms',
    paddingVertical: '14@ms',
    paddingHorizontal: '14@ms',
    backgroundColor: palette.grey[200]
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: '8@ms'
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    marginTop: '12@ms'
  },
  progress: {
    flex: 1,
    height: '6@ms',
    borderRadius: '4@ms'
  }
})