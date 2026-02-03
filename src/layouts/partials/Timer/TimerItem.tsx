import React, { FC, useMemo, useState } from 'react'
import { View, Text, Pressable } from 'react-native'
import { Menu, Button } from 'react-native-paper'
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { getDisplayTime } from '../../configs/fn'
import { palette } from '@/theme/colors'
import { SubjectTimerResponse } from '@/utils/types'
import { TimerStatus } from '@/utils/enums'
import { ScaledSheet } from 'react-native-size-matters'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import Svg, { Circle } from 'react-native-svg'

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

  const handleMainAction = () => {
    if (isLimited && isStarted) {
      onStopTimer(data)
      return
    }

    onStartOrPauseTimer(data, !isStarted && (isLimited || isStopped || (isPaused && !isPausedSameToday)))
  }

  const handleRestart = () => {
    onStartOrPauseTimer(data, true)
    setConfirmVisible(false)
    setMenuVisible(false)
  }

  if (isStarted) {
    return (
      <View style={styles.activeCard}>
        <View style={styles.activeInfo}>
          <Text style={styles.subject}>{data.name}</Text>
          <Text style={styles.time}>{displayedTime}</Text>

          <Button
            mode="contained"
            compact
            onPress={handleMainAction}
            style={styles.pauseBtn}
            labelStyle={{ color: palette.grey[700] }}
          >
            {t('paused')}
          </Button>
        </View>

        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 16,
            backgroundColor: palette.main[300],
            padding: 8,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Ring progress={0.5} bgColor={palette.main[500]}>
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: '#000',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Ionicons name="pause" size={16} color="#FFF" />
            </View>
          </Ring>
        </View>
      </View>
    )
  }

  return (
    <>
      <Pressable style={styles.row} disabled={loading} onPress={handleMainAction}>
        <Text style={styles.subjectInactive}>{data.name}</Text>
        <View style={styles.right}>
          <Text style={[styles.timeInactive, { color: palette.grey[500] }]}>{displayedTime}</Text>
          <Ionicons
            name={isLimited || isStopped || !isPausedSameToday ? 'reload-circle' : 'play-circle'}
            size={16}
            color={palette.grey[500]}
          />
          {(isPaused || isStopped) && (
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              style={{ margin: 0, padding: 0 }}
              contentStyle={{ margin: 0, padding: 0 }}
              anchor={
                <MaterialCommunityIcons
                  style={{ margin: 0, padding: 0 }}
                  name="dots-horizontal-circle-outline"
                  size={16}
                  color={palette.grey[500]}
                  onPress={() => setMenuVisible(true)}
                />
              }
            >
              {(!isStarted && isLimited) || isStopped || (isPaused && !isPausedSameToday) ? (
                <Menu.Item title={t('restart_timer')} leadingIcon="reload" onPress={() => setConfirmVisible(true)} />
              ) : (
                <Menu.Item
                  title={t('start_timer')}
                  leadingIcon="play-circle"
                  onPress={() => {
                    setMenuVisible(false)
                    handleMainAction()
                  }}
                />
              )}
              {!isStopped && !isLimited && (!isPaused || isPausedSameToday) && (
                <Menu.Item title={t('restart_timer')} leadingIcon="reload" onPress={() => setConfirmVisible(true)} />
              )}

              <Menu.Item
                title={t('updating_timeline')}
                leadingIcon="pencil"
                onPress={() => {
                  setMenuVisible(false)
                  onEditTimer(data)
                }}
              />
            </Menu>
          )}

          {isLimited && <MaterialIcons name="warning" size={18} color="orange" />}
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

const Ring = ({ size = 64, strokeWidth = 6, progress = 0.5, color = '#FFF', bgColor = '#999', children }: any) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle stroke={bgColor} cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} fill="none" />

        {/* progress */}
        <Circle
          stroke={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* center */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    backgroundColor: '#FFF',
    borderRadius: '6@ms',
    justifyContent: 'space-between'
  },
  subjectInactive: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.grey[500],
    flex: 1
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  timeInactive: {
    fontSize: 13,
    fontWeight: '700'
  },

  /* ACTIVE */
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
