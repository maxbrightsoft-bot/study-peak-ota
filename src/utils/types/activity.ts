import { ActivityAction } from "../enums";

export type CreateActivityRequest = {
  action: ActivityAction
  metaData: string
  deviceInfo?: DeviceInfo
}

export type DeviceInfo = {
  deviceId?: string
  platform?: string
  osVersion?: string
  appVersion?: string
  model?: string
  ipAddress?: string
  timezone?: string
}