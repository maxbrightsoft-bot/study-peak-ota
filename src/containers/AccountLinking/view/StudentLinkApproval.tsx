import React, { useCallback, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { palette, TYPO } from '@/theme'
import { Routes } from '@/navigators/RouteName'
import { toast, getMessageFromError } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import LinkedStateCard from '../components/LinkedStateCard'
import ExpiryProgressBar from '../components/ExpiryProgressBar'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'
import { rejectLinkAccountApi, deleteLinkApi, acceptLinkAccountApi } from '../apiClients'

const StudentLinkApproval = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const setLoading = useAuthStore((state) => state.setLoading)
  const setAcceptedLinkData = useAccountLinkingStore((state) => state.setAcceptedLinkData)
  const setParentRequestLink = useAccountLinkingStore((state) => state.setParentRequestLink)

  const parentRequestLink = useAccountLinkingStore((state) => state.parentRequestLink)
  const acceptedLinkData = useAccountLinkingStore((state) => state.acceptedLinkData)

  useEffect(() => {
    return () => {
      setParentRequestLink(null)
      setAcceptedLinkData(null)
    }
  }, [])

  const handleExpire = useCallback(() => {
    toast.info(t('link_request_expired'))
    if (navigation.canGoBack()) {
      navigation.goBack()
    }
  }, [t])

  const handleDecline = () => {
    Alert.alert(
      t('confirm_decline_request'),
      t('confirm_decline_request_desc'),
      [
        { text: t('no'), style: 'cancel' },
        {
          text: t('yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true)
              if (parentRequestLink?.linkId) {
                await rejectLinkAccountApi(parentRequestLink.linkId)
              }
              toast.success(t('link_request_declined'))
              navigation.goBack()
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

  const handleAccept = async () => {
    try {
      setLoading(true)
      const response = await acceptLinkAccountApi(parentRequestLink?.linkId!)
      const acceptedData = response.data?.data
      if (acceptedData) {
        setAcceptedLinkData(acceptedData)
      }
      toast.success(t('link_completed_student'))
    } catch (error: any) {
      toast.error(getMessageFromError(t, error))
    } finally {
      setLoading(false)
    }
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
              const id = acceptedLinkData?.id || parentRequestLink?.linkId
              if (id) {
                await deleteLinkApi(id)
              }
              toast.success(t('unlink_success'))
              navigation.reset({
                index: 0,
                routes: [{ name: Routes.Auth.StudentAccountLinking }],
              })
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
        title={t('family_link')}
        showBack={!!acceptedLinkData}
        onBackPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: Routes.Auth.StudentAccountLinking }],
          })
        }}
      />

      <View style={styles.content}>
        {acceptedLinkData ? (
          <LinkedStateCard
            data={acceptedLinkData}
            onUnlink={handleUnlink}
          />
        ) : (
          <>
            {/* Push notification bar */}
            <View style={styles.pushBar}>
              <View style={styles.bellIconCircle}>
                <Ionicons name="notifications" size={18} color="#FFF" />
              </View>
              <View style={styles.pushTextContainer}>
                <Text style={styles.pushAppTitle}>
                  {t('app_name')}
                </Text>
                <Text style={styles.pushDesc}>
                  {t('parent_request_received')}
                </Text>
              </View>
            </View>

            {/* Thẻ thông tin yêu cầu kết nối (reqcard) */}
            <View style={styles.reqCard}>
              {/* Avatar của phụ huynh */}
              <View style={styles.avatarCircle}>
                {parentRequestLink?.parentAvatar ? (
                  <Image source={{ uri: parentRequestLink.parentAvatar }} style={{ width: '100%', height: '100%', borderRadius: 30 }} />
                ) : (
                  <Text style={styles.avatarLetter}>
                    {(parentRequestLink?.parentName || 'P').charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              {/* Tên phụ huynh */}
              <Text style={styles.parentName}>
                {`${parentRequestLink?.parentName || ''} ${t('parent_role_label')}`}
              </Text>

              {/* Email phụ huynh */}
              {!!parentRequestLink?.parentEmail && (
                <Text style={styles.parentEmail}>{parentRequestLink.parentEmail}</Text>
              )}

              {/* Banner thông tin giới thiệu bước tiếp theo */}
              <View style={styles.infoBanner}>
                <Text style={styles.infoBannerText}>
                  {t('link_approve_description')}
                </Text>
              </View>

              {/* Thanh tiến trình đếm ngược thời gian hết hạn */}
              <ExpiryProgressBar
                expiredTime={parentRequestLink?.expiredTime}
                createdAt={parentRequestLink?.createdAt}
                onExpire={handleExpire}
              />

              {/* Nút bấm hành động Từ chối / Tiếp theo */}
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.btn, styles.ghostBtn]}
                  onPress={handleDecline}
                  activeOpacity={0.8}
                >
                  <Text style={styles.ghostBtnText}>
                    {t('decline')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.primaryBtn]}
                  onPress={handleAccept}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryBtnText}>
                    {t('accept')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </View>
    </View>
  )
}

export default StudentLinkApproval

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  content: {
    flex: 1,
    paddingHorizontal: '24@ms',
  },
  pushBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: '14@ms',
    paddingVertical: '12@ms',
    paddingHorizontal: '16@ms',
    marginBottom: '24@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2
  },
  bellIconCircle: {
    width: '32@ms',
    height: '32@ms',
    borderRadius: '16@ms',
    backgroundColor: '#5F30AA', // --brand
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  pushTextContainer: {
    flex: 1
  },
  pushAppTitle: {
    fontSize: '12@ms',
    fontWeight: '800',
    color: palette.grey[900],
    marginBottom: '2@ms'
  },
  pushDesc: {
    fontSize: '12@ms',
    color: palette.grey[700],
    fontWeight: '500'
  },
  reqCard: {
    backgroundColor: '#FFF',
    borderRadius: '20@ms',
    padding: '24@ms',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    marginTop: '10@ms'
  },
  avatarCircle: {
    width: '64@ms',
    height: '64@ms',
    borderRadius: '32@ms',
    backgroundColor: '#3498DB', // --blue-500
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '14@ms'
  },
  avatarLetter: {
    color: '#FFF',
    fontSize: '22@ms',
    fontWeight: '800'
  },
  parentName: {
    ...TYPO.heading2,
    fontSize: '18@ms',
    fontWeight: '800',
    color: palette.grey[900],
    marginBottom: '4@ms'
  },
  parentEmail: {
    fontSize: '13@ms',
    color: palette.grey[500],
    marginBottom: '20@ms'
  },
  infoBanner: {
    backgroundColor: '#F8F9FA', // var(--bg-100)
    borderRadius: '10@ms',
    padding: '12@ms',
    width: '100%',
    marginBottom: '16@ms'
  },
  expiryProgressWrapper: {
    marginBottom: '20@ms'
  },
  infoBannerText: {
    fontSize: '13@ms',
    color: palette.grey[700],
    lineHeight: '18@ms',
    textAlign: 'center'
  },
  buttonRow: {
    marginTop: '20@ms',
    flexDirection: 'row',
    gap: '10@ms',
    width: '100%'
  },
  btn: {
    height: '46@ms',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  ghostBtn: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  ghostBtnText: {
    color: palette.grey[700],
    fontSize: '14@ms',
    fontWeight: '700'
  },
  primaryBtn: {
    flex: 1.6,
    backgroundColor: '#5F30AA' // --brand
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: '14@ms',
    fontWeight: '700',
    marginRight: '4@ms'
  },
  chevronIcon: {
    marginTop: '1@ms'
  }
})
