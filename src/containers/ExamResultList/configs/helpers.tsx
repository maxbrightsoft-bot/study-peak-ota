import { utcToLocalTime } from '@/utils/helpers';
import { ExamSessionResponse } from '@/utils/types';
;
export const groupMonth = (exams: Array<ExamSessionResponse> | null) => {
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