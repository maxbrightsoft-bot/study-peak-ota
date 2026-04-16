import React, { FC, useMemo, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { getDisplayTime } from '../../configs/fn'
import { palette } from '@/theme/colors'
import { SubjectTimerResponse } from '@/utils/types'
import { TimerStatus } from '@/utils/enums'
import { ScaledSheet } from 'react-native-size-matters'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  data: SubjectTimerResponse
  seconds?: number
  loading: boolean
  activeTimerId?: number
  onStartOrPauseTimer: (data: SubjectTimerResponse, isRestart: boolean) => void
  onStopTimer: (data: SubjectTimerResponse) => void
  onEditTimer: (data: SubjectTimerResponse) => void
}

const TimerItem: FC<Props> = ({
  data,
  seconds,
  loading,
  activeTimerId,
  onStartOrPauseTimer,
  onStopTimer,
  onEditTimer
}) => {
  const { t } = useTranslation()

  const [menuVisible, setMenuVisible] = useState(false)
  const [confirmVisible, setConfirmVisible] = useState(false)

  const isStarted = data.status === TimerStatus.Started
  const isPaused = data.status === TimerStatus.Paused
  const isStopped = data.status === TimerStatus.Stopped
  const isLimited = data.limitedTimeReached

  const isPausedSameToday = isPaused && moment.utc(data.lastPauseTime).isSame(moment(), 'day')

  const displayedTime = useMemo(
    () => getDisplayTime(t, data, activeTimerId, seconds),
    [data.id, data.status, data.duration, seconds, activeTimerId, t]
  )

  const handleStartOrPauseTimer = () => {
    onStartOrPauseTimer(
      data,
      data.status !== TimerStatus.Started
        ? data.limitedTimeReached
        : false
    )
  }

  const handleMainAction = () => {
    if (isLimited && isStarted) {
      onStopTimer(data)
      return
    }

    isLimited || isStopped || (isPaused && !isPausedSameToday)
      ? handleRestart()
      : handleStartOrPauseTimer()
  }

  const handleRestart = () => {
    if (data.status === TimerStatus.Started && !data.limitedTimeReached)
      return

    onStartOrPauseTimer(data, true)
    setConfirmVisible(false)
    setMenuVisible(false)
  }

  return (
    <>
      <Pressable style={styles.row} disabled={loading} onPress={handleMainAction}>
        <View style={styles.left}>
          <Text style={styles.subjectInactive}>{data.name}</Text>
          <Text style={[styles.timeInactive, { color: palette.grey[500] }]}>{displayedTime}</Text>
        </View>
        <View style={styles.right}>
          <Text style={[styles.timeInactive, { color: palette.main[600] }]}>{t('press_to_start')}</Text>
          {isLimited || isStopped ||
            (isPaused && !isPausedSameToday) ? <Pressable
              onPress={(e) => {
                e.stopPropagation();
                handleRestart();
              }}
              style={{
              }}
            >
            <Ionicons name={'reload'} size={16} color={palette.main[600]} />
          </Pressable> :
            <Ionicons name={'play'} size={16} color={palette.main[600]} />}
          {!isLimited &&
            !isStopped &&
            (
              !isPaused ||
              isPausedSameToday
            ) && (
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  handleRestart();
                }}
                style={{
                }}
              >
                <Ionicons name={'reload'} size={16} color={palette.main[600]} />
              </Pressable>
              // <Menu
              //   visible={menuVisible}
              //   onDismiss={() => setMenuVisible(false)}
              //   style={{ margin: 0, padding: 0 }}
              //   contentStyle={{ margin: 0, padding: 0 }}
              //   anchor={
              //     <Pressable
              //       onPress={(e) => {
              //         e.stopPropagation();
              //         setMenuVisible(true);
              //       }}
              //       hitSlop={10}
              //       style={{
              //         padding: 8,
              //         marginLeft: 4,
              //       }}
              //     >
              //       <MaterialCommunityIcons
              //         name="dots-horizontal-circle-outline"
              //         size={16}
              //         color={palette.main[600]}
              //       />
              //     </Pressable>
              //   }
              // >
              //   {(!isStarted && isLimited) || isStopped || (isPaused && !isPausedSameToday) ? (
              //     <Menu.Item title={t('restart_timer')} leadingIcon="reload" onPress={() => setConfirmVisible(true)} />
              //   ) : (
              //     <Menu.Item
              //       title={t('start_timer')}
              //       leadingIcon="play-circle"
              //       onPress={() => {
              //         setMenuVisible(false)
              //         handleMainAction()
              //       }}
              //     />
              //   )}
              //   {!isStopped && !isLimited && (!isPaused || isPausedSameToday) && (
              //     <Menu.Item title={t('restart_timer')} leadingIcon="reload" onPress={() => setConfirmVisible(true)} />
              //   )}

              //   {/* <Menu.Item
              //     title={t('updating_timeline')}
              //     leadingIcon="pencil"
              //     onPress={() => {
              //       setMenuVisible(false)
              //       onEditTimer(data)
              //     }}
              //   /> */}
              // </Menu>
            )}
        </View>
      </Pressable>
      <ConfirmDialog
        open={confirmVisible}
        toggle={() => setConfirmVisible(false)}
        onConfirm={handleRestart}
        text={t('do_you_really_want_to_reset_your_timer')}
        title={t('confirm')}
      />
    </>
  )
}

export default TimerItem

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: '6@ms',
    paddingHorizontal: '15@ms',
    backgroundColor: palette.grey[50],
    borderRadius: '8@ms',
    justifyContent: 'space-between'
  },
  subjectInactive: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
    color: '#222222',
  },
  left: {
    flexDirection: 'row',
    gap: 16
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  timeInactive: {
    fontSize: 13,
    fontWeight: '700'
  },

  activeCard: {
    backgroundColor: palette.main[500],
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  activeInfo: {
    gap: 8,
    flex: 1
  },
  subject: {
    color: '#FFF',
    fontSize: 14
  },
  time: {
    color: '#FFF',
    fontSize: 26,
    fontWeight: '600'
  },
  pauseBtn: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    borderRadius: 8
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: palette.main[300],
    justifyContent: 'center',
    alignItems: 'center'
  }
})
