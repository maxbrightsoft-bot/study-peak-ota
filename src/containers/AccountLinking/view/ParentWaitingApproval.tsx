import React, { useEffect, useCallback, useRef, useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation, useRoute, CommonActions, useFocusEffect } from '@react-navigation/native'
import { palette, TYPO } from '@/theme'
import { Routes, MainRoutes } from '@/navigators/RouteName'
import { toast, getMessageFromError } from '@/utils/helpers'
import { navigationRef, resetToHome } from '@/navigators/NavigationHelpers'
import Navbar from '../components/Navbar'
import LinkedStateCard from '../components/LinkedStateCard'
import ExpiryProgressBar from '../components/ExpiryProgressBar'
import {
  rejectLinkAccountApi,
  getAccountLinkDetailApi,
  deleteLinkApi,
  AccountLinkMethod,
  getParentPendingAcademiesApi,
  AcademySimpleResponse
} from '../apiClients'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'

const ParentWaitingApproval = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const setLoading = useAuthStore((state) => state.setLoading)
  const linkedStudents = useAuthStore((state) => state.linkedStudents)
  const setLinkedStudents = useAuthStore((state) => state.setLinkedStudents)
  const linkData = route.params?.linkData
  const acceptedLinkData = useAccountLinkingStore((state) => state.acceptedLinkData)
  const isShareLink = Boolean(
    (acceptedLinkData?.linkMethod ?? linkData?.linkMethod) === AccountLinkMethod.ShareLink
  );
  const acceptedLinkId = useAccountLinkingStore((state) => state.acceptedLinkId)
  const setAcceptedLinkData = useAccountLinkingStore((state) => state.setAcceptedLinkData)
  const setStudentEmail = useAccountLinkingStore((state) => state.setStudentEmail)
  const isApproved = Boolean(acceptedLinkData || route.params?.approved)
  const clearLinkData = useAccountLinkingStore((state) => state.clearLinkData)
  const pendingRedirectUrl = route.params?.redirectUrl || useAuthStore((state) => state.pendingRedirectUrl)
  const pendingRedirectParams = route.params?.redirectParams || useAuthStore((state) => state.pendingRedirectParams)
  const clearRedirectUrl = useAuthStore((state) => state.clearRedirectUrl)
  const [isPromptModalVisible, setIsPromptModalVisible] = useState(false)
  const [pendingAcademies, setPendingAcademies] = useState<AcademySimpleResponse[]>([])
  const targetLinkId = acceptedLinkData?.id || acceptedLinkId || linkData?.id
  const hasPromptShownRef = useRef<number | null>(null)

  const idSuperStudent = route.params?.idSuperStudent

  const isStudentLinked = Boolean(
    idSuperStudent &&
    linkedStudents?.some(
      (s) => s.studentSuperId === Number(idSuperStudent)
    )
  )

  const targetDomain = route.params?.targetDomain

  const linkStateRef = useRef({
    isApproved,
    isCancelled: false,
    linkId: linkData?.id
  })
  linkStateRef.current.isApproved = isApproved
  linkStateRef.current.linkId = linkData?.id

  useEffect(() => {
    if (acceptedLinkData) {
      setStudentEmail(null)
    }
  }, [acceptedLinkData])

  useEffect(() => {
    const controller = new AbortController()
    if (acceptedLinkId) {
      getAccountLinkDetailApi(acceptedLinkId, controller.signal)
        .then((res) => {
          if (res.data?.data) {
            const linkDetail = res.data.data
            setAcceptedLinkData(linkDetail)
            if ((!linkedStudents || linkedStudents.length === 0)) {
              setLinkedStudents([{...linkDetail,id:linkDetail.linkIdAcademy!}])
            }
          }
        })
        .catch((err) => {
          if (err.name !== 'CanceledError' && err.message !== 'canceled') {
            toast.error(getMessageFromError(t, err))
          }
        })
    }
    return () => controller.abort()
  }, [acceptedLinkId, t])

  useFocusEffect(
    useCallback(() => {
      const linkId = targetLinkId
      if (linkId && isApproved) {
        const controller = new AbortController()
        getParentPendingAcademiesApi(linkId, controller.signal)
          .then((res) => {
            const list = res.data?.data || []
            setPendingAcademies(list)
            if (list.length > 0 && hasPromptShownRef.current !== linkId) {
                hasPromptShownRef.current = linkId
                setIsPromptModalVisible(true)
              }
          })
          .catch((err) => {
            if (err.name !== 'CanceledError' && err.message !== 'canceled') {
              console.error('[ParentWaitingApproval] Refresh pending academies error:', err)
            }
          })
        return () => controller.abort()
      }
    }, [targetLinkId, isApproved])
  )

  useEffect(() => {
    return () => {
      const isCancelledByStudent = useAccountLinkingStore.getState().isCancelledByStudent
      const isAccepted = Boolean(
        linkStateRef.current.isApproved || useAccountLinkingStore.getState().acceptedLinkId
      )
      clearLinkData()
      if (isAccepted) {
        useAuthStore.getState().clearRedirectUrl()
      }
      const { isApproved, isCancelled, linkId } = linkStateRef.current
      if (!isApproved && !isCancelled && !isCancelledByStudent && linkId) {
        rejectLinkAccountApi(linkId).catch((err) => {
          console.log('[ParentWaitingApproval] Auto cancel on unmount failed:', err)
        })
      }
    }
  }, [])

  const handleExpire = useCallback(() => {
    toast.info(t('link_request_expired'))
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [t])

  const handleBack = () => {
      navigation.popTo(Routes.Auth.ParentAccountLinking)
  }

  const handleRedirectToExamResult = () => {
    const url = pendingRedirectUrl
    const params = pendingRedirectParams
    clearRedirectUrl()

    if (url) {
      navigationRef.current?.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            {
              name: MainRoutes.AuthStack,
              state: {
                routes: [
                  {
                    name: Routes.Auth.MainTabs,
                    state: {
                      routes: [
                        {
                          name: url,
                          params,
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
  }

  const handleConfirmPrompt = () => {
    setIsPromptModalVisible(false)
    if (targetLinkId) {
      navigation.navigate(Routes.Auth.ConvertParentRole, {
        linkId: targetLinkId,
        targetDomain,
        redirectUrl: pendingRedirectUrl,
        redirectParams: pendingRedirectParams,
      })
    }
  }

  const handleOpenConvertScreen = () => {
    if (targetLinkId) {
      navigation.navigate(Routes.Auth.ConvertParentRole, {
        linkId: targetLinkId,
        targetDomain,
        redirectUrl: pendingRedirectUrl,
        redirectParams: pendingRedirectParams,
      })
    }
  }

  const handleCancelRequest = () => {
    Alert.alert(
      t('confirm_cancel_request'),
      t('confirm_cancel_request_desc'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              linkStateRef.current.isCancelled = true
              setLoading(true)
              const linkId = linkData?.id
              if (linkId) {
                await rejectLinkAccountApi(linkId)
              }
              toast.success(t('cancel_request_success'))
            } catch (error: any) {
              linkStateRef.current.isCancelled = false
              toast.error(getMessageFromError(t, error))
            } finally {
              navigation.goBack()
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  const handleUnlink = () => {
    Alert.alert(
      t('confirm_unlink'),
      t('confirm_unlink_desc'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              const id = acceptedLinkData?.id || acceptedLinkId || linkData?.id
              if (id) {
                await deleteLinkApi(id)
              }
              toast.success(t('unlink_success'))
              if (isShareLink) {
                resetToHome()
              } else {
                navigation.popTo(Routes.Auth.ParentAccountLinking)
              }
            } catch (error: any) {
              toast.error(getMessageFromError(t, error))
            } finally {
              setLoading(false)
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Navbar đầu trang */}
      <Navbar
        title={isApproved ? t('our_child') : t('link_child')}
        showBack={false}
        showHome={isApproved}
        onBackPress={handleBack}
      />

      <View style={styles.content}>
        {isApproved ? (
          <LinkedStateCard
            data={acceptedLinkData}
            isParentView
            onUnlink={handleUnlink}
          />
        ) : (
          /* Giao diện B9: 자녀 승인 대기 */
          <View style={styles.reqCard}>
            {/* Vòng tròn Icon Đồng hồ */}
            <View style={styles.iconCircle}>
              <Ionicons name="time-outline" size={32} color="#5F30AA" />
            </View>

            {/* Tiêu đề */}
            <Text style={styles.titleText}>
              {t('waiting_for_child_approval')}
            </Text>

            {/* Mô tả chi tiết */}
            <Text style={styles.descText}>
              {t('link_waiting_instruction')}
            </Text>

            {/* Thanh tiến trình tải giả lập cao cấp & bộ đếm ngược (không cần khi liên kết bằng share link) */}
            {!isShareLink && (
              <ExpiryProgressBar
                expiredTime={linkData?.expiredTime}
                createdAt={linkData?.createdAt}
                onExpire={handleExpire}
              />
            )}
          </View>
        )}
      </View>

      {/* Nút bấm hành động chân trang */}
      <View style={styles.ctaWrapper}>
        {isApproved ? (
          <>
            {Boolean(isShareLink && pendingRedirectUrl && isStudentLinked) && (
              <TouchableOpacity
                style={styles.redirectButton}
                onPress={handleRedirectToExamResult}
                activeOpacity={0.8}
              >
                <Ionicons name="document-text-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.redirectButtonText}>
                  {t('view_results')}
                </Text>
              </TouchableOpacity>
            )}

            {pendingAcademies.length > 0 && (
              <TouchableOpacity
                style={styles.convertRoleButton}
                onPress={handleOpenConvertScreen}
                activeOpacity={0.8}
              >
                <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.convertRoleButtonText}>
                  {isShareLink
                    ? t('convert_parent_role_to_view_results')
                    : t('convert_parent_role_title')}
                </Text>
              </TouchableOpacity>
            )}

            {/* Khớp <!-- B10 ghost button --> */}
            <TouchableOpacity
              style={styles.linkMoreButton}
              onPress={() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: Routes.Auth.ParentAccountLinking }],
                })
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="link-outline" size={18} color="#5F30AA" style={{ marginRight: 6 }} />
              <Text style={styles.linkMoreText}>
                {t('link_another_child')}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          /* Khớp <!-- B9 cancel button --> */
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancelRequest}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelText}>{t('cancel_request')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Modal thông báo có học viện cần chuyển đổi sang vai trò Phụ huynh */}
      <ConfirmDialog
        open={isPromptModalVisible}
        toggle={() => setIsPromptModalVisible(false)}
        title={
          isShareLink
            ? t('convert_parent_role_to_view_results')
            : t('convert_parent_role_title')
        }
        text={
          isShareLink
            ? t('convert_parent_role_to_view_results_desc')
            : t('convert_parent_role_desc')
        }
        cancelText={t('close')}
        okText={t('confirm')}
        onConfirm={handleConfirmPrompt}
      />
    </View>
  )
}

export default ParentWaitingApproval

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  content: {
    flex: 1,
    paddingHorizontal: '24@ms',
    alignItems: 'center',
  },
  reqCard: {
    marginTop: '50@ms',
    backgroundColor: '#FFF',
    borderRadius: '20@ms',
    padding: '24@ms',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3
  },
  iconCircle: {
    width: '64@ms',
    height: '64@ms',
    borderRadius: '32@ms',
    backgroundColor: '#F4F0FA', // --brand-soft
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '18@ms'
  },
  titleText: {
    ...TYPO.heading2,
    fontSize: '19@ms',
    fontWeight: '800',
    color: palette.grey[900],
    textAlign: 'center',
    marginBottom: '10@ms'
  },
  descText: {
    ...TYPO.body2,
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center',
    lineHeight: '20@ms',
    paddingHorizontal: '12@ms',
    marginBottom: '24@ms'
  },
  progressContainer: {
    width: '100%',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: palette.grey[100] || '#DFDFE0',
    overflow: 'hidden',
    marginBottom: '14@ms'
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5F30AA', // --brand
    borderRadius: '3@ms'
  },
  countdownText: {
    fontSize: '12@ms',
    color: palette.grey[400] || '#C7C7C8',
    fontWeight: '600'
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '24@ms',
    paddingBottom: '28@ms',
    paddingTop: '10@ms',
    backgroundColor: 'transparent'
  },
  cancelButton: {
    height: '50@ms',
    borderRadius: '14@ms',
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    color: palette.grey[700] || '#5D5D5B',
    fontSize: '15@ms',
    fontWeight: '700'
  },
  /* Styles mới cho B10 Complete */
  completeContainer: {
    width: '100%',
    alignItems: 'center'
  },
  successRing: {
    width: '72@ms',
    height: '72@ms',
    borderRadius: '36@ms',
    backgroundColor: '#EAFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12@ms',
    marginTop: '10@ms'
  },
  completeTitleText: {
    ...TYPO.heading2,
    fontSize: '18@ms',
    fontWeight: '800',
    color: palette.grey[900],
    textAlign: 'center',
    marginBottom: '4@ms'
  },
  emailText: {
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center',
    marginBottom: '20@ms'
  },
  childCard: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: '16@ms',
    overflow: 'hidden'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '16@ms',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2'
  },
  avatarCircle: {
    width: '44@ms',
    height: '44@ms',
    borderRadius: '22@ms',
    backgroundColor: '#5F30AA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '700'
  },
  headerInfo: {
    flex: 1
  },
  childName: {
    fontSize: '15@ms',
    fontWeight: '800',
    color: palette.grey[900]
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '2@ms'
  },
  greenDot: {
    width: '6@ms',
    height: '6@ms',
    borderRadius: '3@ms',
    backgroundColor: '#2ECC71',
    marginRight: '6@ms'
  },
  statusText: {
    fontSize: '12@ms',
    color: palette.grey[500]
  },
  badgeContainer: {
    flexDirection: 'row',
    paddingHorizontal: '18@ms',
    paddingTop: '10@ms',
    paddingBottom: '14@ms',
    flexWrap: 'wrap',
    gap: '6@ms'
  },
  badge: {
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '8@ms'
  },
  badgeText: {
    color: '#5F30AA',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  cardActions: {
    flexDirection: 'row',
    gap: '10@ms',
    width: '100%'
  },
  actionBtn: {
    height: '44@ms',
    borderRadius: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6@ms'
  },
  primaryBtn: {
    flex: 1.4,
    backgroundColor: '#5F30AA'
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: '13@ms',
    fontWeight: '700'
  },
  dangerBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#FDEDEC',
    backgroundColor: '#FFF'
  },
  dangerBtnText: {
    color: '#E74C3C',
    fontSize: '13@ms',
    fontWeight: '700'
  },
  linkMoreButton: {
    height: '50@ms',
    borderRadius: '14@ms',
    backgroundColor: '#F4F0FA',
    borderWidth: 1,
    borderColor: '#DFD8EF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  linkMoreText: {
    color: '#5F30AA',
    fontSize: '15@ms',
    fontWeight: '700'
  },
  redirectButton: {
    height: '50@ms',
    borderRadius: '14@ms',
    backgroundColor: '#5F30AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10@ms'
  },
  redirectButtonText: {
    color: '#FFF',
    fontSize: '15@ms',
    fontWeight: '700'
  },
  convertRoleButton: {
    height: '50@ms',
    borderRadius: '14@ms',
    backgroundColor: '#5F30AA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '10@ms'
  },
  convertRoleButtonText: {
    color: '#FFF',
    fontSize: '15@ms',
    fontWeight: '700'
  }
})
