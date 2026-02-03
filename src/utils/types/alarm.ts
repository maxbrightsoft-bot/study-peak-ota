import { AlarmType, TimerStatus } from "../enums"
import { SubjectTimerResponse } from "./subjects"

export type AlarmResumeOrPauseRequest = {
    id: number
    status: TimerStatus
    pauseTime?: number
    stopTime?: number
    rowVersion: string
}

export type AlarmResponse = {
    id: number;
    startTime: string;
    expiryTime: string;
    lastResumeTime: string;
    lastPauseTime: string;
    duration: number;
    totalRunningTime: number;
    status: TimerStatus
    speakerMode: boolean
    rowVersion: string;
    subject?: SubjectTimerResponse
}

export type StartAlarmRequest = {
    duration: number
    type: AlarmType
    startTime: number
    speakerMode: boolean
    subjectId?: number
    rowVersion: string;
}

export type ToggleAlarmSpeakerRequest = {
    id: number
    speakerMode: boolean
    rowVersion: string
}