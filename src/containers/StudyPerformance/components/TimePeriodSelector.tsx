import React from 'react';
import { ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Option } from '../configs/types';
import CustomSelect from '@/components/Select/CustomSelect';
import { ScaledSheet } from 'react-native-size-matters';

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
  const renderChevron = () => (
    <Ionicons name="chevron-down" size={11} color="#6F48E9" style={{ marginLeft: 4 }} />
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
    >
      <CustomSelect
        style={[styles.chipSelect, { minWidth: 100 }]}
        selectedTextStyle={styles.selectedText}
        placeholderStyle={styles.placeholderText}
        icon={renderChevron}
        value={timeType}
        options={timeTypeOptions}
        onValueChange={handleChangeTimeType}
      />

      <CustomSelect
        style={[styles.chipSelect, { minWidth: 110 }]}
        selectedTextStyle={styles.selectedText}
        placeholderStyle={styles.placeholderText}
        icon={renderChevron}
        value={currentTime}
        options={currentTimeOptions}
        onValueChange={handleChangeCurrentTime}
      />

      {!!subjectOptions?.length && (
        <CustomSelect
          style={[styles.chipSelect, { minWidth: 90 }]}
          selectedTextStyle={styles.selectedText}
          placeholderStyle={styles.placeholderText}
          icon={renderChevron}
          value={selectedSubject}
          options={subjectOptions}
          onValueChange={handleChangeSubject}
        />
      )}
    </ScrollView>
  );
};

export default TimePeriodSelector;

const styles = ScaledSheet.create({
  scrollView: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#ECECEF',
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms',
  },
  chipSelect: {
    height: '36@ms',
    borderRadius: '18@ms',
    backgroundColor: '#F3F0FE',
    borderWidth: 1,
    borderColor: '#E5DFFC',
    paddingHorizontal: '12@ms',
    justifyContent: 'center',
  },
  selectedText: {
    color: '#6F48E9',
    fontSize: '12.5@ms',
    fontWeight: '700',
  },
  placeholderText: {
    color: '#6F48E9',
    fontSize: '12.5@ms',
    fontWeight: '700',
  },
});
