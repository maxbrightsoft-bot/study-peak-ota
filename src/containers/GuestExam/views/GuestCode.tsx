import React, { ComponentType } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { palette } from '@/theme'
import { toast } from '@/utils/helpers'
import GuestCodeInput from '../components/GuestCodeInput'
import AcademyPickerModal from '../components/AcademyPickerModal'
import useGuestCode from '../hooks/useGuestCode'
import { isCameraModuleAvailable } from '../utils/cameraAvailability'

type QrScannerProps = {
  t: ReturnType<typeof useGuestCode>['t']
  visible: boolean
  onScanned: (data: string) => void
  onClose: () => void
}

let qrScanner: ComponentType<QrScannerProps> | null | undefined

/**
 * Loads the camera scanner on demand: a binary built before expo-camera was added (an OTA bundle on
 * an old build) has no camera module, and must still offer manual entry instead of crashing.
 */
const getQrScanner = () => {
  if (qrScanner !== undefined) return qrScanner
  if (!isCameraModuleAvailable()) {
    qrScanner = null
    return qrScanner
  }
  try {
    qrScanner = require('../components/QrScannerModal').default as ComponentType<QrScannerProps>
  } catch {
    qrScanner = null
  }
  return qrScanner
}

const GuestCode = () => {
  const {
    t,
    academy,
    code,
    error,
    isComplete,
    isSubmitting,
    isPickerOpen,
    isScannerOpen,
    openPicker,
    closePicker,
    openScanner,
    closeScanner,
    handleChangeCode,
    handleSelectAcademy,
    handleScanned,
    handleCancel,
    handleConfirm
  } = useGuestCode()

  const QrScanner = isScannerOpen ? getQrScanner() : null
  const canConfirm = isComplete && !isSubmitting

  const handleOpenScanner = () => {
    if (getQrScanner()) openScanner()
    else toast.error(t('guest_camera_unavailable'))
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.backButton} accessibilityLabel={t('cancel')}>
            <Ionicons name="arrow-back" size={24} color={palette.grey[900]} />
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.badge}>
            <Ionicons name="flash" size={14} color={palette.main[600]} />
            <Text style={styles.badgeText}>{t('guest_code_badge')}</Text>
          </View>
          <Text style={styles.title}>{t('guest_code_title')}</Text>
          <Text style={styles.subtitle}>{t('guest_code_subtitle')}</Text>

          <TouchableOpacity style={styles.academy} onPress={openPicker} accessibilityRole="button">
            <Ionicons name="school-outline" size={20} color={palette.main[600]} />
            <View style={styles.flex}>
              <Text style={styles.academyLabel}>{t('academy')}</Text>
              <Text style={[styles.academyName, !academy && styles.placeholder]} numberOfLines={1}>
                {(academy?.isLearningSpace ? t('my_study_space') : academy?.name) || t('guest_select_academy')}
              </Text>
            </View>
            <Text style={styles.change}>{t('guest_change')}</Text>
          </TouchableOpacity>

          <GuestCodeInput
            value={code}
            hasError={!!error}
            disabled={isSubmitting}
            accessibilityLabel={t('guest_code_title')}
            onChange={handleChangeCode}
            onSubmit={handleConfirm}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
          <Text style={styles.hint}>{t('guest_code_hint')}</Text>

          <TouchableOpacity
            style={[styles.confirm, !canConfirm && styles.confirmDisabled]}
            disabled={!canConfirm}
            onPress={handleConfirm}
          >
            {isSubmitting ? (
              <ActivityIndicator color={palette.grey[0]} />
            ) : (
              <Text style={styles.confirmText}>{t('confirm')}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancel} onPress={handleCancel}>
            <Text style={styles.cancelText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.qrCard} onPress={handleOpenScanner} accessibilityRole="button">
            <Ionicons name="qr-code-outline" size={36} color={palette.grey[800]} />
            <View style={styles.flex}>
              <Text style={styles.qrTitle}>{t('guest_scan_qr')}</Text>
              <Text style={styles.qrHint}>{t('guest_qr_hint')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.grey[400]} />
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>

      <AcademyPickerModal
        t={t}
        visible={isPickerOpen}
        selected={academy}
        onSelect={handleSelectAcademy}
        onClose={closePicker}
      />
      {QrScanner && <QrScanner t={t} visible={isScannerOpen} onScanned={handleScanned} onClose={closeScanner} />}
    </SafeAreaView>
  )
}

export default GuestCode

const styles = ScaledSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.grey[0]
  },
  flex: {
    flex: 1
  },
  header: {
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms'
  },
  backButton: {
    width: '40@ms',
    height: '40@ms',
    justifyContent: 'center'
  },
  content: {
    paddingHorizontal: '24@ms',
    paddingBottom: '32@ms',
    gap: '14@ms'
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: '4@ms',
    paddingHorizontal: '12@ms',
    paddingVertical: '6@ms',
    borderRadius: '16@ms',
    backgroundColor: palette.main[50]
  },
  badgeText: {
    fontSize: '13@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  title: {
    fontSize: '26@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },
  subtitle: {
    fontSize: '15@ms',
    color: palette.grey[700]
  },
  academy: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '12@ms',
    padding: '14@ms',
    borderRadius: '12@ms',
    borderWidth: 1,
    borderColor: palette.grey[200],
    backgroundColor: palette.grey[50]
  },
  academyLabel: {
    fontSize: '12@ms',
    color: palette.grey[500]
  },
  academyName: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  placeholder: {
    color: palette.grey[400]
  },
  change: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: palette.main[600]
  },
  error: {
    fontSize: '14@ms',
    color: palette.red[900],
    textAlign: 'center'
  },
  hint: {
    fontSize: '13@ms',
    color: palette.grey[500],
    textAlign: 'center'
  },
  confirm: {
    marginTop: '8@ms',
    height: '52@ms',
    borderRadius: '14@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.main[600]
  },
  confirmDisabled: {
    backgroundColor: palette.main[100]
  },
  confirmText: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: palette.grey[0]
  },
  cancel: {
    height: '48@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelText: {
    fontSize: '15@ms',
    fontWeight: '500',
    color: palette.grey[600]
  },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '14@ms',
    padding: '16@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.grey[50]
  },
  qrTitle: {
    fontSize: '15@ms',
    fontWeight: '600',
    color: palette.grey[900]
  },
  qrHint: {
    marginTop: '2@ms',
    fontSize: '13@ms',
    color: palette.grey[600]
  }
})
