import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import useAnnouncementStore from '@/store/useAnnouncementStore'
import useAuthStore from '@/store/useAuthStore'
import { palette, TYPO } from '@/theme'
import { Role } from '@/utils/enums'
import { getErrorMessage, toast } from '@/utils/helpers'
import NoticeDetailDialog from '@/containers/Notice/components/NoticeDetailDialog'
import AnnouncementItem from '../components/AnnouncementItem'
import { AnnouncementReadFilter } from '../configs/enums'
import { AnnouncementResponse } from '../configs/types'
import { announcementTimeAgo, announcementView } from '../configs/view'
import useAnnouncementOpen from '../hooks/useAnnouncementOpen'

type AnnouncementListProps = {
  /** Closes the bell dialog (before navigating away). */
  onClose: () => void
}

const FILTERS = [
  { value: AnnouncementReadFilter.All, label: 'notification_filter_all' },
  { value: AnnouncementReadFilter.Unread, label: 'notification_filter_unread' },
  { value: AnnouncementReadFilter.Read, label: 'notification_filter_read' }
]

/** The personal tab of the bell: wrong-note, study-timer and note notifications (web bell parity). */
const AnnouncementList = ({ onClose }: AnnouncementListProps) => {
  const { t } = useTranslation()
  const isStudentUser = useAuthStore((state) => !!state.user?.roles?.includes(Role.Student))
  const items = useAnnouncementStore((state) => state.items)
  const unread = useAnnouncementStore((state) => state.unread)
  const readFilter = useAnnouncementStore((state) => state.readFilter)
  const isLoading = useAnnouncementStore((state) => state.isLoading)
  const isLoaded = useAnnouncementStore((state) => state.isLoaded)
  const loadError = useAnnouncementStore((state) => state.loadError)
  const [refreshing, setRefreshing] = useState(false)
  const { open, note, closeNote } = useAnnouncementOpen(onClose)

  const handleLoad = useCallback(
    async (filter: AnnouncementReadFilter) => {
      try {
        await useAnnouncementStore.getState().load(filter)
      } catch (error) {
        toast.error(getErrorMessage(t, error))
      }
    },
    [t]
  )

  useEffect(() => {
    void handleLoad(AnnouncementReadFilter.All)
    void useAnnouncementStore.getState().refreshUnread()
  }, [handleLoad])

  const handleRefresh = async () => {
    setRefreshing(true)
    await handleLoad(readFilter)
    await useAnnouncementStore.getState().refreshUnread()
    setRefreshing(false)
  }

  const handleLoadMore = async () => {
    try {
      await useAnnouncementStore.getState().loadMore()
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await useAnnouncementStore.getState().markAllRead()
    } catch (error) {
      toast.error(getErrorMessage(t, error))
    }
  }

  const renderItem = ({ item }: { item: AnnouncementResponse }) => (
    <AnnouncementItem
      view={announcementView(item, t, isStudentUser)}
      timeAgo={announcementTimeAgo(item, t)}
      isRead={item.isRead}
      onPress={() => open(item)}
    />
  )

  const renderEmpty = () =>
    loadError && !isLoading ? (
      <View style={styles.empty}>
        <Ionicons name="cloud-offline-outline" size={56} color={palette.grey[300]} />
        <TouchableOpacity style={styles.retry} onPress={() => handleLoad(readFilter)} activeOpacity={0.8}>
          <Text style={styles.retryText}>{t('try_again')}</Text>
        </TouchableOpacity>
      </View>
    ) : isLoaded && !isLoading ? (
      <View style={styles.empty}>
        <Ionicons name="notifications-off-outline" size={56} color={palette.grey[300]} />
        <Text style={styles.emptyText}>{t('wrong_note_bell_no_notices')}</Text>
      </View>
    ) : (
      <ActivityIndicator color={palette.main[600]} style={styles.loader} />
    )

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Text style={styles.unreadText}>{t('you_have_n_unread_messages', { n: unread })}</Text>
        <TouchableOpacity onPress={handleMarkAllRead} disabled={unread === 0} hitSlop={8}>
          <Text style={[styles.markAll, unread === 0 && styles.markAllDisabled]}>{t('mark_as_read')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.filters}>
        {FILTERS.map(({ value, label }) => {
          const active = value === readFilter
          return (
            <TouchableOpacity
              key={value}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => handleLoad(value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t(label)}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      />
      <NoticeDetailDialog open={!!note} onClose={closeNote} notification={note ?? null} />
    </View>
  )
}

export default AnnouncementList

const styles = ScaledSheet.create({
  container: {
    flex: 1
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '20@ms',
    paddingTop: '12@ms'
  },
  unreadText: {
    ...TYPO.body3,
    color: palette.grey[700]
  },
  markAll: {
    ...TYPO.body3,
    fontWeight: '700',
    color: palette.main[600]
  },
  markAllDisabled: {
    color: palette.grey[400]
  },
  filters: {
    flexDirection: 'row',
    gap: '8@ms',
    paddingHorizontal: '20@ms',
    paddingVertical: '10@ms'
  },
  chip: {
    paddingHorizontal: '12@ms',
    paddingVertical: '4@ms',
    borderRadius: '14@ms',
    backgroundColor: palette.grey[100]
  },
  chipActive: {
    backgroundColor: palette.main[600]
  },
  chipText: {
    ...TYPO.body3,
    color: palette.grey[700]
  },
  chipTextActive: {
    color: palette.common.white,
    fontWeight: '700'
  },
  list: {
    paddingHorizontal: '20@ms',
    paddingBottom: '24@ms',
    flexGrow: 1
  },
  empty: {
    alignItems: 'center',
    paddingTop: '48@ms',
    gap: '12@ms'
  },
  emptyText: {
    ...TYPO.body2,
    color: palette.grey[500]
  },
  loader: {
    marginTop: '32@ms'
  },
  retry: {
    paddingHorizontal: '16@ms',
    paddingVertical: '8@ms',
    borderRadius: '16@ms',
    backgroundColor: palette.main[600]
  },
  retryText: {
    ...TYPO.body2,
    fontWeight: '700',
    color: palette.common.white
  }
})
