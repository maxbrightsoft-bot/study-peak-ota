import { memo } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { Avatar } from 'react-native-paper'
import { ScaledSheet } from 'react-native-size-matters'
import { palette, TYPO } from '@/theme'
import { AnnouncementView } from '../configs/view'

type AnnouncementItemProps = {
  view: AnnouncementView
  /** "3 hours ago" (announcementTimeAgo). */
  timeAgo: string
  isRead: boolean
  onPress: () => void
}

const initialsOf = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

const AnnouncementItem = ({ view, timeAgo, isRead, onPress }: AnnouncementItemProps) => (
  <TouchableOpacity style={[styles.item, !isRead && styles.unreadItem]} onPress={onPress} activeOpacity={0.8}>
    {view.avatar ? (
      <Avatar.Image size={36} source={{ uri: view.avatar }} />
    ) : (
      <Avatar.Text size={36} label={initialsOf(view.name) || '?'} style={styles.avatarText} />
    )}
    <View style={styles.body}>
      <Text style={styles.name} numberOfLines={1}>
        {view.name}
        {view.action ? <Text style={styles.action}> {view.action}</Text> : null}
      </Text>
      {view.content ? (
        <Text style={styles.content} numberOfLines={3}>
          {view.content}
        </Text>
      ) : null}
      {timeAgo ? <Text style={styles.time}>{timeAgo}</Text> : null}
    </View>
    {!isRead ? <View style={styles.dot} testID="announcement-unread-dot" /> : null}
  </TouchableOpacity>
)

export default memo(AnnouncementItem)

const styles = ScaledSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: '12@ms',
    paddingHorizontal: '16@ms',
    paddingVertical: '12@ms',
    backgroundColor: palette.common.white,
    borderRadius: '12@ms',
    marginBottom: '8@ms'
  },
  unreadItem: {
    backgroundColor: palette.main[50]
  },
  avatarText: {
    backgroundColor: palette.main[500]
  },
  body: {
    flex: 1,
    gap: '4@ms'
  },
  name: {
    ...TYPO.body2,
    fontWeight: '700',
    color: palette.grey[900]
  },
  action: {
    ...TYPO.body2,
    fontWeight: '400',
    color: palette.grey[700]
  },
  content: {
    ...TYPO.body2,
    color: palette.grey[800]
  },
  time: {
    ...TYPO.body3,
    color: palette.grey[500]
  },
  dot: {
    width: '8@ms',
    height: '8@ms',
    borderRadius: '4@ms',
    marginTop: '6@ms',
    backgroundColor: palette.error.main
  }
})
