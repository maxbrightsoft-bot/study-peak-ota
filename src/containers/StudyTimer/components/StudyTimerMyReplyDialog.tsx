// S19-S21: reason chips (hidden for a teacher message), text <= 200, send disabled until valid and while sending.
import React, { useEffect, useRef, useState } from 'react'
import { ScrollView, Text, TextInput, TextStyle, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import CommonDialog from '@/components/ModalBase/CommonDialog'
import { REPLY_REASON_KEYS, STUDY_TIMER_MAX_REPLY_LENGTH } from '../configs/constants'
import { StudyTimerNotifyTemplate, StudyTimerReplyReason } from '../configs/enums'
import { formatStudyTimerMessageBody } from '../configs/helpers'
import { StudyTimerMessageResponse, StudyTimerMyReplyRequest } from '../configs/types'

// reasons 1..6 as chips (0 = Acknowledged has its own button)
const CHIP_REASONS = [1, 2, 3, 4, 5, 6] as StudyTimerReplyReason[]

type Props = {
  message?: StudyTimerMessageResponse
  onClose: () => void
  /** Resolves true when the reply was sent (dialog closes); false keeps the dialog and the user's input. */
  onSend: (id: number, body: StudyTimerMyReplyRequest) => Promise<boolean>
}

const StudyTimerMyReplyDialog = ({ message, onClose, onSend }: Props) => {
  const { t } = useTranslation()
  const isTeacherMessage = message?.template === StudyTimerNotifyTemplate.TeacherMessage
  const [reason, setReason] = useState<StudyTimerReplyReason | null>(null)
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submittingRef = useRef(false)

  // Reset when the dialog opens for another message.
  const messageId = message?.id
  useEffect(() => {
    setReason(isTeacherMessage ? StudyTimerReplyReason.Other : null)
    setText('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messageId])

  const trimmed = text.trim()
  const needsText = isTeacherMessage || reason === StudyTimerReplyReason.Other
  const valid =
    reason !== null &&
    text.length <= STUDY_TIMER_MAX_REPLY_LENGTH &&
    (!needsText || trimmed.length > 0)

  const handleSend = async () => {
    if (!message || !valid || reason === null || submittingRef.current) return
    submittingRef.current = true
    setSubmitting(true)
    try {
      const done = await onSend(message.id, {
        reason,
        text: trimmed || undefined
      })
      if (done) onClose()
    } finally {
      submittingRef.current = false
      setSubmitting(false)
    }
  }

  return (
    <CommonDialog
      isVisible={!!message}
      onClose={onClose}
      title={isTeacherMessage ? t('studytimer_my_answer_title') : t('studytimer_my_reason_title')}
    >
      {message ? (
        <ScrollView keyboardShouldPersistTaps="handled" testID="studytimer-my-reply-dialog">
          <View style={styles.original}>
            <Text style={styles.originalText}>{formatStudyTimerMessageBody(message, t)}</Text>
          </View>
          {!isTeacherMessage ? (
            <View style={styles.chips}>
              {CHIP_REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, reason === r && styles.chipOn]}
                  onPress={() => setReason(r)}
                  testID={`studytimer-my-reason-${r}`}
                >
                  <Text style={reason === r ? styles.chipTextOn : styles.chipText}>
                    {t(`studytimer_reason_${REPLY_REASON_KEYS[r]}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
          <TextInput
            style={styles.input as TextStyle}
            multiline
            value={text}
            onChangeText={setText}
            maxLength={STUDY_TIMER_MAX_REPLY_LENGTH}
            placeholder={t('studytimer_my_reply_placeholder')}
            placeholderTextColor={palette.grey[500]}
            textAlignVertical="top"
            testID="studytimer-my-reply-input"
          />
          <Text style={styles.counter}>
            {text.length}/{STUDY_TIMER_MAX_REPLY_LENGTH}
          </Text>
          {needsText && trimmed.length === 0 ? (
            <Text style={styles.hint}>{t('studytimer_my_reply_text_required')}</Text>
          ) : null}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>{t('studytimer_cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendBtn, (!valid || submitting) && styles.sendOff]}
              disabled={!valid || submitting}
              onPress={handleSend}
              testID="studytimer-my-reply-send"
            >
              <Text style={styles.sendText}>{t('studytimer_send')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : null}
    </CommonDialog>
  )
}

export default StudyTimerMyReplyDialog

const styles = ScaledSheet.create({
  original: {
    padding: '10@ms',
    borderRadius: '8@ms',
    backgroundColor: palette.grey[100]
  },
  originalText: {
    ...TYPO.body3,
    color: palette.grey[700]
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '8@ms',
    marginTop: '14@ms'
  },
  chip: {
    paddingVertical: '8@ms',
    paddingHorizontal: '12@ms',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: palette.grey[300]
  },
  chipOn: {
    borderColor: palette.main[600],
    backgroundColor: palette.main[600]
  },
  chipText: {
    ...TYPO.body3,
    color: palette.grey[700]
  },
  chipTextOn: {
    ...TYPO.body3,
    color: palette.common.white
  },
  input: {
    marginTop: '14@ms',
    minHeight: '80@ms',
    padding: '12@ms',
    borderWidth: 1,
    borderColor: palette.grey[300],
    borderRadius: '8@ms',
    ...TYPO.body2,
    color: palette.grey[900]
  },
  counter: {
    ...TYPO.caption,
    color: palette.grey[500],
    textAlign: 'right',
    marginTop: '4@ms'
  },
  hint: {
    ...TYPO.caption,
    color: palette.error.main,
    marginTop: '4@ms'
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
  sendBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: '14@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.main[600]
  },
  sendOff: {
    backgroundColor: palette.grey[300]
  },
  sendText: {
    ...TYPO.button2,
    color: palette.common.white
  }
})
