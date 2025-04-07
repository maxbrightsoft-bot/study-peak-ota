import { AxiosResponse } from "axios";
import {
  DATE_MIN_VALUE,
  DATE_TIME_MIN_VALUE,
  DefaultErrorMessage,
} from "./constants";
import { TFunction } from "i18next";
import moment from 'moment'

export const handleErrors = (response: AxiosResponse<any>) =>
  response.status === 200
    ? Promise.resolve(response.data)
    : Promise.reject(response.data?.errors[0]);

export const utcToLocalTime = (time?: string, FORMAT?: string) => {
  if (time === DATE_MIN_VALUE || time === DATE_TIME_MIN_VALUE) return "";
  try {
    return moment
      .utc(time)
      .local()
      .format(FORMAT || "yyyy-MM-DD");
  } catch {
    return "";
  }
};

export const getErrorMessage = (
  t: TFunction<"translation", undefined>,
  error: any,
  defaultErrorMessage?: string
): string => {
  let errorMessage = error?.response?.data?.title;
  if (error?.response?.status === 500)
    return defaultErrorMessage || t(DefaultErrorMessage);
  if (typeof errorMessage === "string") return decodeURIComponent(errorMessage);
  errorMessage = error?.message || error?.response?.data?.message;
  if (typeof errorMessage === "string") return errorMessage;
  return defaultErrorMessage || t(DefaultErrorMessage);
};
