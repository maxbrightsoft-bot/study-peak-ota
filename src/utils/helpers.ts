import { AxiosResponse } from "axios";
import {
  ACCESS_TOKEN,
  DATE_MIN_VALUE,
  DATE_TIME_MIN_VALUE,
  DefaultErrorMessage,
} from "./constants";
import { TFunction } from "i18next";
import moment from 'moment'
import Toast from "react-native-toast-message";
import { ACADEMY_DOMAIN, LEARNING_SPACE } from "@/utils/constants"
import { getDataStorage } from "@/utils/storage"

export const toast = {
  success: (message: string) => Toast.show({
    type: 'success',
    text1: message
  }),
  error: (message: string) => Toast.show({
    type: 'error',
    text1: message
  }),
  info: (message: string) => Toast.show({
    type: 'info',
    text1: message
  }),
}

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


export const getAcademyDomain = async() => {
  try {
      return await getDataStorage(ACADEMY_DOMAIN)
  } catch (err) {
      return null
  }
}

export const getLearningSpace = async() => {
  try {
      const isLearningSpace = !!(await getDataStorage(LEARNING_SPACE))
      return isLearningSpace
  } catch (err) {
      return false
  }
}

export const getAccessToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN);
  } catch (err) {
    return null;
  }
}