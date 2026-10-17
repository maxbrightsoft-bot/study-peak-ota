import React, { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Routes } from '@/navigators/RouteName'
import { toast, getMessageFromError } from '@/utils/helpers'
import { resetToHome } from '@/navigators/NavigationHelpers'
import Navbar from '../components/Navbar'
import { AccountLinkMethod, requestLinkByStudentIdApi, AccountLinkStatus } from '../apiClients'
import useAccountLinkingStore, { buildAccountLinkingChannelName, waitForPusherSubscribed } from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'

const ParentShareLinkConfirm = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()
  const [loading, setLoading] = useState(false)
  const setStudentEmail = useAccountLinkingStore((state) => state.setStudentEmail)
  const setAcceptedLinkData = useAccountLinkingStore((state) => state.setAcceptedLinkData)

  const idSuperStudent = route.params?.idSuperStudent || route.params?.studentId
  const studentName = route.params?.studentName || route.params?.name || ''
  const studentEmail = route.params?.studentEmail || route.params?.email || ''
  const studentAvatar = route.params?.studentAvatar || route.params?.avatar || ''

  const handleCancel = () => {
    useAuthStore.getState().clearRedirectUrl()
    if (navigation.canGoBack()) {
      navigation.goBack()
    } else {
      resetToHome()
    }
  }

  const handleConfirm = async () => {
    if (!idSuperStudent) {
      toast.error(t('an_unexpected_error_has_occurred'))
      return
    }

    try {
      setLoading(true)

      // Pusher must be subscribed before calling the API so no event is missed
      if (studentEmail) {
        setStudentEmail(studentEmail.trim(), AccountLinkMethod.ShareLink)
        const subscribed = await waitForPusherSubscribed(
          buildAccountLinkingChannelName(studentEmail, AccountLinkMethod.ShareLink, true, useAuthStore.getState().user?.superId)
        )
        if (!subscribed) {
          setStudentEmail(null)
          toast.error(t('pusher_not_ready'))
          return
        }
      }

      const res = await requestLinkByStudentIdApi(Number(idSuperStudent))
      const linkData = res?.data?.data

      const isAccepted =
        linkData?.status === AccountLinkStatus.Accept;

      if (isAccepted) {
        if (linkData) {
          setAcceptedLinkData(linkData)
        }
        try {
          await useAuthStore.getState().syncParentLinkedStudents()
        } catch {
        }
        navigation.push(Routes.Auth.ParentWaitingApproval, {
          approved: true,
          redirectUrl: route.params?.redirectUrl,
          redirectParams: route.params?.redirectParams,
        })
      } else {

        navigation.push(Routes.Auth.ParentWaitingApproval, {
          linkData,
          approved: false,
          redirectUrl: route.params?.redirectUrl,
          redirectParams: route.params?.redirectParams,
        })
      }
    } catch (error: any) {
      if (studentEmail) {
        setStudentEmail(null)
      }
      toast.error(getMessageFromError(t, error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Navbar
        title={t('link_account_request')}
        showBack={true}
        onBackPress={handleCancel}
      />

      <View style={styles.content}>
        <View style={styles.card}>
          {/* Avatar / Icon học sinh */}
          <View style={styles.avatarCircle}>
            {studentAvatar ? (
              <Image
                source={{ uri: studentAvatar }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Ionicons name="person" size={40} color="#5F30AA" />
            )}
          </View>

          {/* Tên học sinh */}
          <Text style={styles.studentNameText} numberOfLines={1}>
            {studentName || t('student')}
          </Text>

          {/* Email học sinh */}
          {Boolean(studentEmail) && (
            <Text style={styles.studentEmailText} numberOfLines={1}>
              {studentEmail}
            </Text>
          )}

          <View style={styles.divider} />

          {/* Câu hỏi xác nhận */}
          <View style={styles.questionContainer}>
            <Ionicons name="link-outline" size={24} color="#5F30AA" style={{ marginRight: 8, marginTop: 2 }} />
            <Text style={styles.questionText}>
              {t('confirm_link_student_desc', {
                name: studentName || t('student')
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Nút hành động */}
      <View style={styles.ctaWrapper}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelText}>{t('no')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmText}>{t('connect')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default ParentShareLinkConfirm

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: '20@ms',
    paddingTop: '32@ms',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: '16@ms',
    padding: '24@ms',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: '80@ms',
    height: '80@ms',
    borderRadius: '40@ms',
    backgroundColor: '#F3E5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16@ms',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: '40@ms',
  },
  studentNameText: {
    fontSize: '20@ms',
    fontWeight: '700',
    color: '#222222',
    textAlign: 'center',
    marginBottom: '4@ms',
  },
  studentEmailText: {
    fontSize: '14@ms',
    color: '#777777',
    textAlign: 'center',
    marginBottom: '16@ms',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: '16@ms',
  },
  questionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F5FD',
    borderRadius: '12@ms',
    padding: '16@ms',
    width: '100%',
  },
  questionText: {
    flex: 1,
    fontSize: '14@ms',
    color: '#333333',
    lineHeight: '22@ms',
    fontWeight: '500',
  },
  ctaWrapper: {
    flexDirection: 'row',
    paddingHorizontal: '20@ms',
    paddingBottom: '32@ms',
    gap: '12@ms',
    backgroundColor: '#FAFAFB',
  },
  cancelButton: {
    flex: 1,
    height: '48@ms',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: '#666666',
  },
  confirmButton: {
    flex: 1,
    height: '48@ms',
    borderRadius: '12@ms',
    backgroundColor: '#5F30AA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmText: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#FFFFFF',
  },
})
