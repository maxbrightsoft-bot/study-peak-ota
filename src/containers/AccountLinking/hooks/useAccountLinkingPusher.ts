import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { PusherMember } from '@pusher/pusher-websocket-react-native'
import useAuthStore from '@/store/useAuthStore'
import useAccountLinkingStore, { buildAccountLinkingChannelName } from '@/store/useAccountLinkingStore'
import { navigate, goBack, resetToHome } from '@/navigators/NavigationHelpers'
import { toast, checkIsParent } from '@/utils/helpers'
import { Routes } from '@/navigators/RouteName'
import { Role, AccountLinkMethod, AccountLinkStatus } from '@/utils/enums'

// Serialize unsubscribe -> subscribe so a late unsubscribe never kills a fresh subscription
let pendingUnsubscribe: Promise<unknown> = Promise.resolve()

export const useAccountLinkingPusher = () => {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const pusher = useAuthStore((state) => state.pusher)
  const subscribeChannel = useAuthStore((state) => state.subscribeChannel)
  const unsubscribeChannelSafe = useAuthStore((state) => state.unsubscribeChannelSafe)

  // Lấy email của student, methodLink và selectedRole từ Zustand store
  const studentEmail = useAccountLinkingStore((state) => state.studentEmail)
  const methodLink = useAccountLinkingStore((state) => state.methodLink)
  const selectedRole = useAccountLinkingStore((state) => state.selectedRole)

  const determinedRole: Role = checkIsParent()
    ? Role.Parent
    : selectedRole ?? Role.Student

  // Lấy hàm setParentRequestLink, setAcceptedLinkData, setAcceptedLinkId và clearLinkData từ store
  const setParentRequestLink = useAccountLinkingStore((state) => state.setParentRequestLink)
  const setAcceptedLinkId = useAccountLinkingStore((state) => state.setAcceptedLinkId)

  // Handlers ref tránh stale closure khi state hoặc params thay đổi
  const handlersRef = useRef<{ [event: string]: (data: any) => void | Promise<void> }>({})
  const onMemberRemovedRef = useRef<((member: PusherMember) => void) | undefined>(undefined)

  useEffect(() => {
    if (determinedRole === Role.Student) {
      onMemberRemovedRef.current = (member: PusherMember) => {
        const currentMethod = useAccountLinkingStore.getState().methodLink
        if (currentMethod === AccountLinkMethod.ShareLink) {
          return
        }
        const currentParentRequest = useAccountLinkingStore.getState().parentRequestLink
        const currentAcceptedData = useAccountLinkingStore.getState().acceptedLinkData

        // Chỉ xử lý khi đang ở giai đoạn link-requested (đã nhận request và chưa hoàn thành accept)
        if (!currentParentRequest || currentAcceptedData || currentParentRequest?.status === AccountLinkStatus.StudentApproval) return

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
        'link-requested': (data: any) => {
          toast.info(t('received_link_request'))
          const currentMethod = useAccountLinkingStore.getState().methodLink
          if (currentMethod === AccountLinkMethod.ShareLink) {
            return
          }
          const id = Number(data?.id)
          setParentRequestLink({
            ...data,
            id,
          })
          navigate(Routes.Auth.StudentLinkApproval, { approved: false })
        },

        // ✨ Dành riêng cho Student: Phụ huynh hủy yêu cầu kết nối
        'parent-link-cancelled': (data: any) => {
          toast.info(t('parent_cancelled_request'))
          const currentMethod = useAccountLinkingStore.getState().methodLink
          if (currentMethod === AccountLinkMethod.ShareLink) {
            return
          }
          goBack()
        },

        // ✨ Dành riêng cho Student: Phụ huynh đã chọn academy và hoàn tất kết nối
        'parent-accepted': (data: any) => {
          toast.success(t('link_completed_student'))
          const id = Number(data?.id)
          if (id) {
            setAcceptedLinkId(id)
          }
        },
      }
    } else {
      onMemberRemovedRef.current = (member: PusherMember) => {
        const currentMethod = useAccountLinkingStore.getState().methodLink
        if (currentMethod === AccountLinkMethod.ShareLink) {
          return
        }

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
          useAccountLinkingStore.getState().setIsCancelledByStudent(true)
          const currentMethod =
            useAccountLinkingStore.getState().methodLink ??
            useAccountLinkingStore.getState().acceptedLinkData?.linkMethod
          if (currentMethod === AccountLinkMethod.ShareLink) {
            resetToHome()
            return
          }
          goBack()
        },

        'student-accepted': (data: any) => {
          toast.info(t('student_accepted_request'))
          useAccountLinkingStore.getState().setIsStudentAccepted(true)
          const id = Number(data?.id)
          if (id) {
            navigate(Routes.Auth.ConvertParentRole, {
              linkId: id,
              isLinkingFlow: true,
              linkData: data,
            })
          }
        },
      }
    }
  }, [determinedRole, studentEmail, user, t])

  useEffect(() => {
    const targetEmail = studentEmail?.trim().toLowerCase();
    if (!pusher || !targetEmail) return

    const method = methodLink ?? AccountLinkMethod.Code;
    const isParent = determinedRole === Role.Parent || checkIsParent();

    const channelName = buildAccountLinkingChannelName(targetEmail, method, isParent, user?.superId);
    console.log(channelName);
    let cancelled = false

    const handleSubscribe = async () => {
      try {
        await pendingUnsubscribe
        if (cancelled) return
        const channel = await subscribeChannel(
          pusher,
          channelName,
          () => Object.entries(handlersRef.current).map(([eventName, handler]) => ({
            eventName,
            handler,
          })),
          {
            onSubscriptionSucceeded: () => {
              if (cancelled) return;
              useAccountLinkingStore.getState().setSubscribedChannel(channelName);
              if (__DEV__) {
                console.log(`[Pusher] [${determinedRole.toUpperCase()}] Subscription succeeded & members ready: ${channelName}`);
              }
            },
            onMemberRemoved: (member: PusherMember) => {
              onMemberRemovedRef.current?.(member);
            },
          }
        );
        if (cancelled) return;
        if (channel?.members instanceof Map && channel.members.size > 0) {
          useAccountLinkingStore.getState().setSubscribedChannel(channelName);
        }
      } catch (err) {
        console.error('[Pusher] Account linking subscription failed:', err)
      }
    }

    handleSubscribe()

    return () => {
      cancelled = true
      if (useAccountLinkingStore.getState().subscribedChannel === channelName) {
        useAccountLinkingStore.getState().setSubscribedChannel(null)
      }
      pendingUnsubscribe = unsubscribeChannelSafe(pusher, channelName)
    }
  }, [pusher, studentEmail, methodLink, user?.superId])
}

export default useAccountLinkingPusher
