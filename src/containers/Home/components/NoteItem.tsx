import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { Text, View, TouchableOpacity } from 'react-native'
import { ScheduleResponse, ScheduleStatus, ScheduleType } from '../configs/type'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import { Button } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import CustomTooltip from '@/components/Tooltip/CustomTooltip'
import { Action } from '@/utils/types'

type Props = {
  schedule: ScheduleResponse
  openTooltipList: number | boolean
  idx: number
  handleOpenTooltip: (index: number) => void
  handleCloseTooltip: () => void
  handleCheckInLesson: (schedule: ScheduleResponse) => Promise<void>
  handleOpenConfirmDeleteDialog: (schedule?: ScheduleResponse | undefined) => void
  handleOpenScheduleDialog: (schedule?: ScheduleResponse | undefined) => void
  handleUpdateScheduleStatus: (schedule: ScheduleResponse) => Promise<void>
}

const NoteItem = ({
  schedule,
  openTooltipList,
  idx,
  handleOpenConfirmDeleteDialog,
  handleOpenScheduleDialog,
  handleCheckInLesson,
  handleOpenTooltip,
  handleCloseTooltip,
  handleUpdateScheduleStatus
}: Props) => {
  const { t } = useTranslation()
  const startTime = timeSpanToLocalMoment(schedule.startTime, schedule.date)
  const endTime = timeSpanToLocalMoment(schedule.endTime, schedule.date)
  const enableCheckSchedule = schedule.type === ScheduleType.Personal || schedule.status === ScheduleStatus.Default

  const handleCheckSchedule = () => {
    if (!enableCheckSchedule) return
    if (schedule.type === ScheduleType.Personal) {
      handleUpdateScheduleStatus(schedule)
    } else {
      handleCheckInLesson(schedule)
    }
  }

  const renderStatus = (schedule: ScheduleResponse) => {
    switch (schedule.status) {
      case ScheduleStatus.Completed:
        return (
          <Ionicons
            style={{ width: 30, textAlign: 'center' }}
            color={palette.main[500]}
            size={20}
            name="checkmark-circle"
          />
        )
      case ScheduleStatus.Missed:
        return <Ionicons style={{ width: 30, textAlign: 'center' }} color={palette.red[900]} size={20} name="warning" />
      default:
        return (
          <View
            style={{
              borderWidth: 1,
              borderColor: palette.grey[500],
              borderStyle: 'dashed',
              borderRadius: '50%',
              width: 20,
              height: 20
            }}
          />
        )
    }
  }

  const renderTextColor = (schedule: ScheduleResponse) => {
    switch (schedule.status) {
      case ScheduleStatus.Completed:
        return palette.grey[500]
      case ScheduleStatus.Missed:
        return palette.red[900]
      default:
        return palette.grey[700]
    }
  }

  const renderTooltipMenu = () => {
    if (!schedule.id) return null

    const actions: Action<ScheduleResponse>[] = [
      {
        label: t('edit_schedule'),
        onPress: () => handleOpenScheduleDialog(schedule)
      },
      {
        label: t('delete_schedule'),
        onPress: () => handleOpenConfirmDeleteDialog(schedule),
        textStyle: {
          color: '#db4d4d'
        }
      }
    ]
    return (
      <CustomTooltip actions={actions} isVisible={openTooltipList === idx} onClose={handleCloseTooltip}>
        <TouchableOpacity onPress={() => handleOpenTooltip(idx)} style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal-sharp" size={20} color={palette.grey[700]} />
        </TouchableOpacity>
      </CustomTooltip>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Button onPress={handleCheckSchedule} disabled={!enableCheckSchedule}>
          {renderStatus(schedule)}
        </Button>
        <View style={{ gap: 8 }}>
          <Text style={styles.title}>{schedule.title}</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Text style={styles.typeText}>{t(ScheduleType[schedule.type || 0].toString()?.toLocaleLowerCase())}</Text>
            <Text style={{ ...TYPO.body1, color: renderTextColor(schedule) }}>
              {startTime?.format('HH:mm')} ~ {endTime?.format('HH:mm')}
            </Text>
          </View>
        </View>
      </View>
      {renderTooltipMenu()}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12@ms',
    backgroundColor: "#FFF",
    borderRadius: 5
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  title: {
    ...TYPO.heading3
  },
  typeText: {
    ...TYPO.body4,
    backgroundColor: palette.grey[100],
    color: palette.grey[700],
    borderRadius: '255@ms',
    paddingVertical: '2@ms',
    paddingHorizontal: '6@ms'
  },
  moreButton: {
    padding: '8@ms'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  tooltipContainer: {
    position: 'absolute',
    right: '16@ms',
    top: '50@ms',
    backgroundColor: 'white',
    borderRadius: '8@ms',
    padding: '8@ms',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  tooltipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12@ms',
    gap: '8@ms'
  },
  tooltipText: {
    ...TYPO.body2,
    color: palette.grey[700]
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
    color: palette.main[500]
  }
})

export default NoteItem
