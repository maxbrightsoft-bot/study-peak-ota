import { ScrollView, Text, View } from 'react-native'
import NoteItem from './NoteItem'
import { palette, TYPO } from '@/theme'
import { ScheduleFormData, ScheduleResponse } from '../configs/type'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import CreateNewScheduleDialog from './Dialog/CreateNewScheduleDialog'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'

type Props = {
  t: any
  loading?: boolean
  schedules?: ScheduleResponse[]
  openTooltipList: number | boolean
  handleOpenTooltip: (index: number) => void
  handleCloseTooltip: () => void
  selectedSchedule?: ScheduleResponse
  handleCreateSchedule: (values: ScheduleFormData) => Promise<void>
  handleCheckInLesson: (schedule: ScheduleResponse) => Promise<void>
  isOpenScheduleDialog: boolean
  handleOpenScheduleDialog: (schedule?: ScheduleResponse | undefined) => void
  isOpenConfirmDeleteDialog: boolean
  handleCloseScheduleDialog: () => void
  handleCloseConfirmDeleteDialog: () => void
  handleOpenConfirmDeleteDialog: (schedule?: ScheduleResponse | undefined) => void
  handleDeleteSchedule: () => void
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
    handleCheckInLesson,
    handleOpenScheduleDialog,
    handleOpenConfirmDeleteDialog,
    handleUpdateScheduleStatus
  } = noteProps
  return (
      <ScrollView>
        <View
          style={{
            marginTop: 20,
            gap: 16
          }}
        >
          <Text style={styles.dateDisplayText}>{moment(selectedSchedule?.date).format('MM월 DD일')}</Text>
          <View style={{ gap: 8 }}>
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
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  dateDisplayText: {
    ...TYPO.body1,
    fontWeight: '600',
    color: '#222222'
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
