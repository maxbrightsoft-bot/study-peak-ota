import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Linking, AppState } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { Canvas, DiffRect, rect, rrect } from '@shopify/react-native-skia'
import { palette } from '@/theme'
import { Routes } from '@/navigators/RouteName'
import Navbar from '../components/Navbar'
import ParentLinkTabs from '../components/ParentLinkTabs'
import { verifyCodeLinkAccountApi } from '../apiClients'
import { toast, getMessageFromError } from '@/utils/helpers'
import useAccountLinkingStore from '@/store/useAccountLinkingStore'
import useAuthStore from '@/store/useAuthStore'

const SCAN_FRAME_SIZE = 260
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

const ParentQrScan = () => {
  const { t } = useTranslation()
  const { navigate, replace } = useNavigation<any>()
  const [isFocused, setIsFocused] = useState(false)
  const setLoading = useAuthStore((state) => state.setLoading)
  const [permission, requestPermission] = useCameraPermissions()
  const [scanned, setScanned] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: SCREEN_WIDTH, height: SCREEN_HEIGHT - 120 })
  const setStudentEmail = useAccountLinkingStore((state) => state.setStudentEmail)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true)
      setScanned(false)

      return () => {
        setIsFocused(false)
      }
    }, [])
  )

  const handleTabChangeReplace = useCallback(
    (tab: 'code' | 'qr') => {
      if (tab === 'code') {
        replace(Routes.Auth.ParentLinkRequest)
      }
    },
    [replace]
  )

  // Tự động kiểm tra lại quyền khi người dùng từ Cài đặt hệ thống quay lại App
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && !permission?.granted) {
        requestPermission()
      }
    })
    return () => {
      subscription.remove()
    }
  }, [permission?.granted])

  const handleGrantPermission = useCallback(async () => {
    if (permission && !permission.canAskAgain) {
      await Linking.openSettings()
    } else {
      await requestPermission()
    }
  }, [permission])

  // Animation cho thanh quét màu xanh lá
  const [translateY] = useState(new Animated.Value(15))

  useEffect(() => {
    if (permission?.granted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: SCAN_FRAME_SIZE - 25,
            duration: 2000,
            useNativeDriver: true
          }),
          Animated.timing(translateY, {
            toValue: 15,
            duration: 2000,
            useNativeDriver: true
          })
        ])
      ).start()
    }
  }, [permission?.granted])

  const onLayout = (event: any) => {
    const { width, height } = event.nativeEvent.layout
    setCanvasSize({ width, height })
  }

  const handleBarCodeScanned = async ({
    data,
    bounds,
    cornerPoints
  }: {
    data: string
    bounds?: { origin: { x: number; y: number }; size: { width: number; height: number } }
    cornerPoints?: { x: number; y: number }[]
  }) => {
    if (scanned || !data) return

    // Chỉ cho phép quét nếu tâm mã QR nằm trong vùng khung cutout
    if (canvasSize.width > 0 && canvasSize.height > 0) {
      const cutoutX = (canvasSize.width - SCAN_FRAME_SIZE) / 2
      const cutoutY = (canvasSize.height - SCAN_FRAME_SIZE) / 2.5
      const MARGIN = 20

      let qrCenterX: number | null = null
      let qrCenterY: number | null = null

      if (bounds?.origin && bounds?.size) {
        qrCenterX = bounds.origin.x + bounds.size.width / 2
        qrCenterY = bounds.origin.y + bounds.size.height / 2
      } else if (cornerPoints && cornerPoints.length > 0) {
        const sumX = cornerPoints.reduce((acc, pt) => acc + pt.x, 0)
        const sumY = cornerPoints.reduce((acc, pt) => acc + pt.y, 0)
        qrCenterX = sumX / cornerPoints.length
        qrCenterY = sumY / cornerPoints.length
      }

      if (qrCenterX !== null && qrCenterY !== null) {
        const isInside =
          qrCenterX >= cutoutX - MARGIN &&
          qrCenterX <= cutoutX + SCAN_FRAME_SIZE + MARGIN &&
          qrCenterY >= cutoutY - MARGIN &&
          qrCenterY <= cutoutY + SCAN_FRAME_SIZE + MARGIN

        if (!isInside) {
          return
        }
      }
    }

    setScanned(true)

    try {
      setLoading(true)
      // Dữ liệu từ mã QR có định dạng: {student.Email}_{code}
      const lastUnderscoreIndex = data.lastIndexOf('_')
      let email = ''
      let code = ''

      if (lastUnderscoreIndex !== -1) {
        email = data.substring(0, lastUnderscoreIndex)
        code = data.substring(lastUnderscoreIndex + 1)
      } else {
        const parts = data.split('_')
        email = parts[0] || ''
        code = parts[1] || ''
      }

      const trimmedEmail = email.trim().toLowerCase()
      const trimmedCode = code.trim()

      if (!trimmedEmail || !trimmedCode) {
        toast.error(t('invalid_qr_code'))
        setScanned(false)
        return
      }

      // Lưu studentEmail vào Zustand store
      setStudentEmail(trimmedEmail)

      abortControllerRef.current = new AbortController()
      const response = await verifyCodeLinkAccountApi(trimmedCode, trimmedEmail, abortControllerRef.current.signal)
      if (response.data?.status === 200 || response.status === 200) {
        toast.success(t('link_request_sent'))
        navigate(Routes.Auth.ParentWaitingApproval, {
          linkData: response.data?.data
        })
      } else {
        setScanned(false)
      }
    } catch (error: any) {
      if (error.name !== 'CanceledError' && error.message !== 'canceled') {
        setStudentEmail(null)
        toast.error(getMessageFromError(t, error))
        setScanned(false)
      }
    } finally {
      setLoading(false)
    }
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <Navbar title={t('link_child')} />
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>{t('loading_camera')}</Text>
        </View>
      </View>
    )
  }

  if (!permission.granted) {
    const isPermanentlyDenied = !permission.canAskAgain
    return (
      <View style={styles.container}>
        <Navbar title={t('link_child')} />
        <ParentLinkTabs
          activeTab="qr"
          onTabChange={handleTabChangeReplace}
        />
        <View style={styles.permissionContainer}>
          <View style={styles.msgCard}>
            <Ionicons name="camera-outline" size={54} color="#9A9A98" />
            <Text style={styles.permissionTitle}>
              {t('camera_permission_required')}
            </Text>
            <Text style={styles.permissionDesc}>
              {isPermanentlyDenied
                ? t('camera_permission_denied_desc')
                : t('camera_permission_desc')}
            </Text>
            <TouchableOpacity style={styles.grantButton} onPress={handleGrantPermission} activeOpacity={0.8}>
              <Text style={styles.grantButtonText}>
                {isPermanentlyDenied ? t('open_settings') : t('grant_permission')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  // Toạ độ vẽ khung Skia cut-out
  const cutoutX = (canvasSize.width - SCAN_FRAME_SIZE) / 2
  const cutoutY = (canvasSize.height - SCAN_FRAME_SIZE) / 2.5

  const outerRect = rrect(rect(0, 0, canvasSize.width, canvasSize.height), 0, 0)
  const innerRRect = rrect(rect(cutoutX, cutoutY, SCAN_FRAME_SIZE, SCAN_FRAME_SIZE), 24, 24)

  return (
    <View style={styles.container}>
      <Navbar title={t('link_child')} />

      <ParentLinkTabs
        activeTab="qr"
        onTabChange={handleTabChangeReplace}
      />

      <View style={styles.scanContainer} onLayout={onLayout}>
        {isFocused && (
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{
              barcodeTypes: ['qr']
            }}
            onBarcodeScanned={handleBarCodeScanned}
          />
        )}

        {canvasSize.width > 0 && canvasSize.height > 0 && (
          <>
            {/* Lớp phủ Canvas tối khoanh vùng cut-out mã QR sử dụng Skia DiffRect */}
            <Canvas style={{ flex: 1, position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
              <DiffRect outer={outerRect} inner={innerRRect} color="rgba(23, 23, 25, 0.7)" />
            </Canvas>

            {/* Hướng dẫn quét đặt ở phần trên overlay */}
            <View style={[styles.instructionWrapper, { top: cutoutY - 55 }]}>
              <Text style={styles.scanInstruction}>
                {t('qr_scan_instruction')}
              </Text>
            </View>

            {/* Khung nhắm White corners & animated green scan line */}
            <View
              style={[
                styles.targetFrame,
                {
                  left: cutoutX,
                  top: cutoutY
                }
              ]}
            >
              <View style={[styles.cornerBorder, styles.cornerTopLeft]} />
              <View style={[styles.cornerBorder, styles.cornerTopRight]} />
              <View style={[styles.cornerBorder, styles.cornerBottomLeft]} />
              <View style={[styles.cornerBorder, styles.cornerBottomRight]} />
              <Animated.View
                style={[
                  styles.scannerLine,
                  {
                    transform: [{ translateY }]
                  }
                ]}
              />
            </View>
          </>
        )}
      </View>
    </View>
  )
}

export default ParentQrScan

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB'
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    fontSize: '14@ms',
    color: palette.grey[500]
  },
  permissionContainer: {
    flex: 1,
    padding: '20@ms',
    alignItems: 'center',
    marginTop: '20@ms',
  },
  msgCard: {
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    padding: '24@ms',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
    width: '100%'
  },
  permissionTitle: {
    fontSize: '16@ms',
    fontWeight: '800',
    color: palette.grey[900],
    marginTop: '16@ms',
    marginBottom: '8@ms',
    textAlign: 'center'
  },
  permissionDesc: {
    fontSize: '13@ms',
    color: palette.grey[600],
    textAlign: 'center',
    lineHeight: '18@ms',
    marginBottom: '20@ms'
  },
  grantButton: {
    height: '46@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[700] || '#5F30AA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '24@ms',
    width: '100%'
  },
  grantButtonText: {
    color: '#FFF',
    fontSize: '14@ms',
    fontWeight: '700'
  },
  scanContainer: {
    flex: 1,
    position: 'relative'
  },
  instructionWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20
  },
  scanInstruction: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 4
  },
  targetFrame: {
    position: 'absolute',
    width: SCAN_FRAME_SIZE,
    height: SCAN_FRAME_SIZE,
    zIndex: 10
  },
  scannerLine: {
    position: 'absolute',
    left: '18@ms',
    right: '18@ms',
    height: '3@ms',
    backgroundColor: '#2BBA84',
    borderRadius: '2@ms',
    shadowColor: '#2BBA84',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5
  },
  cornerBorder: {
    position: 'absolute',
    width: '24@ms',
    height: '24@ms',
    borderColor: '#FFF',
    borderWidth: '4@ms',
    zIndex: 15
  },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: '14@ms'
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: '14@ms'
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: '14@ms'
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: '14@ms'
  }
})
