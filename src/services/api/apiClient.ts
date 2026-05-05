import qs from 'qs'
import axios, { AxiosInstance } from 'axios'
import {
  ACADEMY_DOMAIN,
  ACCESS_TOKEN,
  AcademyHeaders,
  BASE_URL,
  LANGUAGE,
  LEARNING_SPACE,
  LanguageHeaders,
  NoAcademyHeaders,
} from '../../utils/constants'
import { getDataStorage } from '@/utils/storage';
import useAuthStore from '@/store/useAuthStore';

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

        console.log({ config: config.data });
        
        const academyDomainStorage = await getDataStorage(ACADEMY_DOMAIN)
        const academyDomain = academyDomainStorage
        const isLearningSpace = !!(await getDataStorage(LEARNING_SPACE)) === true

        if ((academyDomain && !isLearningSpace) && config.headers[AcademyHeaders] == undefined) config.headers[AcademyHeaders] = `${academyDomain}`
        if (isLearningSpace && config.headers[NoAcademyHeaders] == undefined) config.headers[NoAcademyHeaders] = `${isLearningSpace}`
        if (language) config.headers[LanguageHeaders] = `${language}`

        console.log({ header: config.header});
        

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
        if (error.response?.status === 401 || error.response?.status == 403) {
          const logout = useAuthStore.getState().logout;
          await logout();
        }

        return Promise.reject(error)
      }
    )
  )
