import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Option } from '../configs/types';
import CustomSelect from '@/components/Select/CustomSelect';
import { palette } from '@/theme';

type Props = {
  timeType: number;
  currentTime: number;
  timeTypeOptions: Option[];
  subjectOptions?: Option[];
  currentTimeOptions: Option[];
  selectedSubject?: number;
  handleChangeTimeType: (item: number) => void;
  handleChangeSubject?: (item: number) => void;
  handleChangeCurrentTime: (item: number) => void;
};

const TimePeriodSelector = ({
  timeType,
  timeTypeOptions,
  currentTime,
  selectedSubject,
  currentTimeOptions,
  subjectOptions,
  handleChangeTimeType,
  handleChangeSubject,
  handleChangeCurrentTime,
}: Props) => {
  const style = {
    borderWidth: 0.5,
    borderColor: palette.grey[100],
    backgroundColor: "#FFF",
    borderRadius: 8,
    height: 40
  }
  return (
    <View style={styles.container}>
      <CustomSelect
        style={style}
        value={timeType}
        options={timeTypeOptions}
        onValueChange={handleChangeTimeType}
      />

      <CustomSelect
        style={style}
        value={currentTime}
        options={currentTimeOptions}
        onValueChange={handleChangeCurrentTime}
      />

      {!!subjectOptions?.length && (
        <CustomSelect
          style={style}
          value={selectedSubject}
          options={subjectOptions}
          onValueChange={handleChangeSubject}
        />
      )}
    </View>
  );
};

export default TimePeriodSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
});
