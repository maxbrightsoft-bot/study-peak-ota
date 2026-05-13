import { palette, TYPO } from '@/theme'
import { getSafeUrl } from '@/utils/helpers'
import { Textbook } from '@/utils/types'
import { Image, StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { formatTime } from '../configs/helpers'
import moment from 'moment'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  textbook: Textbook
  t: any
  handleOpenDialog: (textbook: Textbook) => void
}

const TextbookItem = ({ textbook, t, handleOpenDialog }: Props) => {

  return (
    <View>
      <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => handleOpenDialog(textbook)}>
        <Image source={{ uri: getSafeUrl(textbook?.coverImage || '') }} style={styles.cover} />

        <View style={styles.content}>
          <View style={styles.topRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{textbook?.subject?.name}</Text>
            </View>

            <Text style={styles.timeText}>{moment(textbook.createdAt).fromNow()}</Text>
          </View>

          <Text numberOfLines={2} style={styles.title}>
            {textbook.name}
          </Text>

          <View style={styles.progressRow}>
            <Text style={styles.progressText}>{textbook.progress || 0}%</Text>
            <Text style={styles.durationText}>{formatTime(t, textbook.totalAnswerTime)}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <View style={styles.divider} />
    </View>
  )
}

const styles = ScaledSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF'
  },
  divider: {
    height: '1@ms',
    flex: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: '20@ms'
  },
  cover: {
    width: '62@ms',
    height: '78@ms',
    borderRadius: '8@ms',
    marginRight: '16@ms'
  },

  content: {
    flex: 1,
    justifyContent: 'space-between'
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  badge: {
    backgroundColor: '#E6F2FF',
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms'
  },

  badgeText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#36BFEC'
  },

  timeText: {
    fontSize: '12@ms',
    color: palette.grey[500]
  },

  title: {
    ...TYPO.body1,
    fontWeight: '600',
    color: palette.grey[900],
    marginVertical: '6@ms'
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8@ms'
  },

  progressText: {
    fontSize: '14@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },

  durationText: {
    fontSize: '13@ms',
    color: palette.grey[500]
  }
})

export default TextbookItem
