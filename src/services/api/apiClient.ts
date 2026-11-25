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
import useAppStore from '@/store/useAppStore';
import { applyMockAdapter } from '@/demoData/mockInterceptor';
import { trackErrorStandalone } from '@/hooks/useActivityTracking';
import { getGuestAcademyHeaders, getGuestSession, GuestSession, isGuestAcademyOnlyRoute, isGuestTokenRoute } from '@/containers/GuestExam/utils/guestSession';
import { expireGuestSession } from '@/containers/GuestExam/utils/guestNavigation';
import { shouldLogoutOn401 } from './sessionGuard';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Public guest route: never send Authorization; the caller sets the academy headers. */
    guestPublic?: boolean
    /** Guest session to use instead of the active one (a call made right before the session is cleared). */
    guestSession?: GuestSession
    /** A 401 on this guest call must not end the guest flow (e.g. the final `end` call). */
    guestIgnoreUnauthorized?: boolean
    /** Set by the interceptor when the request runs on the guest token. */
    isGuestRequest?: boolean
  }
}

/** The guest session for this request, if any: only with nobody signed in, and only on the guest-token routes. */
const resolveGuestSession = (config: { guestPublic?: boolean; guestSession?: GuestSession; url?: string }) => {
  if (config.guestPublic) return undefined
  const session = config.guestSession ?? getGuestSession()
  if (!session || useAuthStore.getState().user) return undefined
  return isGuestTokenRoute(config.url, session.code) ? session : undefined
}

/** A guest (nobody signed in) calling a public route that needs only the guest's academy headers, never the token. */
const resolveGuestAcademyOnlySession = (config: { guestPublic?: boolean; guestSession?: GuestSession; url?: string }) => {
  if (config.guestPublic || !isGuestAcademyOnlyRoute(config.url)) return undefined
  const session = config.guestSession ?? getGuestSession()
  if (!session || useAuthStore.getState().user) return undefined
  return session
}

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
        const language = await getDataStorage(LANGUAGE)
        const guestSession = resolveGuestSession(config)
        const guestAcademyOnlySession = guestSession ? undefined : resolveGuestAcademyOnlySession(config)

        if (config.guestPublic) {
          // Guest public routes: no token at all (a stale guest token gets 403), only the picked academy.
          delete config.headers.Authorization
        } else if (guestSession) {
          // Guest-token routes: the guest token and the guest's academy, never the student ones.
          config.isGuestRequest = true
          config.headers.Authorization = `Bearer ${guestSession.token}`
          delete config.headers[AcademyHeaders]
          delete config.headers[NoAcademyHeaders]
          Object.assign(config.headers, getGuestAcademyHeaders(guestSession.domain, guestSession.isLearningSpace))
        } else if (guestAcademyOnlySession) {
          // Guest on `auth/time`: the guest's academy only (the BE answers 400 without it), no token.
          delete config.headers.Authorization
          delete config.headers[AcademyHeaders]
          delete config.headers[NoAcademyHeaders]
          Object.assign(config.headers, getGuestAcademyHeaders(guestAcademyOnlySession.domain, guestAcademyOnlySession.isLearningSpace))
        } else {
          const token = await getDataStorage(ACCESS_TOKEN)

          if (token && !config.headers.noAuth) {
            config.headers.Authorization = `Bearer ${token}`
          }

          const authState = useAuthStore.getState()
          const currentUser = authState.user
          const academyDomain = currentUser ? currentUser.academyDomain : await getDataStorage(ACADEMY_DOMAIN)
          const isLearningSpace = currentUser ? !!currentUser.isLearningSpace : !!(await getDataStorage(LEARNING_SPACE)) === true

          if ((academyDomain && !isLearningSpace) && config.headers[AcademyHeaders] == undefined) config.headers[AcademyHeaders] = `${academyDomain}`
          if (isLearningSpace && config.headers[NoAcademyHeaders] == undefined) config.headers[NoAcademyHeaders] = `${isLearningSpace}`
        }
        if (language) config.headers[LanguageHeaders] = `${language}`

        config.headers['x-platform'] = Platform.OS;
        config.headers['x-app-version'] = DeviceInfo.getVersion();
        config.headers['x-bundle-version'] = useAppStore.getState().bundleVersion;
        if (__DEV__) {
          config.headers['x-dev-mode'] = 'true';
        }

        console.log('[API REQ]', config.method?.toUpperCase(), config.url, config.params);
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

        const config = error?.config
        const isGuestCall = !!(config?.isGuestRequest || config?.guestPublic)
        // A guest (nobody signed in) has no student session to log out of.
        const isGuestActive = !!getGuestSession() && !useAuthStore.getState().user

        if (status === 401 && config?.isGuestRequest && !config?.guestIgnoreUnauthorized) {
          await expireGuestSession();
        } else if (status === 401 && !isGuestCall && !isGuestActive) {
          // A request sent with an older (revoked) token, e.g. in flight during an account switch, keeps the new session.
          if (shouldLogoutOn401(config?.headers?.Authorization, await getDataStorage(ACCESS_TOKEN))) {
            const logout = useAuthStore.getState().logout;
            await logout();
          }
        }
        if (__DEV__) console.log('[API] Request failed:', status, error?.config?.url);
        console.log('[API ERR]', error?.config?.method?.toUpperCase(), error?.config?.url, error?.config?.params, error?.response?.data || error?.message);

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

        const skipStatuses = [401, 403, 404, 400, 422, 426, 512]
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
