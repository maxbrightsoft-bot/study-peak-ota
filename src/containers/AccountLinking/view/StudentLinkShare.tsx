import React, { useState, useEffect, useCallback } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useFocusEffect } from '@react-navigation/native'
import { palette, TYPO } from '@/theme'
import { toast, getMessageFromError } from '@/utils/helpers'
import Navbar from '../components/Navbar'
import CodeInput from '../components/CodeInput'
import { generateLinkCodeApi } from '../apiClients'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'
import moment from 'moment'

const StudentLinkShare = () => {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.user)
  const [code, setCode] = useState('')
  const [qrImage, setQrImage] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(0)
  const linkKey = useAccountLinkingStore((state) => state.linkKey)
  const setLinkKey = useAccountLinkingStore((state) => state.setLinkKey)
  const setLinkData = useAccountLinkingStore((state) => state.setLinkData)
  const setStudentEmail = useAccountLinkingStore((state) => state.setStudentEmail)
  const clearLinkData = useAccountLinkingStore((state) => state.clearLinkData)
  const setLoading = useAuthStore((state) => state.setLoading)

  const fetchCode = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true)
      const response = await generateLinkCodeApi(signal)
      const data = response.data?.data
      if (data) {
        setCode(data.code)
        setQrImage(data.image)

        // Lưu key và data vào Zustand store khi student share thành công
        setLinkKey(data.key)
        setLinkData(data, user?.email)

        const utcStr = (data.expiredTime?.endsWith('Z') || data.expiredTime?.includes('+')) ? data.expiredTime : `${data.expiredTime}Z`
        const localExpiry = moment.utc(utcStr).local()
        const diffSeconds = localExpiry.isValid() ? Math.max(0, localExpiry.diff(moment(), 'seconds')) : 300
        setSecondsLeft(diffSeconds)
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.message !== 'canceled') {
        toast.error(getMessageFromError(t, error))
      }
    } finally {
      setLoading(false)
    }
  }, [user?.email, t])

  useFocusEffect(
    useCallback(() => {
      const controller = new AbortController()
      fetchCode(controller.signal)
      return () => controller.abort()
    }, [fetchCode])
  )

  useEffect(() => {
    if (user?.email) {
      setStudentEmail(user.email)
    }
    return () => {
      clearLinkData()
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      const storedExpiredTime = useAccountLinkingStore.getState().expiredTime
      if (storedExpiredTime) {
        const utcStr = (storedExpiredTime.endsWith('Z') || storedExpiredTime.includes('+')) ? storedExpiredTime : `${storedExpiredTime}Z`
        const localExpiry = moment.utc(utcStr).local()
        const remaining = localExpiry.isValid() ? Math.max(0, localExpiry.diff(moment(), 'seconds')) : 0
        setSecondsLeft(remaining)
        if (remaining <= 0) {
          clearInterval(timer)
        }
      } else {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [linkKey])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleReissueCode = () => {
    fetchCode()
  }

  return (
    <View style={styles.container}>
      <Navbar title={t('family_linking')} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Tiêu đề đầu trang */}
        <View style={styles.headerArea}>
          <Text style={styles.titleText}>{t('connect_with_parents')}</Text>
          <Text style={styles.subtitleText}>
            {t('link_student_instruction')}
          </Text>
        </View>

        {/* Thẻ chứa mã Code và mã QR hiển thị đồng thời */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>{t('your_link_code')}</Text>
          
          {/* Component nhập code dùng chung ở trạng thái Read-only */}
          <CodeInput value={code} editable={false} />

          {/* Badge đếm ngược thời gian */}
          <View style={styles.timerBadge}>
            <Ionicons name="time-outline" size={14} color="#EB4361" />
            <Text style={styles.timerText}>
              {t('expires_in', { time: formatTime(secondsLeft) })}
            </Text>
          </View>

          {/* Nút Tạo lại mã mới */}
          <TouchableOpacity
            style={styles.reissueButton}
            onPress={handleReissueCode}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={15} color="#5F30AA" />
            <Text style={styles.reissueText}>{t('reissue_code')}</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={styles.sectionLabel}>{t('or_scan_qr')}</Text>

          {/* Giao diện mã QR */}
          <View style={styles.qrContainer}>
            {qrImage ? (
              <View style={styles.qrFrame}>
                <Image source={{ uri: qrImage }} style={styles.qrImage} />
              </View>
            ) : (
              <View style={styles.qrFrame}>
                {/* Vẽ biểu tượng QR đơn giản mô phỏng cấu trúc góc định vị */}
                <View style={[styles.qrCorner, styles.qrTopLeft]} />
                <View style={[styles.qrCorner, styles.qrTopRight]} />
                <View style={[styles.qrCorner, styles.qrBottomLeft]} />
                {/* Các điểm chấm giả lập bên trong QR */}
                <View style={styles.qrDotsGrid}>
                  <View style={styles.qrDotGroup} />
                  <View style={[styles.qrDotGroup, { width: 40, height: 10, alignSelf: 'flex-end' }]} />
                  <View style={[styles.qrDotGroup, { width: 20, height: 30, marginTop: 10 }]} />
                </View>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Trạng thái đang chờ Phụ huynh đồng ý */}
      <View style={styles.ctaWrapper}>
        <View style={styles.ctaButtonDisabled}>
          <Text style={styles.ctaText}>
            {t('waiting_for_parent_request')}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default StudentLinkShare

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  scrollContent: {
    padding: '20@ms',
    paddingBottom: '110@ms'
  },
  headerArea: {
    alignItems: 'center',
    paddingVertical: '8@ms',
    marginBottom: '16@ms'
  },
  titleText: {
    ...TYPO.heading2,
    fontSize: '18@ms',
    fontWeight: '800',
    color: palette.grey[900],
    textAlign: 'center'
  },
  subtitleText: {
    ...TYPO.body2,
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center',
    marginTop: '6@ms',
    lineHeight: '18@ms',
    paddingHorizontal: '10@ms'
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '20@ms',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center'
  },
  sectionLabel: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.grey[700],
    marginBottom: '4@ms'
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDECEF', // --red-100
    paddingVertical: '6@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '20@ms',
    marginTop: '10@ms'
  },
  timerText: {
    color: '#EB4361', // --red-500
    fontSize: '13@ms',
    fontWeight: '700',
    marginLeft: '6@ms'
  },
  reissueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '12@ms',
    padding: '6@ms'
  },
  reissueText: {
    color: '#5F30AA', // --brand-text
    fontSize: '13@ms',
    fontWeight: '700',
    marginLeft: '6@ms'
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: palette.grey[200] || '#EAEAEA',
    marginVertical: '20@ms'
  },
  qrContainer: {
    marginTop: '8@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  qrFrame: {
    width: '150@ms',
    height: '150@ms',
    borderWidth: 1,
    borderColor: '#C7C7C8',
    borderRadius: '16@ms',
    backgroundColor: '#FFF',
    padding: '4@ms',
    position: 'relative'
  },
  qrImage: {
    width: '100%',
    height: '100%'
  },
  qrCorner: {
    position: 'absolute',
    width: '28@ms',
    height: '28@ms',
    borderWidth: '6@ms',
    borderColor: palette.grey[900],
    borderRadius: '4@ms'
  },
  qrTopLeft: {
    top: '16@ms',
    left: '16@ms'
  },
  qrTopRight: {
    top: '16@ms',
    right: '16@ms'
  },
  qrBottomLeft: {
    bottom: '16@ms',
    left: '16@ms'
  },
  qrDotsGrid: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.15
  },
  qrDotGroup: {
    width: '30@ms',
    height: '20@ms',
    backgroundColor: palette.grey[900],
    borderRadius: '2@ms'
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
  ctaButtonDisabled: {
    height: '54@ms',
    borderRadius: '14@ms',
    backgroundColor: '#B9A9D8', // disabled purple --main-300
    alignItems: 'center',
    justifyContent: 'center'
  },
  ctaText: {
    color: '#FFF',
    fontSize: '16@ms',
    fontWeight: '700'
  }
})
