import { Text, TouchableOpacity, View } from 'react-native'
import NoteItem from './NoteItem'
import { palette } from '@/theme'
import { ScheduleFormData, ScheduleResponse } from '../configs/type'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import CreateNewScheduleConfirmDialog from './Dialog/CreateNewScheduleConfirmDialog'
import CreateNewScheduleDialog from './Dialog/CreateNewScheduleDialog'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  loading: boolean
  schedules?: ScheduleResponse[]
  openTooltipList: number | boolean
  handleOpenTooltip: (index: number) => void
  handleCloseTooltip: () => void
  selectedSchedule?: ScheduleResponse
  scheduleRequest?: ScheduleFormData
  handleCheckInLesson: (schedule: ScheduleResponse) => Promise<void>
  isOpenConfirmDialog: boolean
  isOpenScheduleDialog: boolean
  handleCloseConfirmDialog: () => void
  handleOpenConfirmDialog: (schedule?: ScheduleResponse | undefined) => void
  handleOpenScheduleDialog: (schedule?: ScheduleResponse | undefined) => void
  isOpenConfirmDeleteDialog: boolean
  handleCloseScheduleDialog: () => void
  handleCloseConfirmDeleteDialog: () => void
  handleOpenConfirmDeleteDialog: (schedule?: ScheduleResponse | undefined) => void
  handleSubmitSchedule: () => Promise<void>
  handleDeleteSchedule: () => void
  handleSetSchedule: (values?: ScheduleFormData | undefined) => void
  handleUpdateScheduleStatus: (schedule: ScheduleResponse) => Promise<void>
}

const NoteEvent = (noteProps: Props) => {
  const {
    t,
    loading,
    schedules,
    openTooltipList,
    handleOpenTooltip,
    handleCloseTooltip,
    selectedSchedule,
    handleSetSchedule,
    handleCheckInLesson,
    isOpenConfirmDialog,
    isOpenScheduleDialog,
    handleCloseConfirmDeleteDialog,
    handleCloseConfirmDialog,
    handleOpenScheduleDialog,
    handleOpenConfirmDialog,
    isOpenConfirmDeleteDialog,
    handleCloseScheduleDialog,
    handleOpenConfirmDeleteDialog,
    handleSubmitSchedule,
    handleDeleteSchedule,
    scheduleRequest,
    handleUpdateScheduleStatus
  } = noteProps
  return (
    <View style={{ marginTop: 16, padding: 8, borderRadius: 8, borderColor: palette.grey[300], borderWidth: 1, backgroundColor: palette.grey[50] }}>
      <View style={{ gap: 8}}>
        {schedules?.map((schedule, index) => (
          <NoteItem
            key={index}
            openTooltipList={openTooltipList}
            schedule={schedule}
            idx={index}
            handleOpenTooltip={handleOpenTooltip}
            handleCloseTooltip={handleCloseTooltip}
            handleCheckInLesson={handleCheckInLesson}
            handleOpenConfirmDeleteDialog={handleOpenConfirmDeleteDialog}
            handleOpenScheduleDialog={handleOpenScheduleDialog}
            handleUpdateScheduleStatus={handleUpdateScheduleStatus}
          />
        ))}
        {!schedules?.length && (
          <View style={styles.container}>
            <Text style={[styles.noScheduleText, { color: palette.grey[500] }]}>{t('there_is_no_schedule')}</Text>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  borderColor: palette.main[300]
                }
              ]}
              onPress={() => handleOpenScheduleDialog()}
            >
              <Ionicons name="add-circle" size={20} color={palette.main[500]} />
              <Text style={[styles.buttonText, { color: palette.main[500] }]}>{t('new_schedule')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <CreateNewScheduleDialog
        open={isOpenScheduleDialog}
        onClose={handleCloseScheduleDialog}
        t={t}
        onSubmit={(values) => {
          handleCloseScheduleDialog()
          handleOpenConfirmDialog()
          handleSetSchedule(values)
        }}
        schedule={selectedSchedule}
      />
      <ConfirmDialog
        open={!!selectedSchedule && isOpenConfirmDeleteDialog}
        toggle={handleCloseConfirmDeleteDialog}
        text={t('are_you_sure_you_want_to_delete_the_schedule', {
          name: selectedSchedule?.title
        })}
        confirmText={selectedSchedule?.title}
        onConfirm={handleDeleteSchedule}
        isDelete
      />
      <CreateNewScheduleConfirmDialog
        loading={loading}
        open={isOpenConfirmDialog}
        onClose={() => {
          handleCloseConfirmDialog()
          handleOpenScheduleDialog()
        }}
        t={t}
        isUpdate={true}
        newSchedule={scheduleRequest}
        onSubmit={handleSubmitSchedule}
      />
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center'
  },
  noScheduleText: {
    fontWeight: '600',
    fontSize: '13@ms',
    lineHeight: '14@ms',
    marginBottom: '12@vs'
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: '8@vs',
    paddingHorizontal: '12@s'
  },
  buttonText: {
    fontWeight: '700',
    fontSize: '13@ms',
    lineHeight: '14@ms',
    marginLeft: '8@s'
  },
  icon: {
    marginRight: '8@s'
  }
})

export default NoteEvent
