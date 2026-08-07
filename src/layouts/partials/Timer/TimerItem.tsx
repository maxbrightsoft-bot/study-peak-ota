import React, { FC, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { getDisplayTime } from '../../configs/fn';
import { palette } from '@/theme/colors'; // Đảm bảo đường dẫn đúng
import { SubjectTimerResponse } from '@/utils/types';
import { TimerStatus } from '@/utils/enums';
import { ScaledSheet, ms } from 'react-native-size-matters';
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { DATE_TIME_MIN_VALUE } from '@/utils/constants';
import { Menu, Button } from 'react-native-paper';

interface Props {
  data: SubjectTimerResponse;
  seconds?: number;
  loading: boolean;
  activeTimerId?: number;
  onStartOrPauseTimer: (data: SubjectTimerResponse, isRestart?: boolean, isTimerRunning?: boolean) => void;
  onStopTimer: (data: SubjectTimerResponse, stopTime?: number, callback?: () => void) => void;
  onEditTimer: (data: SubjectTimerResponse) => void;
}

const TimerItem: FC<Props> = ({
  data,
  seconds,
  loading,
  activeTimerId,
  onStartOrPauseTimer,
  onStopTimer,
  onEditTimer,
}) => {
  const { t } = useTranslation();
  const [isPausedSameToday, setPausedSameToday] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const isStarted = data.status === TimerStatus.Started;
  const isPaused = data.status === TimerStatus.Paused;
  const isStopped = data.status === TimerStatus.Stopped;
  const isLimited = data.limitedTimeReached;

  const displayedTime = useMemo(
    () => getDisplayTime(t, { ...data, stoppedAt: DATE_TIME_MIN_VALUE }, activeTimerId, seconds),
    [data.id, data.status, data.duration, seconds, activeTimerId, t]
  );

  useEffect(() => {
    setPausedSameToday(
      data.status === TimerStatus.Paused && moment.utc(data.lastPauseTime).isSame(moment(), 'day')
    );
  }, [data.status, data.lastPauseTime]);

  const handleMainAction = () => {
    if (loading) return;
    if (isLimited && isStarted) {
      onStopTimer(data);
    } else {
      onStartOrPauseTimer(data, isLimited || isStopped || (isPaused && !isPausedSameToday));
    }
  };

  const handleRestart = () => {
    setConfirmVisible(false);
    onStartOrPauseTimer(data, true);
  };

  const renderActiveTimer = () => (
    <View style={styles.activeCard}>
      <View style={styles.activeInfo}>
        <View>
          <Text style={styles.activeSubjectName} numberOfLines={1}>{data.name}</Text>
          <Text style={styles.activeTimeText}>{displayedTime}</Text>
        </View>
        <Pressable style={styles.activeStatusBadge} onPress={handleMainAction}>
          <Text style={styles.activeStatusText}>{t('paused')}</Text>
        </Pressable>
      </View>

      <View style={styles.ringContainer}>
        <View style={styles.ringOuter}>
          <View style={styles.ringInner}>
            <View style={styles.pauseIconCircle}>
              <Ionicons name="pause" size={ms(12)} color="#FFF" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );

  const renderInactiveTimer = () => (
    <Pressable
      style={styles.row}
      disabled={loading}
      onPress={handleMainAction}
      android_ripple={{ color: palette.grey[200] }}
    >
      <View style={styles.left}>
        <View style={styles.infoContainer}>
          <Text style={styles.subjectInactive} numberOfLines={1}>{data.name}</Text>
          <Text style={[styles.timeLabel, { color: palette.grey[500] }]}>{displayedTime}</Text>
        </View>
      </View>

      <View style={styles.right}>
        <View style={styles.mainActionIcon}>
          {isLimited || isStopped || (isPaused && !isPausedSameToday) ? (
            <Ionicons name="reload-circle" size={ms(22)} color={palette.main[600]} />
          ) : (
            <Ionicons name="play-circle" size={ms(22)} color={palette.main[600]} />
          )}
        </View>

        {(isPaused || isStopped) && (
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Pressable onPress={() => setMenuVisible(true)} hitSlop={15} style={styles.menuButton}>
                <MaterialCommunityIcons name="dots-horizontal-circle-outline" size={ms(18)} color={palette.main[600]} />
              </Pressable>
            }
          >
            <Menu.Item
              onPress={() => { setMenuVisible(false); setConfirmVisible(true); }}
              title={t('restart_timer')}
              leadingIcon="reload"
            />
            <Menu.Item
              onPress={() => { setMenuVisible(false); onEditTimer(data); }}
              title={t('updating_timeline')}
              leadingIcon="pencil"
            />
          </Menu>
        )}
      </View>
    </Pressable>
  );

  return (
    <>
      {isStarted ? renderActiveTimer() : renderInactiveTimer()}

      <ConfirmDialog
        open={confirmVisible}
        toggle={() => setConfirmVisible(false)}
        onConfirm={handleRestart}
        text={t('do_you_really_want_to_reset_your_timer')}
      />
    </>
  );
};

export default TimerItem;

const styles = ScaledSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    backgroundColor: palette.grey[50],
    borderRadius: '8@ms',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10@ms',
  },
  left: { flex: 1 },
  infoContainer: { gap: '2@ms' },
  subjectInactive: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: palette.grey[900],
  },
  timeLabel: {
    fontSize: '12@ms',
    fontWeight: '700',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
  },
  mainActionIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuButton: {
    padding: '4@ms',
  },
  activeCard: {
    backgroundColor: palette.main[900],
    padding: '16@ms',
    borderRadius: '8@ms',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10@ms',
  },
  activeInfo: {
    flex: 1,
    justifyContent: 'space-between',
    height: '70@ms',
  },
  activeSubjectName: {
    color: '#FFF',
    fontSize: '14@ms',
    opacity: 0.9,
  },
  activeTimeText: {
    color: '#FFF',
    fontSize: '26@ms',
    fontWeight: '600',
  },
  activeStatusBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: '12@ms',
    paddingVertical: '4@ms',
    borderRadius: '4@ms',
    alignSelf: 'flex-start',
  },
  activeStatusText: {
    color: palette.grey[700],
    fontSize: '11@ms',
    fontWeight: '700',
  },
  ringContainer: {
    width: '80@ms',
    height: '80@ms',
    backgroundColor: palette.main[600],
    borderRadius: '16@ms',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringOuter: {
    width: '60@ms',
    height: '60@ms',
    borderRadius: '30@ms',
    borderWidth: '4@ms',
    borderColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ringInner: {
    width: '48@ms',
    height: '48@ms',
    borderRadius: '24@ms',
    backgroundColor: palette.main[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseIconCircle: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});