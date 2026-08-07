import { TimerStatus } from "@/utils/enums";

export type SubjectTimerDetailResponse = {
  id: number;
  startTime: string;
  lastResumeTime: string;
  lastPauseTime: string;
  duration: number;
  status: TimerStatus
  limitedTime: number
  limitedTimeReached: boolean
  records: TimerRecordResponse[]
  rowVersion: string
}
export type TimerRecordResponse = {
  id: number
  startTime: string
  endTime: string
}

export type SubjectTimerTimeLineResponse = {
  timers: SubjectTimerDetailResponse[]
}

export type SubjectTimerTimeLineRequest = {
  timers: SubjectTimerRequest[]
}

export type SubjectTimerRequest = {
  id: number
  records: SubjectTimerRecordRequest[]
}

export type SubjectTimerRecordRequest = {
  id: number
  startedAt: number
  stoppedAt: number
}
export type TimeLine = {
  id: number;
  startedAt: string;
  stoppedAt: string;
  totalTime: number;
}

export type TimerBase = {
  duration: number;
  id: number;
  lastPauseTime: string;
  lastResumeTime: string;
  limitedTime: number;
  limitedTimeReached: boolean;
  name: string;
  rowVersion: string;
  startTime: string;
  stoppedAt: string;
  status: TimerStatus;
  timerId: number;
}

export type Timer = Omit<TimerBase, 'name' | 'timerId'> & {
  subjectId: number
  subjectName: string
}

export interface SubjectTimersRequest {
  startDate: number,
  endDate: number,
  timers: SubjectTimerRequest[];
}

export type RecordItem = {
  id: number,
  timer: Timer,
  time: string,
  recordIndex: number,
  timerIndex: number,
  status: TimerStatus,
  isStart: boolean,
}

export type UnReadMessageConversationResponse =
  {
    id: number
    totalUnReadMessage: number
    teacherName?: string
  }