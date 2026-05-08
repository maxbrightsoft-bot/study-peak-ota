import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { Checkbox } from 'react-native-paper'
import { palette, TYPO } from '@/theme'
import CommonDialog from '@/components/ModalBase/CommonDialog'

interface Props {
  open: boolean
  onClose: () => void
  t: any
  title: string
  onSubmit: (minutes: number, skipPreAlarm: boolean) => void
  initialValue?: number
}

const SelectTimeDialog = ({ t, onClose, title, open, onSubmit, initialValue = 30 }: Props) => {
  const [minutes, setMinutes] = useState<string>(initialValue.toString())
  const [skipPreAlarm, setSkipPreAlarm] = useState<boolean>(false)

  const handleConfirm = () => {
    const val = parseInt(minutes)
    if (!isNaN(val) && val > 0) {
      onSubmit(val, skipPreAlarm)
      onClose()
    }
  }

  return (
    <CommonDialog isVisible={open} onClose={onClose} title={title}>
      <View style={styles.content}>
        <Text style={styles.label}>{t('please_enter_timer_limit')}</Text>
        
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={minutes}
            onChangeText={setMinutes}
            placeholder={initialValue.toString()}
            autoFocus
          />
          <Text style={styles.unitText}>{t('minutes')}</Text>
        </View>

        <TouchableOpacity 
          style={styles.checkboxContainer} 
          onPress={() => setSkipPreAlarm(!skipPreAlarm)}
          activeOpacity={0.7}
        >
          <Checkbox
            status={skipPreAlarm ? 'checked' : 'unchecked'}
            onPress={() => setSkipPreAlarm(!skipPreAlarm)}
            color={palette.main[600]}
          />
          <Text style={styles.checkboxLabel}>{t('skip_pre_alarm')}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}>
            <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.button,
              styles.submitButton,
              (!minutes || parseInt(minutes) <= 0) && styles.disabledButton
            ]}
            onPress={handleConfirm}
            disabled={!minutes || parseInt(minutes) <= 0}
          >
            <Text style={styles.submitButtonText}>{t('activate')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </CommonDialog>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 16
  },
  label: {
    ...TYPO.body2,
    color: palette.grey[900],
    marginBottom: 20,
    textAlign: 'center'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32
  },
  input: {
    borderWidth: 1,
    borderColor: palette.main[600],
    borderRadius: 8,
    padding: 12,
    fontSize: 24,
    fontWeight: '700',
    color: palette.main[600],
    width: 100,
    textAlign: 'center'
  },
  unitText: {
    ...TYPO.h5,
    color: palette.grey[900]
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 4
  },
  checkboxLabel: {
    ...TYPO.body2,
    color: palette.grey[700],
    fontWeight: '500'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: palette.grey[300]
  },
  cancelButtonText: {
    color: palette.grey[700],
    fontWeight: '600'
  },
  submitButton: {
    backgroundColor: palette.main[600]
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: '600'
  },
  disabledButton: {
    backgroundColor: palette.grey[300]
  }
})

export default SelectTimeDialog
