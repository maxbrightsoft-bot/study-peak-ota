// 선생님 알림 card (S8-S12). Lives inside the page ScrollView: "더 보기" loads the next 20, no nested list.
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import { useTranslation } from 'react-i18next'
import { palette, TYPO } from '@/theme'
import { StudyTimerReplyReason } from '../configs/enums'
import { StudyTimerMessageResponse, StudyTimerMyReplyRequest } from '../configs/types'
import StudyTimerMyMessageItem from './StudyTimerMyMessageItem'
import StudyTimerMyReplyDialog from './StudyTimerMyReplyDialog'

const FOCUS_MS = 2500

type Props = {
  items: StudyTimerMessageResponse[]
  unreadCount: number
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  focusMessageId?: number
  loadMore: () => void
  markRead: (id: number) => Promise<void>
  reply: (id: number, body: StudyTimerMyReplyRequest) => Promise<boolean>
  /** Called after a read / reply so the page summary (badge) refreshes. */
  onChanged: () => void
  /** Scroll the page so this item is visible. */
  onFocusItem: (node: View) => void
}

const StudyTimerMyMessages = ({
  items,
  unreadCount,
  loading,
  loadingMore,
  hasMore,
  focusMessageId,
  loadMore,
  markRead,
  reply,
  onChanged,
  onFocusItem
}: Props) => {
  const { t } = useTranslation()
  const [replyId, setReplyId] = useState<number>()
  const [highlightId, setHighlightId] = useState<number>()
  const [ackingId, setAckingId] = useState<number>()
  const ackingRef = useRef(false)
  const nodes = useRef<Map<number, View>>(new Map())
  const handledFocus = useRef<number | undefined>(undefined)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Focus from a push: outline for 2.5 s and scroll into view once the item is on screen.
  useEffect(() => {
    if (!focusMessageId || handledFocus.current === focusMessageId) return
    if (!items.some((m) => m.id === focusMessageId)) return
    handledFocus.current = focusMessageId
    setHighlightId(focusMessageId)
    timers.current.push(
      setTimeout(() => {
        const node = nodes.current.get(focusMessageId)
        if (node) onFocusItem(node)
      }, 250),
      setTimeout(() => setHighlightId(undefined), FOCUS_MS)
    )
  }, [focusMessageId, items, onFocusItem])

  useEffect(
    () => () => {
      timers.current.forEach(clearTimeout)
    },
    []
  )

  const handleRead = useCallback(
    async (id: number) => {
      const wasUnread = items.some((m) => m.id === id && !m.readAt)
      await markRead(id)
      if (wasUnread) onChanged()
    },
    [items, markRead, onChanged]
  )

  const handleReply = useCallback(
    async (id: number, body: StudyTimerMyReplyRequest) => {
      const done = await reply(id, body)
      onChanged() // also on failure: a 420 means the server state changed
      return done
    },
    [reply, onChanged]
  )

  const handleAcknowledge = useCallback(
    async (message: StudyTimerMessageResponse) => {
      if (ackingRef.current) return
      ackingRef.current = true
      setAckingId(message.id)
      try {
        await handleReply(message.id, {
          reason: StudyTimerReplyReason.Acknowledged
        })
      } finally {
        ackingRef.current = false
        setAckingId(undefined)
      }
    },
    [handleReply]
  )

  // The dialog follows the live item: once it was answered elsewhere (reload) it closes by itself.
  const replyMessage = items.find((m) => m.id === replyId)
  const dialogMessage = replyMessage?.canReply ? replyMessage : undefined

  return (
    <View style={styles.card} testID="studytimer-my-messages">
      <View style={styles.titleRow}>
        <Text style={styles.title}>{t('studytimer_my_messages_title')}</Text>
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText} testID="studytimer-my-unread">
              {unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
      {loading ? (
        <ActivityIndicator color={palette.main[600]} style={styles.loader} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{t('studytimer_my_messages_empty')}</Text>
      ) : (
        <View style={styles.list}>
          {items.map((m) => (
            <StudyTimerMyMessageItem
              key={m.id}
              message={m}
              focused={highlightId === m.id}
              acknowledging={ackingId === m.id}
              itemRef={(node) => {
                if (node) nodes.current.set(m.id, node)
                else nodes.current.delete(m.id)
              }}
              onRead={handleRead}
              onAcknowledge={handleAcknowledge}
              onOpenReply={(msg) => setReplyId(msg.id)}
            />
          ))}
          {hasMore ? (
            <TouchableOpacity
              style={styles.more}
              disabled={loadingMore}
              onPress={loadMore}
              testID="studytimer-my-messages-more"
            >
              {loadingMore ? (
                <ActivityIndicator color={palette.main[600]} />
              ) : (
                <Text style={styles.moreText}>{t('load_more')}</Text>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      )}
      <StudyTimerMyReplyDialog
        message={dialogMessage}
        onClose={() => setReplyId(undefined)}
        onSend={handleReply}
      />
    </View>
  )
}

export default StudyTimerMyMessages

const styles = ScaledSheet.create({
  card: {
    padding: '16@ms',
    borderRadius: '16@ms',
    backgroundColor: palette.common.white
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },
  title: {
    ...TYPO.heading3,
    color: palette.grey[900]
  },
  badge: {
    minWidth: '20@ms',
    paddingHorizontal: '6@ms',
    paddingVertical: '1@ms',
    borderRadius: '10@ms',
    alignItems: 'center',
    backgroundColor: palette.error.main
  },
  badgeText: {
    ...TYPO.body3,
    fontWeight: '700',
    color: palette.common.white
  },
  loader: {
    marginVertical: '16@ms'
  },
  empty: {
    ...TYPO.body2,
    color: palette.grey[500],
    textAlign: 'center',
    marginVertical: '20@ms'
  },
  list: {
    gap: '10@ms',
    marginTop: '12@ms'
  },
  more: {
    alignItems: 'center',
    paddingVertical: '12@ms'
  },
  moreText: {
    ...TYPO.button2,
    color: palette.main[600]
  }
})
