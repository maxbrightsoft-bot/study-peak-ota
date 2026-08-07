import { isValidTime, utcToLocalTime } from '@/utils/helpers';
import { ExamSession, ExamSessionResponse } from '@/utils/types';
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

export const groupMonthV2 = (exams: ExamSessionResponse[]) => {
    if (!exams?.length) return
    const examsSorted = exams
    const obj = {}
    for (let i = 0; i < examsSorted.length; i++) {
        if (
            (obj as any)[utcToLocalTime(isValidTime(examsSorted[i].studentStartTime) ? examsSorted[i].studentStartTime : examsSorted[i].startTime, "YYYY-MM-01")]
        ) {
            ; (obj as any)[
                utcToLocalTime(isValidTime(examsSorted[i].studentStartTime) ? examsSorted[i].studentStartTime : examsSorted[i].startTime, "YYYY-MM-01")
            ].push(examsSorted[i])
        } else {
            ; (obj as any)[
                utcToLocalTime(isValidTime(examsSorted[i].studentStartTime) ? examsSorted[i].studentStartTime : examsSorted[i].startTime, "YYYY-MM-01")
            ] = []
                ; (obj as any)[
                    utcToLocalTime(isValidTime(examsSorted[i].studentStartTime) ? examsSorted[i].studentStartTime : examsSorted[i].startTime, "YYYY-MM-01")
                ].push(examsSorted[i])
        }
    }

    return obj
}

export const checkData = (data: any) => {
    if (Array.isArray(data)) {
        return !!data.length
    } else {
        return !!data
    }
}

export const getPercentage = (current: number, max: number) => {
  if(!max) return 0;
  return (current * 100) / max 
}
