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
} from '../utils/constants'
import { getDataStorage } from '@/utils/storage';

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 0,
  headers: {
    'Content-Type': 'application/json',
  },
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
    async(config: any) => {
      const token = localStorage.getItem(ACCESS_TOKEN)
      const language = localStorage.getItem(LANGUAGE)
      if (token && !config.headers.noAuth) {
        config.headers.Authorization = `Bearer ${token}`
      }
      
      const academyDomainStorage = getDataStorage(ACADEMY_DOMAIN)
      const academyDomain = academyDomainStorage
      const isLearningSpace = await getDataStorage(LEARNING_SPACE) === true

      if((academyDomain && !isLearningSpace) && config.headers[AcademyHeaders] == undefined) config.headers[AcademyHeaders] = `${academyDomain}`
      if(isLearningSpace && config.headers[NoAcademyHeaders] == undefined) config.headers[NoAcademyHeaders] = `${isLearningSpace}`
      if(language) config.headers[LanguageHeaders] = `${language}`

      return config
    },
    (error: any) => Promise.reject(error)
  )
)
;[api, apiUpload].forEach((i) =>
  i.interceptors.response.use(
    (response: any) => {
      return response
    },
    (error: any) => {
      if (error.response?.status === 401 || error.response?.status == 403) {
        localStorage.removeItem(ACCESS_TOKEN)
        window.location.href = "/auth/sign-in"
      }

      return Promise.reject(error)
    }
  )
)
