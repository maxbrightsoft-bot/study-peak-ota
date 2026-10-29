import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, CommonActions } from '@react-navigation/native'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import { Routes, MainRoutes } from '@/navigators/RouteName'
import { navigationRef } from '@/navigators/NavigationHelpers'
import Navbar from '../components/Navbar'
import usePreventBack from '@/hooks/usePreventBack'
import {
  AcademySimpleResponse,
  getParentPendingAcademiesApi,
  submitConvertAcademiesApi,
  convertParentRoleAcademiesApi,
} from '../apiClients'
import { getSafeUrl, toast, getMessageFromError } from '@/utils/helpers'
import { ACCESS_TOKEN } from '@/utils/constants'
import { setDataStorage } from '@/utils/storage'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'

const ConvertParentRole = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const setUserCustom = useAuthStore((state) => state.setUserCustom)
  const acceptedLinkData = useAccountLinkingStore((state) => state.acceptedLinkData)
  const acceptedLinkId = useAccountLinkingStore((state) => state.acceptedLinkId)
  const isFromShareLink = useAccountLinkingStore((state) => state.isFromShareLink)

  const linkId = route.params?.linkId
  const targetDomain = useAccountLinkingStore((state) => state.targetDomain)
  const isLinkingFlow = Boolean(route.params?.isLinkingFlow)
  const linkData = route.params?.linkData
  const hasAcceptedId = Boolean(acceptedLinkData?.id || acceptedLinkId)

  usePreventBack(() => {
    if (!isLinkingFlow || isFromShareLink) return false
    const isAccepted = Boolean(
      useAccountLinkingStore.getState().acceptedLinkId ||
      useAccountLinkingStore.getState().acceptedLinkData?.id
    )
    return !isAccepted
  })

  const [academies, setAcademies] = useState<AcademySimpleResponse[]>([])
  const [alreadyParentAcademies, setAlreadyParentAcademies] = useState<AcademySimpleResponse[]>([])
  const [autoAddAcademies, setAutoAddAcademies] = useState<AcademySimpleResponse[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false)

  const targetAcademy = targetDomain ? academies.find((a) => a.domain === targetDomain) : undefined

  useEffect(() => {
    if (!linkId) {
      setIsLoading(false)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)

    getParentPendingAcademiesApi(linkId, controller.signal)
      .then((res) => {
        const data = res.data?.data
        const convertList = data?.convertAcademies ?? (Array.isArray(data) ? data : [])
        const alreadyList = data?.alreadyParentAcademies ?? []
        const autoList = data?.autoAddAcademies ?? []

        setAcademies(convertList)
        setAlreadyParentAcademies(alreadyList)
        setAutoAddAcademies(autoList)

        const matched = targetDomain ? convertList.find((a) => a.domain === targetDomain) : undefined

        // Trường hợp không có academy nào cần chuyển đổi,
        // hoặc có targetDomain nhưng không nằm trong convertList (tức đã thuộc alreadyParent hoặc autoAdd):
        // Tự động gọi handleSubmitNewFlow([]) để chuyển sang màn chờ duyệt
        if (isLinkingFlow && (convertList.length === 0 || (targetDomain && !matched))) {
          setIsAutoSubmitting(true)
          handleSubmit([])
          return
        }

        if (targetDomain && matched) {
          setSelectedIds([matched.id])
        } else {
          setSelectedIds(isLinkingFlow ? convertList.map((a) => a.id) : [])
        }
      })
      .catch((err) => {
        if (err.name !== 'CanceledError' && err.message !== 'canceled') {
          console.error('[ConvertParentRole] Get pending academies error:', err)
          toast.error(getMessageFromError(t, err))
        }
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => controller.abort()
  }, [linkId, targetDomain, isLinkingFlow])

  const isAllSelected = academies.length > 0 && selectedIds.length === academies.length

  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(targetAcademy ? [targetAcademy.id] : [])
    } else {
      setSelectedIds(academies.map((a) => a.id))
    }
  }

  const handleToggleAcademy = (id: number) => {
    if (targetAcademy && id === targetAcademy.id) {
      return
    }

    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  useEffect(() => {
    return () => {
      useAccountLinkingStore.getState().setIsFromShareLink(false)
    }
  }, [])

  const handleSubmit = async (academyIdsToSubmit: number[]) => {
    if (isSubmitting || !linkId) return

    try {
      setIsSubmitting(true)
      const res = isLinkingFlow
        ? await submitConvertAcademiesApi(linkId, {
            academyIds: academyIdsToSubmit
          })
        : await convertParentRoleAcademiesApi(linkId, {
            academyIds: academyIdsToSubmit
          })
      const { token, user: userData } = res?.data?.data || {}
      if (token) {
        await setDataStorage(ACCESS_TOKEN, token)
      }
      if (userData) {
        await setUserCustom(userData)
      }
      toast.success(t('convert_role_success'))

      if (isLinkingFlow) {
        useAccountLinkingStore.getState().setAcceptedLinkData({ id: linkId, ...linkData } as any)
      }
      useAccountLinkingStore.getState().setAcceptedLinkId(linkId)
      useAccountLinkingStore.getState().fetchWaitingApprovalRequestsApi()
      useAccountLinkingStore.getState().checkUnsyncedLinksApi()

      if (isFromShareLink) {
        const pendingRedirectUrl = route.params?.redirectUrl || useAuthStore.getState().pendingRedirectUrl
        const pendingRedirectParams = route.params?.redirectParams || useAuthStore.getState().pendingRedirectParams
        useAuthStore.getState().clearRedirectUrl()

        if (pendingRedirectUrl) {
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
                              name: pendingRedirectUrl,
                              params: pendingRedirectParams,
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
          return
        }
      }

      navigation.goBack()
    } catch (error) {
      toast.error(getMessageFromError(t, error))
      setIsAutoSubmitting(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    if(isFromShareLink) {
      navigation.pop(2);
      return
    }
    navigation.goBack()
  }

  const handleConfirm = async () => {
    if(isLinkingFlow && alreadyParentAcademies.length === 0 && autoAddAcademies.length === 0 && selectedIds.length === 0){
      toast.warning(t('please_select_at_least_one_academy'))
      return
    }
    await handleSubmit(selectedIds)
  }

  const renderContent = () => {
    if (isLoading || isAutoSubmitting) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#5F30AA" />
        </View>
      )
    }

    const hasConvertAcademies = academies.length > 0
    const hasAlreadyParent = alreadyParentAcademies.length > 0
    const hasAutoAdd = autoAddAcademies.length > 0

    if (!hasConvertAcademies && !hasAlreadyParent && !hasAutoAdd) {
      return (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Ionicons name="checkmark-done-circle" size={48} color="#2ECC71" />
          </View>
          <Text style={styles.emptyTitle}>{t('no_academies_to_convert')}</Text>
          <Text style={styles.emptyDesc}>{t('no_academies_to_convert_desc')}</Text>
          <TouchableOpacity
            style={styles.emptyCloseButton}
            onPress={handleSkip}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text
                style={styles.emptyCloseButtonText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {isLinkingFlow ? t('continue') : t('close')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )
    }

    return (
      <>
        {/* Instruction Subtitle */}
        <Text style={styles.instructionText}>
          {hasConvertAcademies
            ? t('select_academies_to_convert')
            : t('no_academies_to_convert_desc')}
        </Text>

        {/* Select all row */}
        {hasConvertAcademies && (
          <View style={styles.selectAllRow}>
            <TouchableOpacity
              style={styles.selectAllButton}
              onPress={handleToggleAll}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <View style={[styles.checkbox, isAllSelected && styles.checkboxActive]}>
                {isAllSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
              </View>
              <Text style={styles.selectAllText}>
                {isAllSelected ? t('deselect_all') : t('select_all')}
              </Text>
            </TouchableOpacity>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>
                {t('selected_academies_count', { count: selectedIds.length })}
              </Text>
            </View>
          </View>
        )}

        {/* Academy list */}
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
        >
          {academies.map((academy) => {
            const isSelected = selectedIds.includes(academy.id)
            const isTargetAcademy = Boolean(targetDomain && academy.domain === targetDomain)

            return (
              <TouchableOpacity
                key={academy.id}
                style={[
                  styles.academyCard,
                  isSelected && styles.academyCardSelected,
                  isTargetAcademy && styles.academyCardTarget,
                ]}
                onPress={() => handleToggleAcademy(academy.id)}
                activeOpacity={0.7}
                disabled={isSubmitting || isTargetAcademy}
              >
                {/* Checkbox */}
                <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                  {isSelected && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>

                {/* Logo / Avatar */}
                {academy.image ? (
                  <Image
                    source={{ uri: getSafeUrl(academy.image) }}
                    style={styles.academyLogo}
                  />
                ) : (
                  <View style={styles.academyLogoFallback}>
                    <Ionicons name="business" size={20} color="#5F30AA" />
                  </View>
                )}

                {/* Info */}
                <View style={styles.academyInfo}>
                  <View style={styles.academyNameRow}>
                    <Text style={styles.academyName} numberOfLines={1}>
                      {!academy.domain ? t('my_study_space') : academy.name}
                    </Text>
                    {isTargetAcademy && (
                      <View style={styles.targetBadge}>
                        <Text style={styles.targetBadgeText}>
                          {t('required_to_view_results')}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )
          })}

          {/* Nhóm học viện đã có sẵn vai trò Phụ huynh */}
          {hasAlreadyParent && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {t('academies_already_parent_role')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('academies_already_parent_role_desc')}
              </Text>
              {alreadyParentAcademies.map((academy) => (
                <View key={`already-${academy.id}`} style={[styles.academyCard, styles.academyCardReadOnly]}>
                  <View style={styles.readOnlyIndicator}>
                    <Ionicons name="checkmark-circle" size={22} color="#10B981" />
                  </View>
                  {academy.image ? (
                    <Image
                      source={{ uri: getSafeUrl(academy.image) }}
                      style={styles.academyLogo}
                    />
                  ) : (
                    <View style={styles.academyLogoFallback}>
                      <Ionicons name="business" size={20} color="#5F30AA" />
                    </View>
                  )}
                  <View style={styles.academyInfo}>
                    <View style={styles.academyNameRow}>
                      <Text style={styles.academyName} numberOfLines={1}>
                        {!academy.domain ? t('my_study_space') : academy.name}
                      </Text>
                      <View style={styles.alreadyParentBadge}>
                        <Text style={styles.alreadyParentBadgeText}>
                          {t('already_has_parent_role')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Nhóm học viện chưa tham gia (sẽ tự động thêm vai trò Phụ huynh) */}
          {hasAutoAdd && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>
                {t('academies_auto_add_parent_role')}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {t('academies_auto_add_parent_role_desc')}
              </Text>
              {autoAddAcademies.map((academy) => (
                <View key={`auto-${academy.id}`} style={[styles.academyCard, styles.academyCardReadOnly]}>
                  <View style={styles.readOnlyIndicator}>
                    <Ionicons name="add-circle" size={22} color="#6366F1" />
                  </View>
                  {academy.image ? (
                    <Image
                      source={{ uri: getSafeUrl(academy.image) }}
                      style={styles.academyLogo}
                    />
                  ) : (
                    <View style={styles.academyLogoFallback}>
                      <Ionicons name="business" size={20} color="#5F30AA" />
                    </View>
                  )}
                  <View style={styles.academyInfo}>
                    <View style={styles.academyNameRow}>
                      <Text style={styles.academyName} numberOfLines={1}>
                        {!academy.domain ? t('my_study_space') : academy.name}
                      </Text>
                      <View style={styles.autoAddBadge}>
                        <Text style={styles.autoAddBadgeText}>
                          {t('will_auto_add_role')}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          {!isLinkingFlow && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              disabled={isSubmitting}
              activeOpacity={0.7}
            >
              <Text style={styles.skipButtonText}>{t('cancel')}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.confirmButton,
              isLinkingFlow && { flex: 1 },
              ((!isLinkingFlow && selectedIds.length === 0) || isSubmitting) && styles.disabledButton
            ]}
            onPress={handleConfirm}
            disabled={(!isLinkingFlow && selectedIds.length === 0) || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text
                style={styles.confirmButtonText}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {isLinkingFlow ? t('continue') : t('confirm_convert')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </>
    )
  }

  return (
    <View style={styles.container}>
      <Navbar
        title={t('convert_parent_role_title')}
        showBack={!isAutoSubmitting && (!isLinkingFlow || hasAcceptedId || isFromShareLink)}
        onBackPress={handleSkip}
      />
      <View style={styles.body}>{renderContent()}</View>
    </View>
  )
}

export default ConvertParentRole

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  body: {
    flex: 1,
    paddingHorizontal: '20@ms',
    paddingTop: '16@ms'
  },
  instructionText: {
    ...TYPO.body2,
    fontSize: '13@ms',
    lineHeight: '19@ms',
    color: palette.grey[600],
    marginBottom: '14@ms'
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: '10@ms',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[200],
    marginBottom: '12@ms'
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  selectAllText: {
    ...TYPO.body2,
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#1C1917'
  },
  countBadge: {
    backgroundColor: '#F4F0FA',
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms'
  },
  countBadgeText: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#5F30AA'
  },
  listContainer: {
    flex: 1
  },
  listContent: {
    paddingBottom: '20@ms',
    gap: '10@ms'
  },
  academyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: '12@ms',
    borderRadius: '14@ms',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFEFEF',
    gap: '12@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1
  },
  academyCardSelected: {
    borderColor: '#5F30AA',
    backgroundColor: '#FAF7FD'
  },
  academyCardTarget: {
    borderColor: '#7B2CBF',
    backgroundColor: '#FAF5FF',
    borderWidth: 2,
  },
  checkbox: {
    width: '20@ms',
    height: '20@ms',
    borderRadius: '6@ms',
    borderWidth: 1.5,
    borderColor: palette.grey[400],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF'
  },
  checkboxActive: {
    backgroundColor: '#5F30AA',
    borderColor: '#5F30AA'
  },
  academyLogo: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.grey[100]
  },
  academyLogoFallback: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '10@ms',
    backgroundColor: '#F4F0FA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  academyInfo: {
    flex: 1,
    justifyContent: 'center'
  },
  academyNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8@ms',
    marginBottom: '2@ms'
  },
  academyName: {
    ...TYPO.body1,
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.grey[900],
    flexShrink: 1,
  },
  targetBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  targetBadgeText: {
    fontSize: '10@ms',
    fontWeight: '700',
    color: '#6D28D9',
  },
  academyDomain: {
    ...TYPO.caption,
    fontSize: '12@ms',
    color: palette.grey[500]
  },
  sectionContainer: {
    marginTop: '14@ms',
    gap: '8@ms'
  },
  sectionTitle: {
    ...TYPO.body2,
    fontSize: '13@ms',
    fontWeight: '700',
    color: palette.grey[700],
    marginBottom: '2@ms'
  },
  sectionSubtitle: {
    fontSize: '11@ms',
    color: palette.grey[500],
    marginBottom: '8@ms',
    marginTop: '2@ms'
  },
  academyCardReadOnly: {
    backgroundColor: '#F8F9FA',
    borderColor: '#E9ECEF'
  },
  readOnlyIndicator: {
    width: '22@ms',
    height: '22@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  alreadyParentBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: '#A7F3D0'
  },
  alreadyParentBadgeText: {
    fontSize: '10@ms',
    fontWeight: '700',
    color: '#065F46'
  },
  autoAddBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: '8@ms',
    paddingVertical: '2@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: '#E0E7FF'
  },
  autoAddBadgeText: {
    fontSize: '10@ms',
    fontWeight: '700',
    color: '#4338CA'
  },
  footer: {
    flexDirection: 'row',
    gap: '12@ms',
    paddingVertical: '16@ms',
    backgroundColor: '#FAFAFB',
    borderTopWidth: 1,
    borderTopColor: palette.grey[200]
  },
  skipButton: {
    flex: 1,
    height: '48@ms',
    borderRadius: '12@ms',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#DFD8EF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  skipButtonText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#5F30AA'
  },
  confirmButton: {
    flex: 1.5,
    height: '48@ms',
    borderRadius: '12@ms',
    backgroundColor: '#5F30AA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmButtonText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#FFF'
  },
  disabledButton: {
    opacity: 0.5
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12@ms'
  },
  loadingText: {
    ...TYPO.body2,
    fontSize: '13@ms',
    color: palette.grey[500]
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '20@ms'
  },
  emptyIconCircle: {
    width: '72@ms',
    height: '72@ms',
    borderRadius: '36@ms',
    backgroundColor: '#EAFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16@ms'
  },
  emptyTitle: {
    ...TYPO.heading2,
    fontSize: '17@ms',
    fontWeight: '800',
    color: palette.grey[900],
    marginBottom: '6@ms',
    textAlign: 'center'
  },
  emptyDesc: {
    ...TYPO.body2,
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center',
    lineHeight: '19@ms',
    marginBottom: '24@ms'
  },
  emptyCloseButton: {
    height: '44@ms',
    paddingHorizontal: '32@ms',
    borderRadius: '12@ms',
    backgroundColor: '#5F30AA',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyCloseButtonText: {
    color: '#FFF',
    fontSize: '14@ms',
    fontWeight: '700'
  }
})
