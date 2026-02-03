import React, { FC } from 'react';
import { View, StyleSheet } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { palette } from '@/theme/colors';

interface Props {
  value: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

const AlarmSpeakerCheckbox: FC<Props> = ({
  value,
  disabled,
  onChange,
}) => {
  const { t } = useTranslation();

  const handleToggle = () => {
    onChange(!value);
  };

  return (
    <View style={styles.container}>
      <Checkbox
        status={value ? 'checked' : 'unchecked'}
        disabled={disabled}
        onPress={handleToggle}
        uncheckedColor={palette.grey[600]}
        color={palette.main[500]}
      />

      <Text
        style={[
          styles.label,
          disabled && styles.disabledLabel,
        ]}
      >
        {t('speaker_mode')}
      </Text>
    </View>
  );
};

export default AlarmSpeakerCheckbox;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.grey[600],
  },
  disabledLabel: {
    opacity: 0.5,
  },
});
