// One inbox message (S9-S12): tap = read; buttons while canReply, otherwise the student's own answer.
import React, { Ref } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { palette, TYPO } from '@/theme'
import { TEMPLATE_KEYS } from '../configs/constants'
import { StudyTimerNotifyTemplate } from '../configs/enums'
import { formatStudyTimerMessageBody, formatStudyTimerReply } from '../configs/helpers'
import { StudyTimerMessageResponse } from '../configs/types'

type Props = {
  message: StudyTimerMessageResponse
  focused: boolean
  acknowledging: boolean
  itemRef?: Ref<View>
  onRead: (id: number) => void
  onAcknowledge: (message: StudyTimerMessageResponse) => void
  onOpenReply: (message: StudyTimerMessageResponse) => void
}

const StudyTimerMyMessageItem = ({
  message,
  focused,
  acknowledging,
  itemRef,
  onRead,
  onAcknowledge,
  onOpenReply
}: Props) => {
  const { t } = useTranslation()
  const unread = !message.readAt
  const isTeacherMessage = message.template === StudyTimerNotifyTemplate.TeacherMessage
  const replyLabel = isTeacherMessage ? t('studytimer_my_answer') : t('studytimer_my_send_reason')

  return (
    <TouchableOpacity
      ref={itemRef as Ref<any>}
      activeOpacity={0.8}
      onPress={() => onRead(message.id)}
      style={[styles.item, unread && styles.unread, focused && styles.focused]}
      testID={`studytimer-my-message-${message.id}`}
    >
      <View style={styles.row}>
        <View style={styles.titleWrap}>
          {unread ? <View style={styles.dot} /> : null}
          <Text style={styles.title}>
            {t(`studytimer_tpl_${TEMPLATE_KEYS[message.template]}_title`, {
              defaultValue: ''
            })}
          </Text>
        </View>
        <Text style={styles.time}>{moment.utc(message.sentAt).local().format('M/D HH:mm')}</Text>
      </View>
      <Text style={styles.body}>{formatStudyTimerMessageBody(message, t)}</Text>
      <Text style={styles.meta}>
        {message.teacherName} · {message.courseName}
      </Text>
      {message.reply ? (
        <View style={styles.replyBox} testID="studytimer-my-reply">
          <Text style={styles.replyText}>
            <Text style={styles.replyLabel}>{t('studytimer_my_my_answer')}: </Text>
            {formatStudyTimerReply(message.template, message.reply, t)}
          </Text>
        </View>
      ) : null}
      {message.canReply ? (
        <View style={styles.actions}>
          {!message.reply ? (
            <TouchableOpacity
              style={[styles.ackBtn, acknowledging && styles.btnOff]}
              disabled={acknowledging}
              onPress={() => onAcknowledge(message)}
              testID="studytimer-my-ack"
            >
              <Text style={styles.ackText}>{t('studytimer_reason_acknowledged')}</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.replyBtn, acknowledging && styles.btnOff]}
            disabled={acknowledging}
            onPress={() => onOpenReply(message)}
            testID="studytimer-my-open-reply"
          >
            <Text style={styles.replyBtnText}>{replyLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </TouchableOpacity>
  )
}

export default StudyTimerMyMessageItem

const styles = ScaledSheet.create({
  item: {
    padding: '12@ms',
    borderRadius: '12@ms',
    borderWidth: 2,
    borderColor: palette.grey[100],
    backgroundColor: palette.common.white
  },
  unread: {
    backgroundColor: palette.main[50]
  },
  focused: {
    borderColor: palette.main[600]
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8@ms'
  },
  titleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },
  dot: {
    width: '7@ms',
    height: '7@ms',
    borderRadius: '4@ms',
    backgroundColor: palette.error.main
  },
  title: {
    ...TYPO.body2,
    fontWeight: '700',
    color: palette.grey[900],
    flexShrink: 1
  },
  time: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  body: {
    ...TYPO.body2,
    color: palette.grey[800],
    marginTop: '6@ms'
  },
  meta: {
    ...TYPO.body3,
    color: palette.grey[500],
    marginTop: '6@ms'
  },
  replyBox: {
    marginTop: '10@ms',
    padding: '10@ms',
    borderRadius: '8@ms',
    backgroundColor: palette.grey[100]
  },
  replyText: {
    ...TYPO.body3,
    color: palette.grey[800]
  },
  replyLabel: {
    fontWeight: '700'
  },
  actions: {
    flexDirection: 'row',
    gap: '8@ms',
    marginTop: '10@ms'
  },
  ackBtn: {
    paddingVertical: '8@ms',
    paddingHorizontal: '14@ms',
    borderRadius: '8@ms',
    borderWidth: 1,
    borderColor: palette.main[300]
  },
  ackText: {
    ...TYPO.button3,
    color: palette.main[600]
  },
  replyBtn: {
    paddingVertical: '8@ms',
    paddingHorizontal: '14@ms',
    borderRadius: '8@ms',
    backgroundColor: palette.main[600]
  },
  replyBtnText: {
    ...TYPO.button3,
    color: palette.common.white
  },
  btnOff: {
    opacity: 0.5
  }
})
