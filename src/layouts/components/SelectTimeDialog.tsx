import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native'
import { palette, TYPO } from '@/theme'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { ScaledSheet } from 'react-native-size-matters'

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
          <View style={[styles.checkbox, skipPreAlarm && styles.checkboxChecked]}>
            {skipPreAlarm && <View style={styles.checkboxInner} />}
          </View>
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

const styles = ScaledSheet.create({
  content: {
    paddingVertical: '16@ms'
  },
  label: {
    ...TYPO.body2,
    color: palette.grey[900],
    marginBottom: '20@ms',
    textAlign: 'center'
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12@ms',
    marginBottom: '32@ms'
  },
  input: {
    borderWidth: '1@ms',
    borderColor: palette.main[600],
    borderRadius: '8@ms',
    padding: '12@ms',
    fontSize: '24@ms',
    fontWeight: '700',
    color: palette.main[600],
    width: '100@ms',
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
    marginBottom: '24@ms',
    gap: '8@ms'
  },
  checkbox: {
    width: '20@ms',
    height: '20@ms',
    borderWidth: '2@ms',
    borderColor: palette.grey[400],
    borderRadius: '4@ms',
    alignItems: 'center',
    justifyContent: 'center'
  },
  checkboxChecked: {
    borderColor: palette.main[600],
    backgroundColor: palette.main[600]
  },
  checkboxInner: {
    width: '10@ms',
    height: '6@ms',
    borderLeftWidth: '2@ms',
    borderBottomWidth: '2@ms',
    borderColor: '#FFF',
    transform: [{ rotate: '-45deg' }],
    marginTop: '-2@ms'
  },
  checkboxLabel: {
    ...TYPO.body2,
    color: palette.grey[700],
    fontWeight: '500'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '12@ms'
  },
  button: {
    flex: 1,
    paddingVertical: '12@ms',
    borderRadius: '8@ms',
    alignItems: 'center'
  },
  cancelButton: {
    borderWidth: '1@ms',
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
