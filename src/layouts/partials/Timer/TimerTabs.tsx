import React, { FC } from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { palette } from '@/theme/colors';
import { ScaledSheet } from 'react-native-size-matters';
import { TYPO } from '@/theme';

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
    gap: 12,
    position: "relative"
  },
  indicator: {
    position: 'absolute',
    bottom: -16,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: palette.main[600]
  },
  tab: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
  },
  tabText: {
    ...TYPO.heading3,
    color: palette.grey[300],
  },
  activeText: {
    color: palette.main[700],
  },
});

