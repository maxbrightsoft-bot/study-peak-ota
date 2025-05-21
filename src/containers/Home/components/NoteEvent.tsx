import { Text, View } from 'react-native'
import NoteItem from './NoteItem'
import { palette, TYPO } from '@/theme'
import { ScheduleFormData, ScheduleResponse } from '../configs/type'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import CreateNewScheduleConfirmDialog from './Dialog/CreateNewScheduleConfirmDialog'
import CreateNewScheduleDialog from './Dialog/CreateNewScheduleDialog'

type Props = {
  t: any
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
  handleEditSchedule: () => Promise<void>
  handleDeleteSchedule: () => void
  handleSetSchedule: (values?: ScheduleFormData | undefined) => void
  handleUpdateScheduleStatus: (schedule: ScheduleResponse) => Promise<void>
}

const NoteEvent = (noteProps: Props) => {
  const {
    t,
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
    handleEditSchedule,
    handleDeleteSchedule,
    scheduleRequest,
    handleUpdateScheduleStatus
  } = noteProps
  return (
    <View style={{ marginTop: 16, padding: 8, borderRadius: 8, borderColor: palette.grey[300], borderWidth: 1 }}>
      <View>
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
          <Text style={{ ...TYPO.caption, color: palette.grey[500], textAlign: 'center' }}>{t('no_data')}</Text>
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
        open={isOpenConfirmDialog}
        onClose={() => {
          handleCloseConfirmDialog()
          handleOpenScheduleDialog()
        }}
        t={t}
        isUpdate={true}
        newSchedule={scheduleRequest}
        onSubmit={handleEditSchedule}
      />
    </View>
  )
}

export default NoteEvent
