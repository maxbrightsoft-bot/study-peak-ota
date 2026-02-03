import React, { FC, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip, IconButton } from 'react-native-paper';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { getDisplayTime } from '../../configs/fn';
import { Timer } from '../../configs/types';
import { palette } from '@/theme/colors';
import { TYPO } from '@/theme';

interface Props {
  data: Timer;
  starting?: boolean;
  addable?: boolean;
  noActions?: boolean;
  onAddTimer?: () => void;
  onRemoveTimer?: () => void;
}

const TimerDivider: FC<Props> = ({
  data,
  starting,
  addable,
  noActions,
  onAddTimer,
  onRemoveTimer,
}) => {
  const { t } = useTranslation();

  const displayedTime = useMemo(
    () => getDisplayTime(t, data),
    [data?.id, data?.status, data?.duration, t]
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.line} />

      <View style={styles.content}>
        {!noActions && (
          <IconButton
            icon={() => (
              <Ionicons name="add" size={16} />
            )}
            size={16}
            disabled={!addable}
            style={styles.iconBtn}
            onPress={onAddTimer}
          />
        )}

        <Chip
          compact
          style={styles.chip}
          textStyle={styles.chipText}
        >
          {`${displayedTime}${starting ? '+' : ''}`}
        </Chip>

        {!noActions && (
          <IconButton
            icon={() => (
              <FontAwesome5 name="trash" size={16} color="red" />
            )}
            size={16}
            style={styles.iconBtn}
            onPress={onRemoveTimer}
          />
        )}
      </View>

      <View style={styles.line} />
    </View>
  );
};

export default TimerDivider;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: palette.main[500],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  iconBtn: {
    backgroundColor: palette.grey[50],
    width: 24,
    height: 24,
  },
  chip: {
    backgroundColor: '#FFF',
  },
  chipText: {
    ...TYPO.button3,
  },
});
