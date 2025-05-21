import { palette } from '@/theme';
import { utcToLocalTime } from '@/utils/helpers';
import { ExamSession } from '@/utils/types';
import { StyleSheet, Text } from 'react-native';

export const groupMonth = (exams: Array<ExamSession> | null) => {
  if (!exams?.length) return;
  const examsSorted = exams;
  const obj = {};
  for (let i = 0; i < examsSorted.length; i++) {
    if ((obj as any)[utcToLocalTime(examsSorted[i].startTime, "YYYY-MM-01")]) {
      (obj as any)[utcToLocalTime(examsSorted[i].startTime, "YYYY-MM-01")].push(
        examsSorted[i]
      );
    } else {
      (obj as any)[utcToLocalTime(examsSorted[i].startTime, "YYYY-MM-01")] = [];
      (obj as any)[utcToLocalTime(examsSorted[i].startTime, "YYYY-MM-01")].push(
        examsSorted[i]
      );
    }
  }

  return obj;
};

const styles = StyleSheet.create({
  highlighted: {
    backgroundColor: palette.main[500],
    color: '#000',
  },
});
