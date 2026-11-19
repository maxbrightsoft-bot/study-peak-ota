// "My daily study goal": presets + a minutes input (1..900). Remove only shows while a personal goal exists.
import React, { useEffect, useState } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { STUDY_TIMER_GOAL_PRESETS } from '../configs/constants'
import { formatDuration, parseGoalMinutes } from '../configs/helpers'
import { StudyTimerMyGoalResponse } from '../configs/types'

type Props = {
  open: boolean
  isSaving: boolean
  goal: StudyTimerMyGoalResponse
  onClose: () => void
  onSave: (minutes: number) => void
}

const StudyTimerMyGoalDialog = ({ open, isSaving, goal, onClose, onSave }: Props) => {
  const { t } = useTranslation()
  const [text, setText] = useState('')

  // Reset each time the dialog opens (a summary reload while open must not overwrite the typed value).
  useEffect(() => {
    if (open) setText(String(goal.personalMinutes ?? goal.teacherMinutes ?? 240))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const parsed = parseGoalMinutes(text)
  const invalid = text.trim() !== '' && parsed === null
  const saveDisabled = parsed === null || isSaving
  const teacherMinutes = goal.teacherMinutes

  const handleSave = () => {
    if (parsed !== null && !isSaving) onSave(parsed)
  }

  return (
    <CommonDialog isVisible={open} onClose={onClose} title={t('studytimer_my_goal_dialog_title')}>
      <View testID="studytimer-my-goal-dialog">
        {typeof teacherMinutes === 'number' ? (
          <Text style={styles.ref}>
            {t('studytimer_my_goal_teacher_ref', { goal: formatDuration(teacherMinutes, t) })}
          </Text>
        ) : null}
        <View style={styles.chips}>
          {STUDY_TIMER_GOAL_PRESETS.map((minutes) => (
            <TouchableOpacity
              key={minutes}
              style={[styles.chip, text.trim() === String(minutes) && styles.chipOn]}
              onPress={() => setText(String(minutes))}
            >
              <Text
                style={[styles.chipText, text.trim() === String(minutes) && styles.chipTextOn]}
              >
                {formatDuration(minutes, t)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, invalid && styles.inputInvalid]}
            value={text}
            onChangeText={setText}
            keyboardType="number-pad"
            maxLength={3}
            onSubmitEditing={handleSave}
            testID="studytimer-my-goal-input"
          />
          <Text style={styles.suffix}>{t('studytimer_my_goal_minutes')}</Text>
        </View>
        {invalid ? <Text style={styles.error}>{t('studytimer_goal_range')}</Text> : null}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelText}>{t('studytimer_cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, saveDisabled && styles.saveOff]}
            disabled={saveDisabled}
            onPress={handleSave}
            testID="studytimer-my-goal-save"
          >
            <Text style={styles.saveText}>{t('studytimer_save')}</Text>
          </TouchableOpacity>
        </View>
        {goal.isPersonal ? (
          <TouchableOpacity
            style={styles.removeBtn}
            disabled={isSaving}
            onPress={() => onSave(0)}
            testID="studytimer-my-goal-remove"
          >
            <Text style={styles.removeText}>{t('studytimer_my_goal_remove')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </CommonDialog>
  )
}

export default StudyTimerMyGoalDialog

const styles = ScaledSheet.create({
  ref: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@ms',
    marginTop: '12@ms'
  },
  chip: {
    paddingVertical: '6@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '999@ms',
    backgroundColor: palette.grey[100]
  },
  chipOn: {
    backgroundColor: palette.main[600]
  },
  chipText: {
    ...TYPO.caption,
    fontWeight: '600',
    color: palette.grey[700]
  },
  chipTextOn: {
    color: palette.common.white
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms',
    marginTop: '16@ms'
  },
  input: {
    ...TYPO.body2,
    width: '96@ms',
    padding: '12@ms',
    textAlign: 'center',
    color: palette.grey[900],
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '8@ms'
  },
  inputInvalid: {
    borderColor: palette.error.main
  },
  suffix: {
    ...TYPO.body3,
    color: palette.grey[700]
  },
  error: {
    ...TYPO.caption,
    color: palette.error.main,
    marginTop: '6@ms'
  },
  footer: {
    flexDirection: 'row',
    gap: '8@ms',
    marginTop: '20@ms'
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: '14@ms'
  },
  cancelText: {
    ...TYPO.button2,
    color: palette.main[600]
  },
  saveBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: '14@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[600]
  },
  saveOff: {
    backgroundColor: palette.grey[300]
  },
  saveText: {
    ...TYPO.button2,
    color: palette.common.white
  },
  removeBtn: {
    alignItems: 'center',
    paddingVertical: '12@ms',
    marginTop: '4@ms'
  },
  removeText: {
    ...TYPO.button2,
    color: palette.error.main
  }
})
