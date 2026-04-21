import React from 'react'
import { palette, TYPO } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { Text, View, TouchableOpacity } from 'react-native'
import { ScheduleResponse, ScheduleStatus, ScheduleType } from '../configs/type'
import { timeSpanToLocalMoment } from '@/utils/helpers'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import VerifyIcon from '@/assets/iconJSX/verify'
import PencilIcon from '@/assets/iconJSX/pencil'
import TrashIcon from '@/assets/iconJSX/trash'
import BottomSheet from '@/components/ModalBase/BottomSheet'
import moment from 'moment'

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
  const enableCheckSchedule = moment(endTime).isSameOrBefore(moment()) && (schedule.type === ScheduleType.Personal || schedule.status === ScheduleStatus.Default)

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
        return <VerifyIcon color={palette.main[600]} />
      default:
        return <VerifyIcon color={palette.grey[300]} />
    }
  }

  const renderTooltipMenu = () => {
    if (!schedule.id) return null

    return (
      <BottomSheet
        isVisible={openTooltipList === idx}
        onClose={handleCloseTooltip}
        title={t('see_more')}
      >
        <View style={styles.menuContainer}>

          <TouchableOpacity
            onPress={() => handleOpenScheduleDialog(schedule)}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <PencilIcon />
            </View>

            <Text style={styles.menuText}>
              {t('edit_schedule')}
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            onPress={() => handleOpenConfirmDeleteDialog(schedule)}
            style={styles.menuItem}
            activeOpacity={0.7}
          >
            <View style={styles.iconBox}>
              <TrashIcon />
            </View>

            <Text style={[styles.menuText, styles.deleteText]}>
              {t('delete_schedule')}
            </Text>
          </TouchableOpacity>

        </View>
      </BottomSheet>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <TouchableOpacity style={{ padding: 4 }} onPress={handleCheckSchedule} disabled={!enableCheckSchedule}>
              {renderStatus(schedule)}
            </TouchableOpacity>
            <Text style={[styles.title, { textDecorationLine: schedule.status === ScheduleStatus.Completed ? 'line-through' : 'none' }]}>{schedule.title}</Text>
          </View>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            <Text style={{ fontSize: 13, color: palette.grey[400] }}>
              {startTime?.format('HH:mm')} ~ {endTime?.format('HH:mm')}
            </Text>
          </View>
        </View>
      </View>
      <TouchableOpacity onPress={() => handleOpenTooltip(idx)} style={styles.moreButton} disabled={!enableCheckSchedule}>
        <Ionicons name="ellipsis-vertical-sharp" size={20} color={palette.grey[500]} />
      </TouchableOpacity>
      {renderTooltipMenu()}
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: '14@ms',
    paddingHorizontal: '15@ms',
    backgroundColor: palette.grey[100],
    borderRadius: 14
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  title: {
    fontSize: 14,
    fontWeight: 600,
    color: "#222222"
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
  textAction: {
    fontSize: 16,
    fontWeight: 600,
    color: '#222222',
    textAlign: 'center'
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
  actionButton: {
    flexDirection: 'row',
    paddingVertical: '6@ms',
    alignItems: 'center'
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
  },
  menuContainer: {
    paddingVertical: '12@vs'
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '14@vs',
    paddingHorizontal: '24@s'
  },

  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@s',
    backgroundColor: '#F3F4F6'
  },

  menuText: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: '#222'
  },

  deleteText: {
    color: '#EF4444'
  },

  divider: {
    height: 1,
    backgroundColor: '#F1F1F1',
  }
})

export default NoteItem
