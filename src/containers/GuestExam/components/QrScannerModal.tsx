import React, { useEffect, useRef } from 'react'
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { BarcodeScanningResult, CameraView, useCameraPermissions } from 'expo-camera'
import { TFunction } from 'i18next'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'

type QrScannerModalProps = {
  t: TFunction<'translation', undefined>
  visible: boolean
  onScanned: (data: string) => void
  onClose: () => void
}

/** Scans the exam QR with the camera. A denied permission shows a message; manual entry stays available. */
const QrScannerModal = ({ t, visible, onScanned, onClose }: QrScannerModalProps) => {
  const [permission, requestPermission] = useCameraPermissions()
  const handledRef = useRef<boolean>(false)

  useEffect(() => {
    if (!visible) return
    handledRef.current = false
    if (permission && !permission.granted && permission.canAskAgain) requestPermission()
  }, [visible, permission?.granted, permission?.canAskAgain])

  const handleBarcodeScanned = ({ data }: BarcodeScanningResult) => {
    // The scanner fires repeatedly while the code stays in frame: take the first read only.
    if (handledRef.current || !data) return
    handledRef.current = true
    onScanned(data)
  }

  const renderBody = () => {
    if (!permission) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={palette.main[600]} />
        </View>
      )
    }
    if (!permission.granted) {
      return (
        <View style={styles.center}>
          <Ionicons name="camera-outline" size={48} color={palette.grey[400]} />
          <Text style={styles.message}>{t('guest_camera_permission_denied')}</Text>
          {permission.canAskAgain && (
            <TouchableOpacity style={styles.button} onPress={requestPermission}>
              <Text style={styles.buttonText}>{t('guest_camera_allow')}</Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }
    return (
      <View style={styles.cameraWrapper}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={handleBarcodeScanned}
        />
        <View style={styles.overlay} pointerEvents="none">
          <View style={styles.frame} />
          <Text style={styles.hint}>{t('guest_qr_scan_instruction')}</Text>
        </View>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton} accessibilityLabel={t('close')}>
            <Ionicons name="close" size={24} color={palette.grey[900]} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('guest_scan_qr')}</Text>
          <View style={styles.headerButton} />
        </View>
        {visible && renderBody()}
      </SafeAreaView>
    </Modal>
  )
}

export default QrScannerModal

const styles = ScaledSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.grey[0]
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms'
  },
  headerButton: {
    width: '32@ms',
    alignItems: 'center'
  },
  title: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '32@ms',
    gap: '16@ms'
  },
  message: {
    textAlign: 'center',
    fontSize: '15@ms',
    lineHeight: '22@ms',
    color: palette.grey[700]
  },
  button: {
    paddingVertical: '12@ms',
    paddingHorizontal: '24@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[600]
  },
  buttonText: {
    color: palette.grey[0],
    fontSize: '15@ms',
    fontWeight: '600'
  },
  cameraWrapper: {
    flex: 1
  },
  camera: {
    flex: 1
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24@ms'
  },
  frame: {
    width: '230@ms',
    height: '230@ms',
    borderWidth: 3,
    borderColor: palette.grey[0],
    borderRadius: '16@ms'
  },
  hint: {
    color: palette.grey[0],
    fontSize: '14@ms',
    textAlign: 'center',
    paddingHorizontal: '24@ms'
  }
})
