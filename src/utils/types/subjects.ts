import { BaseSearchQuery } from ".";
import { TimerStatus } from "../enums/subject";


export type SubjectTimerResponse = {
    id: number;
    timerId: number;
    name: string;
    startTime: string;
    lastResumeTime: string;
    lastPauseTime: string;
    duration: number;
    status: TimerStatus
    rowVersion: string
    limitedTime: number
    limitedTimeReached: boolean
    limitedInactiveTime?: string
    checkPointTime?: string
    pauseTime?: number
    limitedReachedTime?: string
    limitedQuestionCount: number
    limitedTimeInMinutes: number
    audioUrls: string[]
}
export type ResumeOrPauseRequest = {
    status: TimerStatus
    pauseTime?: number
    rowVersion: string
    timerId: number
}

export type StopTimerRequest = {
    stopTime?: number
    rowVersion: string
}

export type SaveTimerRequest = {
    savedTime: number
}

export type SubjectTimerSearchQuery = BaseSearchQuery<string> & {
    startDate?: number
    endDate?: number
}

export type UpdateSubjectTimerInfoRequest = {
  rowVersion: string
  startTime?: number
  stoppedTime?: number
  totalTime?: number
}

export type UpdateSubjectTimersInfoRequestContent = {
  id: number
  rowVersion: string
  startTime?: number
  stoppedTime?: number
  totalTime?: number
}

export type UpdateSubjectTimersInfoRequest = {
  startDate: number
  endDate: number
  timers: UpdateSubjectTimersInfoRequestContent[]
}