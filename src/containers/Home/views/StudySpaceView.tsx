import Verify from '@/assets/iconJSX/verify'
import CustomCard from '@/components/Card/CustomCard'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import { ScheduleStatus } from '../configs/type'
import RecentTextbook from '../components/RecentTextbook'
import { ScrollView, View, Text, TouchableOpacity } from 'react-native'
import { palette, TYPO } from '@/theme'
import useProblemSolving from '../hooks/useProblemSolving'
import Calendar from '../components/Calendar'
import useSchedule from '../hooks/useSchedule'
import NoteEvent from '../components/NoteEvent'
import CreateNewScheduleDialog from '../components/Dialog/CreateNewScheduleDialog'
import { ScaledSheet } from 'react-native-size-matters'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import StudyTimerCard from '../components/StudyTimerCard'
import { Ionicons } from '@expo/vector-icons'
import { navigate } from '@/navigators/NavigationHelpers'
import { Routes } from '@/navigators/RouteName'

const StudySpaceView = () => {
  const {
    t,
    user,
    scrollRef,
    openSchedule,
    enableCheckSchedule,
    handleCheckSchedule,
    handleToggleSchedule,
    receivedPopQuiz,
    receivedPopQuizzes
  } = useProblemSolving()

  const {
    schedules,
    selectedDate,
    openTooltipList,
    handleOpenTooltip,
    handleCloseTooltip,
    selectedSchedule,
    highlightedDays,
    getScheduleList,
    getScheduleListForNoteEvent,
    handleCheckInLesson,
    isOpenDialog: isOpenScheduleDialog,
    handleCloseDialog: handleCloseScheduleDialog,
    handleOpenDialog: handleOpenScheduleDialog,
    isOpenDialog,
    handleOpenDialog,
    handleCloseDialog,
    handleSelectDate,
    handleCreateSchedule,
    handleGetScheduleCount,
    isOpenConfirmDeleteDialog,
    handleCloseConfirmDeleteDialog,
    handleOpenConfirmDeleteDialog,
    handleDeleteSchedule,
    handleUpdateScheduleStatus
  } = useSchedule()
  
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
            <View>
              <Text style={{ fontSize: 11, color: palette.main[600], fontWeight: 500 }}>{t('schedule_detail')}</Text>
            </View>
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => handleOpenDialog()}
              activeOpacity={0.85}
            >
              <Text style={styles.fabIcon}>＋</Text>
              <Text style={styles.fabText}>{t('add_new_schedule')}</Text>
            </TouchableOpacity>

            <View style={{ marginBottom: 24 }}>
              <Calendar
                highlightedDays={highlightedDays}
                selectedDate={selectedDate}
                handleSelectDate={handleSelectDate}
                getScheduleList={getScheduleList}
                getScheduleListForNoteEvent={getScheduleListForNoteEvent}
                onScheduleCountChange={handleGetScheduleCount}
              />
              <NoteEvent
                t={t}
                schedules={schedules?.slice(0, 3)}
                selectedDate={selectedDate}
                handleCreateSchedule={handleCreateSchedule}
                openTooltipList={openTooltipList}
                handleOpenTooltip={handleOpenTooltip}
                handleCloseTooltip={handleCloseTooltip}
                selectedSchedule={selectedSchedule}
                handleCheckInLesson={handleCheckInLesson}
                isOpenScheduleDialog={isOpenScheduleDialog}
                handleOpenScheduleDialog={handleOpenScheduleDialog}
                isOpenConfirmDeleteDialog={isOpenConfirmDeleteDialog}
                handleCloseScheduleDialog={handleCloseScheduleDialog}
                handleCloseConfirmDeleteDialog={handleCloseConfirmDeleteDialog}
                handleOpenConfirmDeleteDialog={handleOpenConfirmDeleteDialog}
                handleDeleteSchedule={handleDeleteSchedule}
                handleUpdateScheduleStatus={handleUpdateScheduleStatus}
              />
            </View>

          {user?.academyDomain && (
            <View style={[styles.row, { marginBottom: 28, gap: 14 }]}>
              <CustomCard
                containerStyle={[styles.half, { flex: 1 }]}
                style={[styles.card, styles.half, { flex: 1 }]}
              >
                <View style={{ paddingHorizontal: 15, paddingVertical: 16, flex: 1, justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ fontSize: 12, fontWeight: 400, marginBottom: 19 }}>{t('today_attendance')}</Text>
                    <Text style={{ fontWeight: '600', fontSize: 16, color: '#222222', lineHeight: 22 }}>{selectedSchedule ? selectedSchedule.title : t('no_class_today')}</Text>
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
                        <Verify color={selectedSchedule?.status === ScheduleStatus.Completed ? palette.grey[400] : '#FFF'} />
                      </View>
                      <Text style={{ fontSize: 14, fontWeight: 500, color: selectedSchedule?.status === ScheduleStatus.Completed ? palette.grey[400] : '#FFF' }}>
                        {t('check_in')}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </CustomCard>
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
      </ScrollView>

      <CreateNewScheduleDialog
        open={isOpenDialog}
        onClose={() => handleCloseDialog()}
        t={t}
        selectedDate={selectedDate}
        onSubmit={(values) => {
          handleCreateSchedule(values)
          handleCloseDialog()
        }}
        schedule={selectedSchedule}
      />

      <ConfirmDialog
        open={!!selectedSchedule && isOpenConfirmDeleteDialog}
        toggle={handleCloseConfirmDeleteDialog}
        text={t('are_you_sure_you_want_to_delete_the_schedule', { name: selectedSchedule?.title })}
        confirmText={selectedSchedule?.title}
        onConfirm={handleDeleteSchedule}
        isDelete
      />
    </View>
  )
}

export default StudySpaceView

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
  half: {
    flex: 1
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
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: '4@ms',
    marginTop: '10@ms',
    marginBottom: '10@ms',
    backgroundColor: palette.main[600],
    borderRadius: '20@ms',
    paddingVertical: '7@ms',
    paddingHorizontal: '14@ms',
    shadowColor: palette.main[600],
    shadowOffset: { width: 0, height: '3@ms' },
    shadowOpacity: 0.3,
    shadowRadius: '6@ms',
    elevation: '4@ms',
  },
  fabIcon: {
    fontSize: '16@ms',
    color: '#fff',
    lineHeight: '20@ms',
  },
  fabText: {
    ...TYPO.button2,
    color: '#fff',
    fontSize: '13@ms',
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