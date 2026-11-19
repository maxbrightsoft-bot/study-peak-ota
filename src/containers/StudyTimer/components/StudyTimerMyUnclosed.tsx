// Timers the student forgot to stop. They never count; the student enters the real end time or deletes the record.
import React, { useRef, useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet, moderateScale } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { palette, TYPO } from '@/theme'
import { ConfirmDialog } from '@/components/ModalBase/ConfirmDialog'
import { getErrorMessage, toast } from '@/utils/helpers'
import { discardMyRecordApi } from '../apiClients'
import { StudyTimerMyUnclosedResponse, StudyTimerSubjectResponse } from '../configs/types'
import StudyTimerMyCloseDialog from './StudyTimerMyCloseDialog'

type Props = {
  items: StudyTimerMyUnclosedResponse[]
  subjects: StudyTimerSubjectResponse[]
  onChanged: () => void
}

const formatShortDateTime = (utc: string): string => moment.utc(utc).local().format('M/D HH:mm')

const StudyTimerMyUnclosed = ({ items, subjects, onChanged }: Props) => {
  const { t } = useTranslation()
  const [closeFor, setCloseFor] = useState<StudyTimerMyUnclosedResponse>()
  const [discardFor, setDiscardFor] = useState<StudyTimerMyUnclosedResponse>()
  const discarding = useRef(false)

  if (items.length === 0) return null

  const subjectName = (id?: number | null) => subjects.find((s) => s.id === id)?.name ?? ''

  const handleDiscard = async () => {
    const item = discardFor
    if (!item || discarding.current) return
    discarding.current = true
    setDiscardFor(undefined)
    try {
      await discardMyRecordApi(item.id)
      toast.success(t('studytimer_my_toast_discarded'))
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    } finally {
      discarding.current = false
      onChanged() // also on error: the run may already be gone / closed elsewhere
    }
  }

  return (
    <View style={styles.card} testID="studytimer-my-unclosed">
      <View style={styles.titleRow}>
        <Ionicons
          name="alert-circle-outline"
          size={moderateScale(20)}
          color={palette.warning.dark}
        />
        <Text style={styles.title}>{t('studytimer_my_unclosed_title', { n: items.length })}</Text>
      </View>
      <Text style={styles.desc}>{t('studytimer_my_unclosed_desc')}</Text>
      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.item} testID="studytimer-my-unclosed-item">
            <Text style={styles.itemText}>
              <Text style={styles.subject}>{subjectName(item.subjectId)}</Text>
              {'  '}
              <Text style={styles.time}>
                {t('studytimer_my_unclosed_started', {
                  time: formatShortDateTime(item.startedAt)
                })}
              </Text>
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => setCloseFor(item)}
                testID="studytimer-my-close-run"
              >
                <Text style={styles.primaryText}>{t('studytimer_my_enter_end')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.ghostBtn}
                onPress={() => setDiscardFor(item)}
                testID="studytimer-my-discard-run"
              >
                <Text style={styles.ghostText}>{t('studytimer_my_discard')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
      <StudyTimerMyCloseDialog
        open={!!closeFor}
        item={closeFor}
        subjectName={subjectName(closeFor?.subjectId)}
        onClose={() => setCloseFor(undefined)}
        onSaved={() => {
          setCloseFor(undefined)
          onChanged()
        }}
      />
      <ConfirmDialog
        open={!!discardFor}
        toggle={() => setDiscardFor(undefined)}
        title={t('studytimer_my_discard_title')}
        text={
          discardFor
            ? t('studytimer_my_discard_text', {
                subject: subjectName(discardFor.subjectId),
                time: formatShortDateTime(discardFor.startedAt)
              })
            : ''
        }
        okText={t('studytimer_my_discard')}
        cancelText={t('studytimer_cancel')}
        onConfirm={handleDiscard}
      />
    </View>
  )
}

export default StudyTimerMyUnclosed

const styles = ScaledSheet.create({
  card: {
    padding: '16@ms',
    borderRadius: '16@ms',
    borderWidth: 1,
    borderColor: palette.warning.light,
    backgroundColor: palette.warning.lighter
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  title: {
    ...TYPO.heading3,
    flex: 1,
    color: palette.warning.dark
  },
  desc: {
    ...TYPO.caption,
    color: palette.grey[700],
    marginTop: '6@ms'
  },
  list: {
    gap: '8@ms',
    marginTop: '12@ms'
  },
  item: {
    gap: '8@ms',
    padding: '12@ms',
    borderRadius: '12@ms',
    backgroundColor: palette.common.white
  },
  itemText: {
    ...TYPO.body3,
    color: palette.grey[900]
  },
  subject: {
    fontWeight: '700'
  },
  time: {
    color: palette.grey[500]
  },
  actions: {
    flexDirection: 'row',
    gap: '8@ms'
  },
  primaryBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: '10@ms',
    borderRadius: '10@ms',
    backgroundColor: palette.main[600]
  },
  primaryText: {
    ...TYPO.button3,
    color: palette.common.white
  },
  ghostBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: '10@ms',
    borderRadius: '10@ms',
    borderWidth: 1,
    borderColor: palette.grey[300]
  },
  ghostText: {
    ...TYPO.button3,
    color: palette.grey[700]
  }
})
