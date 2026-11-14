import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Dimensions
} from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import BottomSheet from '@/components/ModalBase/BottomSheet'
import {
  AccountLinkResponse,
  AcademySimpleResponse,
  getLinkedAcademiesApi
} from '@/containers/AccountLinking/apiClients'
import { switchAcademy } from '@/layouts/apiClients/academyServices'
import useLogin from '@/containers/Login/hooks/useLogin'
import useAuthStore from '@/store/useAuthStore'
import { Role } from '@/utils/enums'
import { LoginAccessTokenRequest } from '@/utils/types'
import { Routes } from '@/navigators/RouteName'
import { getMessageFromError, toast } from '@/utils/helpers'

interface ConnectedAcademiesModalProps {
  open: boolean
  onClose: () => void
  link: AccountLinkResponse | null
  isParentRole: boolean
  onSwitchSuccess?: () => void
}

const ConnectedAcademiesModal = ({
  open,
  onClose,
  link,
  isParentRole,
  onSwitchSuccess
}: ConnectedAcademiesModalProps) => {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const selectedAcademy = useAuthStore((state) => state.selectedAcademy)
  const selectedStudentSuperId = useAuthStore((state) => state.selectedStudentSuperId)
  const parentViewMode = useAuthStore((state) => state.parentViewMode)
  const setLoadingWithoutOverlay = useAuthStore((state) => state.setLoadingWithoutOverlay)
  const setSelectAcademy = useAuthStore((state) => state.setSelectAcademy)
  const { handleLoginAccessToken } = useLogin()

  const [academies, setAcademies] = useState<AcademySimpleResponse[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [switchingId, setSwitchingId] = useState<number | null>(null)

  useEffect(() => {
    let isMounted = true
    if (open && link?.id) {
      setLoading(true)
      getLinkedAcademiesApi(link.id)
        .then((res) => {
          if (isMounted) {
            // Defense filter to ensure non-empty domain
            const items = (res.data?.data || []).filter(
              (a) => a.domain && a.domain.trim() !== ''
            )
            setAcademies(items)
          }
        })
        .catch((err) => {
          if (isMounted) {
            toast.error(getMessageFromError(t, err))
          }
        })
        .finally(() => {
          if (isMounted) {
            setLoading(false)
          }
        })
    } else {
      setAcademies([])
    }
    return () => {
      isMounted = false
    }
  }, [open, link?.id])

  const handleSwitch = async (targetAcademy: AcademySimpleResponse) => {
    if (!targetAcademy.domain) {
      toast.error(t('invalid_academy_domain', 'Cơ sở không hợp lệ'))
      return
    }

    const isSameAcademy = Boolean(
      targetAcademy.domain &&
        (user?.academyDomain === targetAcademy.domain || selectedAcademy?.id === targetAcademy.id)
    )
    const currentStudentSuperId = selectedStudentSuperId ?? parentViewMode?.studentSuperId
    const isCurrent = isParentRole
      ? isSameAcademy && currentStudentSuperId === link?.studentId
      : isSameAcademy

    if (isCurrent) {
      return
    }

    setSwitchingId(targetAcademy.id)
    setLoadingWithoutOverlay(true)
    try {
      // Keep counterpart id if user is acting as parent in this link record
      if (isParentRole) {
        useAuthStore.getState().setSelectedStudentSuperId(link?.studentId || null)
      } else {
        useAuthStore.getState().setSelectedStudentSuperId(null)
      }

      const userRole = isParentRole ? Role.Parent : Role.Student
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
        Routes.Auth.Home
      )

      setSelectAcademy(targetAcademy as any)
      onClose()
      onSwitchSuccess?.()
    } catch (error: any) {
      toast.error(getMessageFromError(t, error))
    } finally {
      setLoadingWithoutOverlay(false)
      setSwitchingId(null)
    }
  }

  const linkedUserName = isParentRole
    ? link?.studentName || link?.studentEmail
    : link?.parentName || link?.parentEmail

  return (
    <BottomSheet
      isVisible={open}
      onClose={onClose}
      title={t('connected_academies', 'Cơ sở liên kết')}
    >
      <View style={styles.container}>
        {link && (
          <View style={styles.linkInfoBox}>
            <Text style={styles.linkInfoLabel}>
              {isParentRole ? t('student', 'Học sinh') : t('parent', 'Phụ huynh')}:
            </Text>
            <Text style={styles.linkInfoName} numberOfLines={1}>
              {linkedUserName}
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#5F30AA" />
          </View>
        ) : academies.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={40} color="#BBB" />
            <Text style={styles.emptyText}>
              {t('no_connected_academies', 'Chưa có cơ sở nào được liên kết')}
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
            {academies.map((item) => {
              const isSwitching = switchingId === item.id
              const isSameAcademy = Boolean(
                item.domain &&
                  (user?.academyDomain === item.domain)
              )
              const currentStudentSuperId = parentViewMode?.studentSuperId
              const isCurrent = isParentRole
                ? isSameAcademy && currentStudentSuperId === link?.studentId
                : isSameAcademy

              return (
                <View key={item.id} style={styles.academyItem}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.academyImage} />
                  ) : (
                    <View style={styles.academyImagePlaceholder}>
                      <Text style={styles.academyInitial}>
                        {(item.name || 'A').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}

                  <View style={styles.academyInfo}>
                    <Text style={styles.academyName} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.domain ? (
                      <Text style={styles.academyDomain} numberOfLines={1}>
                        @{item.domain}
                      </Text>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={[styles.switchBtn, isCurrent && styles.currentBtn]}
                    onPress={() => handleSwitch(item)}
                    disabled={isSwitching || isCurrent}
                    activeOpacity={isCurrent ? 1 : 0.7}
                  >
                    {isSwitching ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <>
                        <Ionicons
                          name={isCurrent ? 'checkmark-circle' : 'swap-horizontal'}
                          size={15}
                          color={isCurrent ? '#5F30AA' : '#FFF'}
                        />
                        <Text style={[styles.switchBtnText, isCurrent && styles.currentBtnText]}>
                          {isCurrent ? t('current', 'Hiện tại') : t('switch', 'Chuyển')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>
    </BottomSheet>
  )
}

export default ConnectedAcademiesModal

const SCREEN_HEIGHT = Dimensions.get('window').height

const styles = ScaledSheet.create({
  container: {
    paddingHorizontal: '20@ms',
    paddingBottom: '20@ms'
  },
  linkInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F6FA',
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '10@ms',
    marginBottom: '14@ms',
    gap: '6@ms'
  },
  linkInfoLabel: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#888'
  },
  linkInfoName: {
    flex: 1,
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#333'
  },
  loadingContainer: {
    paddingVertical: '30@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyContainer: {
    paddingVertical: '36@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyText: {
    marginTop: '10@ms',
    fontSize: '13@ms',
    color: '#999',
    textAlign: 'center'
  },
  listContainer: {
    maxHeight: SCREEN_HEIGHT * 0.7
  },
  academyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: '12@ms',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100] || '#F0F0F0'
  },
  academyImage: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '19@ms',
    marginRight: '12@ms'
  },
  academyImagePlaceholder: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '19@ms',
    backgroundColor: '#EAE4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  academyInitial: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#5F30AA'
  },
  academyInfo: {
    flex: 1,
    justifyContent: 'center',
    marginRight: '10@ms'
  },
  academyName: {
    ...TYPO.heading4,
    fontSize: '14@ms',
    fontWeight: '700',
    color: '#222'
  },
  academyDomain: {
    ...TYPO.body3,
    fontSize: '12@ms',
    color: palette.grey[500] || '#777',
    marginTop: '2@ms'
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.main[500] || '#5F30AA',
    paddingHorizontal: '12@ms',
    paddingVertical: '8@ms',
    borderRadius: '8@ms',
    gap: '4@ms'
  },
  currentBtn: {
    backgroundColor: '#F3EDF7'
  },
  switchBtnText: {
    color: '#FFF',
    fontSize: '12@ms',
    fontWeight: '700'
  },
  currentBtnText: {
    color: '#5F30AA'
  }
})
