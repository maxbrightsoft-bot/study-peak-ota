// "When did you stop?" Rule (same as the server): start < end <= min(start + 6 h, now). Closes only on success.
import React, { useEffect, useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import DateTimePickerModal from 'react-native-modal-datetime-picker'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { palette, TYPO } from '@/theme'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { getErrorMessage, toast } from '@/utils/helpers'
import { closeMyRecordApi } from '../apiClients'
import { STUDY_TIMER_MAX_CLOSE_HOURS } from '../configs/constants'
import { defaultEndTime, getErrorStatus, toServerUtc, validateEndTime } from '../configs/helpers'
import { StudyTimerMyUnclosedResponse } from '../configs/types'

type Props = {
  open: boolean
  item?: StudyTimerMyUnclosedResponse
  subjectName: string
  onClose: () => void
  onSaved: () => void
}

const StudyTimerMyCloseDialog = ({ open, item, subjectName, onClose, onSaved }: Props) => {
  const { t } = useTranslation()
  const [value, setValue] = useState<Date>(new Date())
  const [pickerOpen, setPickerOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  // Prefill when the dialog opens for a run. Keyed on the id so a summary reload can't overwrite the user's pick.
  const itemId = item?.id
  const startedAt = item?.startedAt
  const latestEndAt = item?.latestEndAt
  useEffect(() => {
    if (open && startedAt && latestEndAt) setValue(defaultEndTime(startedAt, latestEndAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, itemId])

  if (!item) return null

  const start = moment.utc(item.startedAt)
  const maximumDate = moment
    .min(start.clone().add(STUDY_TIMER_MAX_CLOSE_HOURS, 'hours'), moment())
    .toDate()
  const valid = validateEndTime(item.startedAt, value, new Date())

  const handleSave = async () => {
    if (submittingRef.current || !valid) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      await closeMyRecordApi(item.id, { endedAt: toServerUtc(value) })
      toast.success(t('studytimer_my_toast_closed'))
      onSaved()
    } catch (error: unknown) {
      toast.error(getErrorMessage(t, error))
      const status = getErrorStatus(error)
      // 420 (already handled) / 404 (gone): the run is stale -> close + reload.
      // Anything else (network, 400): keep the dialog open with the user's time.
      if (status === 420 || status === 404) onSaved()
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <>
      <CommonDialog
        isVisible={open && !pickerOpen}
        onClose={onClose}
        title={t('studytimer_my_close_title')}
      >
        <View testID="studytimer-my-close-dialog">
          <Text style={styles.desc}>
            {t('studytimer_my_close_desc', {
              subject: subjectName,
              time: start.clone().local().format('M/D HH:mm')
            })}
          </Text>
          <Text style={styles.label}>{t('studytimer_my_end_time')}</Text>
          <TouchableOpacity
            style={[styles.field, !valid && styles.fieldInvalid]}
            onPress={() => setPickerOpen(true)}
            testID="studytimer-my-end-input"
          >
            <Text style={styles.fieldText}>{moment(value).format('YYYY-MM-DD HH:mm')}</Text>
          </TouchableOpacity>
          {valid ? (
            <Text style={styles.note}>{t('studytimer_my_close_note')}</Text>
          ) : (
            <Text style={styles.error}>{t('studytimer_my_end_invalid')}</Text>
          )}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('studytimer_cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveBtn, (!valid || submitting) && styles.saveOff]}
              disabled={!valid || submitting}
              onPress={handleSave}
              testID="studytimer-my-close-save"
            >
              <Text style={styles.saveText}>{t('studytimer_save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CommonDialog>
      <DateTimePickerModal
        isVisible={pickerOpen}
        mode="datetime"
        date={value}
        minimumDate={start.toDate()}
        maximumDate={maximumDate}
        is24Hour
        onConfirm={(d) => {
          setValue(d)
          setPickerOpen(false)
        }}
        onCancel={() => setPickerOpen(false)}
      />
    </>
  )
}

export default StudyTimerMyCloseDialog

const styles = ScaledSheet.create({
  desc: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  label: {
    ...TYPO.body3,
    fontWeight: '600',
    color: palette.grey[700],
    marginTop: '16@ms'
  },
  field: {
    marginTop: '6@ms',
    padding: '12@ms',
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '8@ms'
  },
  fieldInvalid: {
    borderColor: palette.error.main
  },
  fieldText: {
    ...TYPO.body2,
    color: palette.grey[900]
  },
  note: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginTop: '6@ms'
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
  }
})
