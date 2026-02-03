import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Option } from '../configs/types';
import CustomSelect from '@/components/Select/CustomSelect';

type Props = {
  timeType: number;
  currentTime: number;
  timeTypeOptions: Option[];
  subjectOptions?: Option[];
  currentTimeOptions: Option[];
  selectedSubject?: number;
  handleChangeTimeType: (item: Option) => void;
  handleChangeSubject?: (item: Option) => void;
  handleChangeCurrentTime: (item: Option) => void;
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
    borderRadius: 6
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
    borderRadius: 8,
    gap: 14,
  },
});
