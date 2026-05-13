import React, { FC, useMemo } from 'react';
import { View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import moment from 'moment';

import { getNextTimes, isNextTimeValid } from '../../configs/fn';
import { RecordItem, TimeLine, Timer } from '../../configs/types';
import { palette } from '@/theme/colors';
import { TimerStatus } from '@/utils/enums';
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  selectedDate?: moment.Moment;
  lastItem?: RecordItem;
  onAddTimer: (timer: Timer) => void;
}

const TimerLastDivider: FC<Props> = ({
  selectedDate,
  lastItem,
  onAddTimer,
}) => {
  const lastTime = lastItem?.time;
  const disabled =
    !!lastItem && lastItem.status !== TimerStatus.Stopped;

  const timeValue = lastTime
    ? moment.utc(lastTime).local()
    : undefined;

  const addable = useMemo(() => {
    if (disabled || !selectedDate) return false;
    return isNextTimeValid(selectedDate, timeValue);
  }, [
    selectedDate?.toISOString(),
    timeValue?.toISOString(),
    disabled,
  ]);

  const handleAddNextTimer = () => {
    if (!addable || !selectedDate) return;

    const { startMoment, endMoment } =
      getNextTimes(selectedDate, timeValue);

    const totalDiff = endMoment.diff(
      startMoment,
      'milliseconds'
    );

    const newRecord: TimeLine = {
      id: 0,
      startedAt: startMoment.utc().toISOString(),
      stoppedAt: endMoment.utc().toISOString(),
      totalTime: totalDiff,
    };

    const newTimer: Timer = {
      id: 0,
      duration: totalDiff,
      status: TimerStatus.Stopped,
      startTime: newRecord.startedAt,
      limitedTimeReached: false,
      limitedTime: 0,
      records: [newRecord],
      lastPauseTime: '',
      lastResumeTime: '',
      name: '',
      rowVersion: '',
      timerId: 0,
    };

    onAddTimer(newTimer);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.line} />

      <IconButton
        icon={() => (
          <Ionicons name="add" size={14} />
        )}
        size={16}
        style={styles.iconBtn}
        disabled={!addable}
        onPress={handleAddNextTimer}
      />

      <View style={styles.line} />
    </View>
  );
};

export default TimerLastDivider;

const styles = ScaledSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: '8@ms',
  },
  line: {
    flex: 1,
    height: '1@ms',
    backgroundColor: palette.main[500],
  },
  iconBtn: {
    backgroundColor: palette.grey[50],
    width: '24@ms',
    height: '24@ms',
    marginHorizontal: '8@ms',
  },
});
