import { ActivityAction } from "../enums";

export type CreateActivityRequest = {
  action: ActivityAction
  metaData: string
}