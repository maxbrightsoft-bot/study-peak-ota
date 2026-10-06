import React, { useState, useCallback, useRef, useEffect } from 'react'
import { View, Text, TouchableOpacity, Alert, TextInput, ActivityIndicator } from 'react-native'
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation } from '@react-navigation/native'
import { palette } from '@/theme'
import { Routes } from '@/navigators/RouteName'
import { toast, getMessageFromError } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import CodeInput from '../components/CodeInput'
import ParentLinkTabs from '../components/ParentLinkTabs'
import { verifyCodeLinkAccountApi } from '../apiClients'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ParentLinkRequest = () => {
  const { t } = useTranslation()
  const { navigate, replace } = useNavigation<any>()
  const [code, setCode] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const setStudentEmail = useAccountLinkingStore((state) => state.setStudentEmail)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  const handleTabChange = useCallback(
    (tab: 'code' | 'qr') => {
      if (tab === 'qr') {
        replace(Routes.Auth.ParentQrScan)
      }
    },
    [replace]
  )

  const handleNextPress = async () => {
    const trimmedCode = code.trim()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedCode.length < 6) {
      Alert.alert(
        t('warning'),
        t('enter_full_code')
      )
      return
    }

    if (!trimmedEmail) {
      Alert.alert(
        t('warning'),
        t('enter_child_email')
      )
      return
    }

    if (!EMAIL_REGEX.test(trimmedEmail)) {
      Alert.alert(
        t('warning'),
        t('invalid_email_address')
      )
      return
    }

    try {
      setLoading(true)
      // Lưu studentEmail vào Zustand store
      setStudentEmail(trimmedEmail)

      abortControllerRef.current = new AbortController()
      const response = await verifyCodeLinkAccountApi(trimmedCode, trimmedEmail, abortControllerRef.current.signal)
      if (response.data?.data) {
        toast.success(t('link_request_sent'))
        // Chuyển thẳng sang trang ParentWaitingApproval không cần Alert
        navigate(Routes.Auth.ParentWaitingApproval, {
          linkData: response.data?.data
        })
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.message !== 'canceled') {
        setStudentEmail(null)
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = code.trim().length >= 6 && EMAIL_REGEX.test(email.trim())

  const [qrBannerHeight, setQrBannerHeight] = useState(0)

  const handleQrBannerLayout = useCallback((event: any) => {
    setQrBannerHeight(event.nativeEvent.layout.height)
  }, [])

  return (
    <View style={styles.container}>
      <Navbar title={t('link_child')} />

      <ParentLinkTabs
        activeTab="code"
        onTabChange={handleTabChange}
      />

      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={90}
      >
        <View style={styles.tabContent}>
          {/* Block nhập mã Code 6 ký tự */}
          <View style={styles.msgCard}>
            <Text style={styles.instructionLine}>
              {t('enter_child_code_line1')}
            </Text>
            <Text style={[styles.instructionLine, { marginTop: 2 }]}>
              {t('enter_child_code_line2')}
            </Text>

            {/* Component nhập code dùng chung ở trạng thái Editable */}
            <CodeInput value={code} onChangeText={setCode} editable={true} />
          </View>

          {/* Block nhập Email học sinh */}
          <View style={[styles.msgCard, { marginTop: 14 }]}>
            <Text style={styles.instructionLine}>
              {t('enter_student_email_line1')}
            </Text>
            <Text style={[styles.instructionLine, { marginTop: 2 }]}>
              {t('enter_student_email_line2')}
            </Text>

            <View style={styles.emailInputBox}>
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={setEmail}
                placeholder="slinkydaisy@gmail.com"
                placeholderTextColor={palette.grey[400] || '#999'}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Banner hướng dẫn chuyển sang QR */}
          <TouchableOpacity
            style={styles.qrBanner}
            onLayout={handleQrBannerLayout}
            onPress={() => replace(Routes.Auth.ParentQrScan)}
            activeOpacity={0.8}
          >
            <View style={styles.qrIconWrapper}>
              <Ionicons name="qr-code-outline" size={20} color="#5F30AA" />
            </View>
            <Text style={styles.qrBannerText}>
              {t('qr_convenient_tip')}
              <Text style={styles.qrBoldText}>{t('scan_qr')}</Text>
              {t('qr_convenient_tip_end')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      {/* Nút bấm CTA "Tiếp theo" được dính và đẩy lên đồng bộ với bàn phím */}
      <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            style={[styles.ctaButton, (!isFormValid || loading) && styles.ctaButtonDisabled]}
            onPress={handleNextPress}
            disabled={!isFormValid || loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Text style={styles.ctaText}>{t('next')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardStickyView>
    </View>
  )
}

export default ParentLinkRequest

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  scrollContent: {
    padding: '20@ms',
    paddingBottom: '110@ms'
  },
  tabContent: {
    width: '100%'
  },
  msgCard: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '20@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center'
  },
  instructionLine: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.grey[800],
    textAlign: 'center',
    lineHeight: '20@ms'
  },
  emailInputBox: {
    width: '100%',
    marginTop: '16@ms',
    height: '48@ms',
    borderWidth: 1.5,
    borderColor: '#222222',
    borderRadius: '4@ms',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: '12@ms',
    backgroundColor: '#FFF'
  },
  emailInput: {
    width: '100%',
    height: '100%',
    fontSize: '16@ms',
    fontWeight: '500',
    color: '#111',
    textAlign: 'center'
  },
  qrBanner: {
    marginTop: '14@ms',
    padding: '16@ms',
    backgroundColor: '#FFF',
    borderRadius: '12@ms',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.grey[200] || '#EAEAEA'
  },
  qrIconWrapper: {
    width: '40@ms',
    height: '40@ms',
    borderRadius: '10@ms',
    backgroundColor: '#F4F0FA', // --brand-soft
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '12@ms'
  },
  qrBannerText: {
    flex: 1,
    fontSize: '13@ms',
    color: palette.grey[600],
    lineHeight: '18@ms'
  },
  qrBoldText: {
    fontWeight: '800',
    color: palette.grey[900]
  },
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: '20@ms',
    paddingBottom: '28@ms',
    paddingTop: '10@ms',
    backgroundColor: 'transparent'
  },
  ctaButton: {
    height: '54@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.main[700] || '#5F30AA',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3
  },
  ctaButtonDisabled: {
    backgroundColor: '#B9A9D8',
    elevation: 0,
    shadowOpacity: 0
  },
  ctaText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '700'
  }
})
