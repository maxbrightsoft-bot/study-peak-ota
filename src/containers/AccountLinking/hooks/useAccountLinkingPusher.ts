import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PusherMember } from '@pusher/pusher-websocket-react-native'
import useAuthStore from '@/store/useAuthStore'
import useAccountLinkingStore, { ParentRequestLink } from '@/store/useAccountLinkingStore'
import { navigate, goBack } from '@/navigators/NavigationHelpers'
import { toast, getMessageFromError, checkIsParent } from '@/utils/helpers'
import { Role } from '@/utils/enums'
import { setDataStorage } from '@/utils/storage'
import { ACCESS_TOKEN } from '@/utils/constants'
import { completeParentRoleIfPendingApi } from '../apiClients'
import { Routes } from '@/navigators/RouteName'

export const useAccountLinkingPusher = () => {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const setUserCustom = useAuthStore((state) => state.setUserCustom)
  const pusher = useAuthStore((state) => state.pusher)
  const initializePusher = useAuthStore((state) => state.initializePusher)
  const subscribeChannel = useAuthStore((state) => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore((state) => state.unsubscribeChannelSafe)

  useEffect(() => {
    initializePusher()
  }, [])

  // Lấy email của student và selectedRole từ Zustand store
  const studentEmail = useAccountLinkingStore((state) => state.studentEmail)
  const selectedRole = useAccountLinkingStore((state) => state.selectedRole)

  const determinedRole: Role = selectedRole
    ? selectedRole
    : checkIsParent()
    ? Role.Parent
    : Role.Student

  // Lấy hàm setParentRequestLink, setAcceptedLinkData, setAcceptedLinkId và clearLinkData từ store
  const setParentRequestLink = useAccountLinkingStore((state) => state.setParentRequestLink)
  const setAcceptedLinkId = useAccountLinkingStore((state) => state.setAcceptedLinkId)

  // Handlers ref tránh stale closure khi state hoặc params thay đổi
  const handlersRef = useRef<{ [event: string]: (data: any) => void }>({})
  const onMemberRemovedRef = useRef<((member: PusherMember) => void) | undefined>(undefined)

  useEffect(() => {
    if (determinedRole === Role.Student) {
      onMemberRemovedRef.current = (member: PusherMember) => {
        const currentParentRequest = useAccountLinkingStore.getState().parentRequestLink
        const currentAcceptedData = useAccountLinkingStore.getState().acceptedLinkData

        // Chỉ xử lý khi đang ở giai đoạn link-requested (đã nhận request và chưa hoàn thành accept)
        if (!currentParentRequest || currentAcceptedData) return

        const memberEmail = (member.userInfo?.email || '').trim().toLowerCase()
        const parentEmail = (currentParentRequest.parentEmail || '').trim().toLowerCase()
        const currentStudentEmail = (user?.email || studentEmail || '').trim().toLowerCase()

        const isParentMember = parentEmail
          ? memberEmail === parentEmail
          : !memberEmail || memberEmail !== currentStudentEmail

        if (isParentMember) {
          toast.warning(t('parent_left_channel'))
          useAccountLinkingStore.getState().setParentRequestLink(null)
          goBack()
        }
      }

      handlersRef.current = {
        // ✨ Dành riêng cho Student: Phụ huynh gửi yêu cầu -> Học sinh nhận thông báo và điều hướng phê duyệt
        'link-requested': (data: ParentRequestLink) => {
          toast.info(t('received_link_request'))
          setParentRequestLink(data)
          navigate(Routes.Auth.StudentLinkApproval, { approved: false })
        },

        // ✨ Dành riêng cho Student: Phụ huynh hủy yêu cầu kết nối
        'parent-link-cancelled': (data: any) => {
          toast.info(t('parent_cancelled_request'))
          goBack()
        },
      }
    } else {
      onMemberRemovedRef.current = (member: PusherMember) => {
        const memberEmail = member.userInfo?.email || ''

        const targetEmail = studentEmail?.trim().toLowerCase()
        const removedEmail = memberEmail.trim().toLowerCase()

        if (targetEmail && removedEmail === targetEmail) {
          toast.warning(t('student_left_channel'))
          goBack()
        }
      }
      handlersRef.current = {
        // ✨ Dành riêng cho Parent: Học sinh hủy / từ chối yêu cầu kết nối
        'student-link-cancelled': (data: any) => {
          toast.info(t('student_cancelled_request'))
          goBack()
        },

        'student-accepted': async (data: any) => {
          toast.info(t('student_accepted_request'))
          const linkId = data?.id || data?.linkId
          if(checkIsParent()){
            setAcceptedLinkId(linkId)
            return;
          }
          try {
            const res = await completeParentRoleIfPendingApi()
            const { token, user: userData } = res?.data?.data || {}      
            if (token) {
              await setDataStorage(ACCESS_TOKEN, token)
            }
            setAcceptedLinkId(linkId)
            if (userData) {
              await setUserCustom(userData)
            }
          } catch (error) {
            toast.error(getMessageFromError(t, error))
          }
        },
      }
    }
  }, [determinedRole, studentEmail, user, t])

  useEffect(() => {
    const targetEmail = studentEmail?.trim().toLowerCase();
    if (!pusher || !targetEmail) return

    const channelName = `presence-account-linking-${targetEmail}`

    const handleSubscribe = async () => {
      try {
        await subscribeChannel(
          pusher,
          channelName,
          () => Object.entries(handlersRef.current).map(([eventName, handler]) => ({
            eventName,
            handler,
          })),
          {
            onMemberRemoved: (member: PusherMember) => {
              onMemberRemovedRef.current?.(member)
            },
          }
        )
        console.log(`[Pusher] [${determinedRole.toUpperCase()}] Subscribed to presence channel: ${channelName}`)
      } catch (err) {
        console.error('[Pusher] Account linking subscription failed:', err)
      }
    }

    handleSubscribe()

    return () => {
      unsubscribeChannelSafe(pusher, channelName)
    }
  }, [pusher, studentEmail])
}

export default useAccountLinkingPusher
