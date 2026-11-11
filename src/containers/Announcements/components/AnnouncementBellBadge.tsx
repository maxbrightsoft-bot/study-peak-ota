import { Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'
import useAnnouncementStore from '@/store/useAnnouncementStore'
import { palette, TYPO } from '@/theme'
import { bellBadgeLabel } from '../configs/helpers'

/** Unread count on the header bell (hidden at 0). Place inside the bell's touchable. */
const AnnouncementBellBadge = () => {
  const unread = useAnnouncementStore((state) => state.unread)
  const label = bellBadgeLabel(unread)
  if (!label) return null
  return (
    <View style={styles.badge} pointerEvents="none" testID="announcement-bell-badge">
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  )
}

export default AnnouncementBellBadge

const styles = ScaledSheet.create({
  badge: {
    position: 'absolute',
    top: '-6@ms',
    right: '-8@ms',
    minWidth: '18@ms',
    paddingHorizontal: '4@ms',
    borderRadius: '9@ms',
    alignItems: 'center',
    backgroundColor: palette.error.main
  },
  badgeText: {
    ...TYPO.body3,
    fontWeight: '700',
    color: palette.common.white
  }
})
