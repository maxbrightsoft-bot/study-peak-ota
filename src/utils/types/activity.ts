import { ActivityAction, ActivityResource, AppScreen } from "../enums";

export type CreateActivityRequest = {
  action: ActivityAction
  metaData?: string
  screen: AppScreen
  resourceType?: ActivityResource
  resourceId?: string
  deviceId: string
  platform: string
  osVersion: string
  appVersion: string
  deviceModel: string
  ipAddress?: string
  timezone?: string
  triggeredAt?: string
}
