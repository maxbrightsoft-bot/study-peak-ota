import qs from 'qs'
import axios, { AxiosInstance } from 'axios'
import { Platform } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import {
  ACADEMY_DOMAIN,
  ACCESS_TOKEN,
  AcademyHeaders,
  BASE_URL,
  LANGUAGE,
  LEARNING_SPACE,
  LanguageHeaders,
  NoAcademyHeaders,
  STORE_UPDATE_REQUIRED,
  OTA_UPDATE_REQUIRED,
  UPDATE_REQUIRED,
} from '../../utils/constants'
import { getDataStorage } from '@/utils/storage';
import useAuthStore from '@/store/useAuthStore';
import useAppStore, { waitForAppStoreHydration } from '@/store/useAppStore';
import { applyMockAdapter } from '@/demoData/mockInterceptor';
import { trackErrorStandalone } from '@/hooks/useActivityTracking';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    serialize: params => qs.stringify(params, { arrayFormat: 'repeat' })
  }
})

export const apiUpload: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

  ;[api, apiUpload].forEach((i) =>
    i.interceptors.request.use(
      async (config: any) => {
        const token = await getDataStorage(ACCESS_TOKEN)
        const language = await getDataStorage(LANGUAGE)

        if (token && !config.headers.noAuth) {
          config.headers.Authorization = `Bearer ${token}`
        }

        const authState = useAuthStore.getState()
        const currentUser = authState.user
        const academyDomain = currentUser ? currentUser.academyDomain : await getDataStorage(ACADEMY_DOMAIN)
        const isLearningSpace = currentUser ? !!currentUser.isLearningSpace : !!(await getDataStorage(LEARNING_SPACE)) === true

        if ((academyDomain && !isLearningSpace) && config.headers[AcademyHeaders] == undefined) config.headers[AcademyHeaders] = `${academyDomain}`
        if (isLearningSpace && config.headers[NoAcademyHeaders] == undefined) config.headers[NoAcademyHeaders] = `${isLearningSpace}`
        if (language) config.headers[LanguageHeaders] = `${language}`

        config.headers['x-platform'] = Platform.OS;
        config.headers['x-app-version'] = DeviceInfo.getVersion();
        await waitForAppStoreHydration();
        config.headers['x-bundle-version'] = useAppStore.getState().bundleVersion;
        if (__DEV__) {
          config.headers['x-dev-mode'] = 'true';
        }

        console.log({ headers: config.headers});

        await applyMockAdapter(config);

        return config
      },
      (error: any) => {
        Promise.reject(error)
      }
    )
  )
  ;[api, apiUpload].forEach((i) =>
    i.interceptors.response.use(
      (response: any) => {
        return response
      },
      async (error: any) => {
        const status = error?.response?.status

        if (status === 401 || status === 403) {
          const logout = useAuthStore.getState().logout;
          await logout();
        }
        console.log({ error });
        
        if (status === 426) {
          const data = error?.response?.data;
          console.log({ data });
          
          if (data?.code === STORE_UPDATE_REQUIRED) {
            useAppStore.getState().setNeedsForceUpdate(true);
            useAppStore.getState().setLatestVersionName(data.latestVersion || '');
          } else if (data?.code === OTA_UPDATE_REQUIRED) {
            if (!useAppStore.getState().isUpdatingOta) {
              useAppStore.getState().triggerOtaCheck();
            }
          }

          if (error.response?.data) {
            error.response.data.title = undefined;
            error.response.data.message = undefined;
          }
          error.message = UPDATE_REQUIRED;
          return Promise.reject(error);
        }

        const skipStatuses = [401, 403, 404, 400, 422, 426]
        if (!skipStatuses.includes(status)) {
          trackErrorStandalone(error, {
            metaData: {
              status,
              url: error?.config?.url,
              method: error?.config?.method,
            },
          })
        }

        return Promise.reject(error)
      }
    )
  )
