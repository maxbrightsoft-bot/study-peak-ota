import ArrowRight from '@/assets/iconJSX/arrowRight'
import CustomCard from '@/components/Card/CustomCard'
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
import useHomeNotice from '../hooks/useHomeNotice'
import StudyTimerCard from '../components/StudyTimerCard'
import Notice from '@/containers/Notice/view'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'
import useAuthStore from '@/store/useAuthStore'
import { Ionicons } from '@expo/vector-icons'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'
import { useTranslation } from 'react-i18next'

const AcademyView = () => {
  const { t } = useTranslation()
  const selectedAcademy = useAuthStore(state => state.selectedAcademy)
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

  const {
    recentNotice,
    unreadNoticeCount,
    openNoticeDialog,
    handleOpenNoticeDialog,
    handleCloseNoticeDialog
  } = useHomeNotice()

  const scheduleTime = selectedSchedule
    ? timeSpanToLocalMoment(selectedSchedule.startTime, selectedSchedule.date)?.format('HH:mm')
    : ''
  const classTitle = selectedSchedule
    ? (scheduleTime && !selectedSchedule.title?.includes(scheduleTime)
        ? `${scheduleTime} ${selectedSchedule.title}`
        : selectedSchedule.title)
    : t('no_class_today')

  const teacherText = selectedSchedule?.teacherName
    ? (t('teacher_n', { teacher: selectedSchedule.teacherName }) || `${selectedSchedule.teacherName} ${t('teacher')}`)
    : ''

  const scheduleSubtitle = selectedSchedule
    ? [
        selectedSchedule?.room || selectedSchedule?.classroom,
        teacherText
      ].filter(Boolean).join(' · ') ||
      (selectedSchedule.startTime && selectedSchedule.endTime
        ? `${timeSpanToLocalMoment(selectedSchedule.startTime, selectedSchedule.date)?.format('HH:mm')} ~ ${timeSpanToLocalMoment(selectedSchedule.endTime, selectedSchedule.date)?.format('HH:mm')}`
        : '')
    : ''

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        ref={scrollRef}
        style={{ backgroundColor: palette.grey[50] }}
      >
        <View style={{ position: 'absolute', top: -1000, left: 0, right: 0, height: 1200, backgroundColor: palette.main[600] }} />
        <View style={styles.container}>
          <View style={{ marginBottom: 20 }}>
            <StudyTimerCard />
          </View>

          {(user?.academyDomain || selectedAcademy?.domain) && (
            <View style={{ marginBottom: 28 }}>
              <View style={styles.cardsRow}>
                {/* Attendance Card */}
                <CustomCard
                  onPress={handleToggleSchedule}
                  containerStyle={styles.half}
                  style={styles.cardBox}
                  radius={18}
                >
                  <View style={styles.attendCardContent}>
                    <View style={{ flexShrink: 1 }}>
                      <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={styles.classTitle}
                      >
                        {classTitle}
                      </Text>
                      {!!scheduleSubtitle && (
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          style={styles.classSubtitle}
                        >
                          {scheduleSubtitle}
                        </Text>
                      )}
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.attendBtn,
                        {
                          backgroundColor:
                            selectedSchedule?.status === ScheduleStatus.Completed
                              ? palette.success.lighter
                              : '#36BFEC'
                        }
                      ]}
                      onPress={selectedSchedule ? handleCheckSchedule : handleToggleSchedule}
                      disabled={!enableCheckSchedule && !!selectedSchedule}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.attendBtnText,
                          selectedSchedule?.status === ScheduleStatus.Completed && {
                            color: palette.success.darker
                          }
                        ]}
                      >
                        {selectedSchedule?.status === ScheduleStatus.Completed
                          ? t('attendance_completed') || '출석 완료'
                          : t('check_in') || '출석하기'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </CustomCard>

                {/* Notice Card */}
                <CustomCard
                  onPress={handleOpenNoticeDialog}
                  containerStyle={styles.half}
                  style={styles.cardBox}
                  radius={18}
                >
                  <View style={styles.noticeCardContent}>
                    <View>
                      <View style={styles.noticeHeader}>
                        <View style={styles.noticeHeaderLeft}>
                          <Text style={styles.noticeHeaderTitle}>
                            {t('notice') || '공지사항'}
                          </Text>
                          <View
                            style={[
                              styles.unreadBadge,
                              unreadNoticeCount === 0 && styles.zeroBadge
                            ]}
                          >
                            <Text
                              style={[
                                styles.unreadBadgeText,
                                unreadNoticeCount === 0 && styles.zeroBadgeText
                              ]}
                            >
                              {unreadNoticeCount > 99 ? '99+' : unreadNoticeCount}
                            </Text>
                          </View>
                        </View>
                        <ArrowRight width={20} height={20} color="#9CA3AF" />
                      </View>

                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={styles.noticeTitle}
                      >
                        {recentNotice?.name || recentNotice?.content || t('no_notice')}
                      </Text>
                    </View>
                    {recentNotice ? (
                      <Text numberOfLines={1} style={styles.noticeFooter}>
                        {moment(recentNotice.createdAt).format('M/D')}
                        {unreadNoticeCount > 0
                          ? ` · ${t('notices_left', { count: unreadNoticeCount })}`
                          : ''}
                      </Text>
                    ) : null}
                  </View>
                </CustomCard>
              </View>

              <View style={styles.compactRow}>
                <CustomCard
                  containerStyle={styles.half}
                  style={styles.compactCard}
                  radius={16}
                  onPress={() => openCloseModal()}
                >
                  <View style={styles.examCodeBox}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={styles.examCodeText}
                    >
                      {t('enter_exam_code') || '시험 코드 입력'}
                    </Text>
                  </View>
                </CustomCard>

                {/* Right Card: 지난 시험 풀기 */}
                <CustomCard
                  containerStyle={styles.half}
                  style={styles.compactCard}
                  radius={16}
                  onPress={handleOpenExamHistoryDialog}
                >
                  <View style={styles.pastExamBox}>
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[styles.pastExamText, { flexShrink: 1 }]}
                    >
                      {t('solve_past_exam')}
                    </Text>
                    <ArrowRight width={20} height={20} color="#36BFEC" />
                  </View>
                </CustomCard>
              </View>
            </View>
          )}

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
      <Notice open={openNoticeDialog} onClose={handleCloseNoticeDialog} />
    </View>
  )
}

export default AcademyView

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    paddingVertical: '20@ms',
    paddingHorizontal: '20@ms',
    backgroundColor: palette.grey[50],
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms'
  },
  half: {
    flex: 1
  },
  cardsRow: {
    flexDirection: 'row',
    gap: '12@ms'
  },
  cardBox: {
    borderRadius: '18@ms',
    backgroundColor: '#FFFFFF',
    minHeight: '148@ms'
  },
  attendCardContent: {
    paddingHorizontal: '14@ms',
    paddingVertical: '16@ms',
    flex: 1,
    justifyContent: 'center',
    gap: '12@ms',
  },
  noticeCardContent: {
    paddingHorizontal: '14@ms',
    paddingVertical: '16@ms',
    flex: 1,
  },
  classTitle: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: '22@ms',
    includeFontPadding: false
  },
  classSubtitle: {
    fontSize: '12@ms',
    fontWeight: '400',
    color: '#6B7280',
    marginTop: '4@ms',
    includeFontPadding: false
  },
  attendBtn: {
    alignSelf: 'center',
    paddingVertical: '14@ms',
    paddingHorizontal: '30@ms',
    borderRadius: '22@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  attendBtnText: {
    fontSize: '15@ms',
    fontWeight: 'bold',
    color: '#FFFFFF',
    includeFontPadding: false
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  noticeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  noticeHeaderTitle: {
    fontSize: '14@ms',
    fontWeight: 'bold',
    color: '#374151',
    includeFontPadding: false
  },
  unreadBadge: {
    backgroundColor: '#EB4D3D',
    minWidth: '18@ms',
    height: '18@ms',
    borderRadius: '9@ms',
    paddingHorizontal: '4@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: '11@ms',
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false
  },
  zeroBadge: {
    backgroundColor: '#9CA3AF'
  },
  zeroBadgeText: {
    color: '#FFFFFF'
  },
  noticeTitle: {
    fontSize: '16@ms',
    fontWeight: 'bold',
    color: '#000000',
    lineHeight: '22@ms',
    marginTop: '10@ms',
    includeFontPadding: false
  },
  noticeFooter: {
    fontSize: '12@ms',
    fontWeight: '400',
    color: '#9CA3AF',
    marginTop: '6@ms',
    includeFontPadding: false
  },
  compactRow: {
    flexDirection: 'row',
    gap: '12@ms',
    marginTop: '12@ms'
  },
  compactCard: {
    borderRadius: '16@ms',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '11@ms',
    paddingVertical: '18@ms',
    minHeight: '62@ms',
    justifyContent: 'center'
  },
  examCodeBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: '10@ms',
    height: '42@ms',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '8@ms'
  },
  examCodeText: {
    fontSize: '14@ms',
    fontWeight: '400',
    color: '#A0A0A0',
    includeFontPadding: false
  },
  pastExamBox: {
    height: '42@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '8@ms'
  },
  pastExamText: {
    fontSize: '15@ms',
    fontWeight: 'bold',
    color: '#36BFEC',
    includeFontPadding: false
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
  }
})