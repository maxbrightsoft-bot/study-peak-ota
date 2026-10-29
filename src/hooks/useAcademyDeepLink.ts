import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import useAuthStore from "@/store/useAuthStore"
import useLogin from "@/containers/Login/hooks/useLogin"
import { getUserAcademies, switchAcademy } from "@/layouts/apiClients/academyServices"
import { AcademyResponse, LoginAccessTokenRequest } from "@/utils/types"
import { getDataStorage, removeDataStorage } from "@/utils/storage"
import { getErrorMessage, toast, getCurrentRole } from "@/utils/helpers"
import { setDemoMode } from "@/demoData/mockInterceptor"
import { useFocusEffect, useRoute, CommonActions } from "@react-navigation/native";
import { reset, navigationRef } from "@/navigators/NavigationHelpers"
import { MainRoutes, Routes } from "@/navigators/RouteName"
import { Role } from "@/utils/enums"
import { DEMO_MODE_STORAGE_KEY, DEMO_SESSION_BACKUP_STORAGE_KEY, DemoSessionBackup, restorePreviousSession } from "@/containers/Setting/hooks/useSetting"

export const useAcademyDeepLink = (targetRoute: string, targetDomain?: string) => {
  const { t } = useTranslation()
  const route = useRoute<any>()
  const user = useAuthStore(state => state.user)
  const setLoadingWithoutOverlay = useAuthStore(state => state.setLoadingWithoutOverlay)
  const setSelectAcademy = useAuthStore(state => state.setSelectAcademy)
  const { handleLoginAccessToken } = useLogin()
  const [isReady, setIsReady] = useState<boolean>(!targetDomain)

  const exitDemoMode = async () => {
    const demoMode = await getDataStorage(DEMO_MODE_STORAGE_KEY)
    if (demoMode === 'true') {
      const backupRaw = await getDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)
      setDemoMode(false)
      await removeDataStorage(DEMO_MODE_STORAGE_KEY)
      await removeDataStorage(DEMO_SESSION_BACKUP_STORAGE_KEY)

      if (backupRaw) {
        try {
          const backup = JSON.parse(backupRaw) as DemoSessionBackup
          await restorePreviousSession(backup)
        } catch (e) {
          useAuthStore.getState().setIsDemoMode(false)
        }
      } else {
        useAuthStore.getState().setIsDemoMode(false)
      }

      if (targetRoute) {
        reset(targetRoute, route?.params)
      }
    }
    return demoMode === 'true';
  }

  const handleSwitchAcademy = async (
    targetAcademy: AcademyResponse,
    shouldRedirect: boolean = true,
    roleOverride?: Role
  ) => {
    setLoadingWithoutOverlay(true)
    try {
      const userRole = roleOverride || getCurrentRole(targetAcademy.roles || user?.roles || [])
      const res = await switchAcademy(targetAcademy.id, userRole, false)

      const data = res.data
      const requestBody: LoginAccessTokenRequest = {
        accessToken: data.accessToken,
        email: user?.email || '',
        role: userRole,
        isMobile: true
      }

      await handleLoginAccessToken(
        requestBody,
        false,
        targetAcademy.domain,
        false,
        shouldRedirect ? targetRoute : undefined,
        !shouldRedirect
      )

      setSelectAcademy(targetAcademy)
    } catch (error) {
      toast.error(getErrorMessage(t, error))
      throw error
    } finally {
      setLoadingWithoutOverlay(false)
    }
  }

  const checkStudentLinked = async (superStudentId: number): Promise<boolean> => {
    let currentLinked = useAuthStore.getState().linkedStudents || []
    let matchedStudent = currentLinked.find((s) => s.studentSuperId === superStudentId)

    if (!matchedStudent) {
      try {
        const freshLinked = await useAuthStore.getState().syncParentLinkedStudents()
        matchedStudent = (freshLinked || []).find((s) => s.studentSuperId === superStudentId)
      } catch (error) {
        console.error('[useAcademyDeepLink] syncParentLinkedStudents error:', error)
      }
    }

    if (matchedStudent) {
      const currentParentViewMode = useAuthStore.getState().parentViewMode
      if (currentParentViewMode?.linkId !== matchedStudent.id) {
        const currentUser = useAuthStore.getState().user
        useAuthStore.getState().setParentViewMode({
          isActive: true,
          linkId: matchedStudent.id,
          studentSuperId: matchedStudent.studentSuperId || null,
          studentAcademyUserId: matchedStudent.studentAcademyUserId || null,
          studentName: matchedStudent.studentName || null,
          studentEmail: matchedStudent.studentEmail || null,
          studentAcademyDomain: targetDomain || currentUser?.academyDomain || null,
        })
      }
      return true
    }

    return false
  }

  useFocusEffect(
    useCallback(() => {
      const checkAndSwitchDomain = async () => {
        if (!targetDomain) {
          return
        }

        const isDemo = (await getDataStorage(DEMO_MODE_STORAGE_KEY)) === 'true'
        if (isDemo) {
          await exitDemoMode()
          return
        }

        const isCheckLinkAccount =
          route?.params?.isCheckLinkAccount === 'true' || route?.params?.isCheckLinkAccount === true
        const idSuperStudent = route?.params?.idSuperStudent || route?.params?.studentId
        const studentName = route?.params?.name || route?.params?.studentName
        const studentEmail = route?.params?.email || route?.params?.studentEmail
        const studentAvatar = route?.params?.avatar || route?.params?.studentAvatar

        const redirectToConfirm = () => {
          useAuthStore.getState().setPendingRedirectUrl(null, null)
          useAuthStore.getState().clearRedirectUrl()
          navigationRef.current?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: MainRoutes.AuthStack,
                  state: {
                    index: 1,
                    routes: [
                      {
                        name: Routes.Auth.MainTabs,
                        state: {
                          routes: [{ name: Routes.Auth.Home }],
                        },
                      },
                      {
                        name: Routes.Auth.AccountLinkingGroup,
                        state: {
                          index: 0,
                          routes: [
                            {
                              name: Routes.Auth.ParentShareLinkConfirm,
                              params: {
                                idSuperStudent: Number(idSuperStudent),
                                studentName,
                                studentEmail,
                                studentAvatar,
                                domain: targetDomain,
                                redirectUrl: targetRoute,
                                redirectParams: route?.params,
                                ...route?.params,
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            })
          )
        }

        try {
          // BƯỚC 1: Lấy danh sách academies (nếu store đang rỗng, tự nạp để tránh false-negative)
          let currentAcademies = useAuthStore.getState().academies || []
          if (!currentAcademies || currentAcademies.length === 0) {
            try {
              const res = await getUserAcademies()
              currentAcademies = res.data?.items || []
              useAuthStore.getState().setAcademies(currentAcademies)
            } catch (e) {
              console.error('[useAcademyDeepLink] sync academies error:', e)
            }
          }

          const targetAcademy = currentAcademies.find((a) => a.domain === targetDomain)
          const currentUser = useAuthStore.getState().user

          if (isCheckLinkAccount && idSuperStudent) {
            // Trường hợp không tìm thấy targetAcademy trong danh sách -> redirect sang màn confirm luôn
            if (!targetAcademy) {
              redirectToConfirm()
              return
            }

            const targetRole = getCurrentRole(targetAcademy.roles)
            const isParentRole = targetRole === Role.Parent

            // TargetAcademy là role parent: kiểm tra trong mảng children có id khớp với idSuperStudent
            const isStudentLinked = Boolean(
              isParentRole &&
              idSuperStudent &&
              targetAcademy.children?.some(
                (c) => c.studentSuperId === Number(idSuperStudent)
              )
            )

            if (isStudentLinked) {
              // Trường hợp targetAcademy là role parent và học sinh đã liên kết:
              // chuyển academy nếu đang ở academy khác và kích hoạt parentViewMode (không redirect sang màn confirm)
              if (currentUser?.academyDomain !== targetDomain) {
                setIsReady(false)
                await handleSwitchAcademy(targetAcademy, false, targetRole)
              }
              await checkStudentLinked(Number(idSuperStudent))
              return
            } else {
              // Các trường hợp cần xác nhận liên kết (redirectToConfirm):
              // - Role parent nhưng chưa liên kết học sinh này
              // - Không phải role parent (ví dụ role Student)
              // Nếu đang ở academy khác, cần switch sang targetAcademy trước khi redirect
              if (currentUser?.academyDomain !== targetDomain) {
                setIsReady(false)
                await handleSwitchAcademy(targetAcademy, false, targetRole)
              }
              redirectToConfirm()
              return
            }
          } else {
            // Luồng thông thường (không có cờ isCheckLinkAccount hoặc không phải Parent)
            if (currentUser?.academyDomain !== targetDomain && targetAcademy) {
              setIsReady(false)
              await handleSwitchAcademy(targetAcademy, false)
            }
          }
        } catch (error) {
          toast.error(getErrorMessage(t, error))
        } finally {
          setIsReady(true)
        }
      }

      checkAndSwitchDomain()
    }, [targetDomain, user?.academyDomain, route?.params])
  )

  return {
    isReady,
    handleSwitchAcademy
  }
}

