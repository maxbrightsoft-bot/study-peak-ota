import React, { FC } from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/theme/colors';
import { ScaledSheet } from 'react-native-size-matters';
import ClockIcon from '@/assets/icons/clock-icon.svg';

interface Props {
  value: number;
  onChange: (newValue: number) => void;
}

const TimerTabs: FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.tabsRow}>
        <Pressable
          onPress={() => onChange(0)}
          style={styles.tab}
        >
          <ClockIcon />
          <Text
            style={[
              styles.tabText,
              value === 0 && styles.activeText,
            ]}
          >
            {t('study_timer')}
          </Text>

          {value === 0 && <View style={styles.indicator} />}
        </Pressable>

        <Pressable
          onPress={() => onChange(1)}
          style={styles.tab}
        >
          <Text
            style={[
              styles.tabText,
              value === 1 && styles.activeText,
            ]}
          >
            {t('alarm_clock')}
          </Text>

          {value === 1 && <View style={styles.indicator} />}
        </Pressable>
      </View>

      <View style={styles.bottomLine} />
    </View>
  );
};

export default TimerTabs;

const styles = ScaledSheet.create({
  wrapper: {
    position: 'relative',
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    position: "relative"
  },
  indicator: {
    position: 'absolute',
    bottom: 1,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: palette.main[500]
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    paddingBottom: "16@ms",
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
    color: palette.grey[900],
  },
  activeText: {
    color: palette.main[700],
  },
  bottomLine: {
    height: 1,
    backgroundColor: palette.grey[100],
  },
});

