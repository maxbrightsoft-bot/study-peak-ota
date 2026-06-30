import ArrowRight from '@/assets/iconJSX/arrowRight'
import Verify from '@/assets/iconJSX/verify'
import CustomCard from '@/components/Card/CustomCard'
import TextTooltip from '@/components/Tooltip/TextTooltip'
import WaitingExamStart from '../components/Dialog/WaitingExamStart'
import ConfirmExamCode from '../components/Dialog/ConfirmExamCode'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import ExamHistoryDialog from '../components/Dialog/ExamHistoryDialog'
import { ScheduleStatus } from '../configs/type'
import RecentTextbook from '../components/RecentTextbook'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import CalendarSchedule from '../components/CalendarSchedule'
import ModalExamCode from '../components/Dialog/ModalExamCode'
import { palette } from '@/theme'
import useProblemSolving from '../hooks/useProblemSolving'
import StudyTimerCard from '../components/StudyTimerCard'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { useTranslation } from 'react-i18next'

const AcademyView = () => {
  const { t } = useTranslation()
  const {
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
    isCheckTeacherStart,
    receivedPopQuiz,
    receivedPopQuizzes
  } = useProblemSolving()

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        ref={scrollRef}
        style={{ backgroundColor: palette.grey[50] }}
      >
        <View style={{ position: 'absolute', top: -1000, left: 0, right: 0, height: 1200, backgroundColor: palette.main[600] }} />
        <View style={styles.container}>
            <View style={{ marginBottom: 28 }}>
              <StudyTimerCard />
            </View>

          {user?.academyDomain && <View style={{ ...styles.row, marginBottom: 28, gap: 14 }}>
            <CustomCard
              containerStyle={[
                styles.half,
                {
                  flex: 1
                }
              ]}
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
                  flex: 1,
                  justifyContent: 'space-between'
                }}
              >
                <View style={{}}>
                  <Text style={{ fontSize: 12, fontWeight: 400, marginBottom: 19, color: palette.grey[500] }}>{t('today_attendance')}</Text>
                  <TextTooltip
                    text={selectedSchedule ? selectedSchedule.title : t('no_class_today')}
                    numberOfLines={2}
                    placement="top"
                    textStyle={{ fontWeight: '600', fontSize: 16, color: palette.grey[500], lineHeight: 22 }}
                  />
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

          <View style={styles.popQuizSectionContainer}>
            <View style={styles.popQuizHeaderRow}>
              <Text style={styles.popQuizHeaderTitle}>{t('received_pop_quiz')}</Text>
              <TouchableOpacity onPress={() => navigate(Routes.Auth.PopQuiz as any)}>
                <Text style={styles.popQuizViewAll}>{t('view_all') || '전체보기'}</Text>
              </TouchableOpacity>
            </View>

            {receivedPopQuizzes && receivedPopQuizzes.length > 0 ? (
              <View style={{ gap: 8, marginTop: 10 }}>
                {receivedPopQuizzes.map((item: any, idx: number) => (
                  <TouchableOpacity
                    key={item.id || item.code || idx}
                    style={styles.popQuizItemCard}
                    onPress={() => navigate(Routes.Auth.PopQuizIntro as any, { code: item.code })}
                    activeOpacity={0.8}
                  >
                    <View style={styles.popQuizItemIconWrapper}>
                      <Ionicons name="bulb" size={16} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.popQuizItemTitle} numberOfLines={1}>
                        {item.title || t('pop_quiz_review')}
                      </Text>
                      <Text style={styles.popQuizItemDesc} numberOfLines={1}>
                        {item.solveTarget !== undefined && item.solveTarget !== null
                          ? t(
                              item.solveTarget === 0 ? 'pop_quiz_review_desc_child' :
                              item.solveTarget === 1 ? 'pop_quiz_review_desc_friend' :
                              item.solveTarget === 2 ? 'pop_quiz_review_desc_group' :
                              'pop_quiz_review_desc_myself',
                              { count: item.questionCount ?? item.totalQuestions ?? 0 }
                            )
                          : t('pop_quiz_review_desc', { author: item.authorName || '', count: item.questionCount ?? item.totalQuestions ?? 0 })
                        }
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color={palette.grey[400]} />
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.popQuizItemCard, { marginTop: 10 }]}
                onPress={() => navigate(Routes.Auth.PopQuiz as any)}
                activeOpacity={0.8}
              >
                <View style={styles.popQuizItemIconWrapper}>
                  <Ionicons name="bulb" size={16} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.popQuizItemTitle}>{t('pop_quiz')}</Text>
                  <Text style={styles.popQuizItemDesc}>{t('no_received_pop_quiz')}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={palette.grey[400]} />
              </TouchableOpacity>
            )}
          </View>

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
    justifyContent: 'space-between',
    marginTop: '8@ms',
    minHeight: '22@ms'
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: '12@ms',
    gap: '6@ms'
  },
  dot: {
    width: '4@ms',
    height: '4@ms',
    borderRadius: '2@ms',
    backgroundColor: palette.main[300]
  },
  bold: {
    fontWeight: '600',
    fontSize: '14@ms',
    color: '#222222',
    flex: 1,
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  time: {
    color: palette.grey[400],
    fontSize: '13@ms',
    fontWeight: '400',
    flexShrink: 0,
    includeFontPadding: false,
    textAlignVertical: 'center'
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
  },
  popQuizSectionContainer: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '16@ms',
    marginBottom: '28@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  popQuizHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '4@ms'
  },
  popQuizHeaderTitle: {
    fontSize: '15@ms',
    fontWeight: 'bold',
    color: '#222222',
  },
  popQuizViewAll: {
    fontSize: '12@ms',
    color: palette.main[600],
    fontWeight: '500',
  },
  popQuizItemCard: {
    backgroundColor: palette.grey[50] || '#F9FAFB',
    borderRadius: '12@ms',
    padding: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
  },
  popQuizItemIconWrapper: {
    backgroundColor: palette.main[600],
    borderRadius: '10@ms',
    width: '32@ms',
    height: '32@ms',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: '10@ms',
  },
  popQuizItemTitle: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: '#333333',
    marginBottom: '2@ms',
  },
  popQuizItemDesc: {
    fontSize: '11@ms',
    color: palette.grey[500],
  },
})