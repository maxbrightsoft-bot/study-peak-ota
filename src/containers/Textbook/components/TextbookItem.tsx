import { palette, TYPO } from '@/theme'
import { getSafeUrl, utcToLocalTime } from '@/utils/helpers'
import { Textbook } from '@/utils/types'
import { Ionicons } from '@expo/vector-icons'
import { Image, StyleSheet, Text, View } from 'react-native'
import { Button, Divider, Title } from 'react-native-paper'

type Props = {
  textbook: Textbook
  t: any
  handleOpenDialog: (textbook: Textbook) => void
}

const TextbookItem = ({ textbook, t, handleOpenDialog }: Props) => {
  return (
    <View style={styles.textbookItem}>
      <View style={styles.textbookContent}>
        <View style={styles.textbookHeader}>
          <Image
            source={{ uri: getSafeUrl(textbook?.coverImage || '') }}
            style={styles.coverImage}
            onError={(e) => console.log('Error:', e.nativeEvent.error)}
          />
          <View style={styles.textbookInfo}>
            <Title numberOfLines={1} ellipsizeMode="tail" style={styles.textbookTitle}>
              {textbook.name}
            </Title>
            <View style={styles.metaInfo}>
              <Text style={styles.metaText}>{t('total_people', { number: textbook.totalUses || 0 })}</Text>
              <Text style={[styles.metaText, styles.dateText]}>
                {utcToLocalTime(textbook.createdAt, t('date_format'))}
              </Text>
            </View>
          </View>
        </View>
        <Divider />
        <Button
          mode="contained"
          style={styles.startButton}
          buttonColor={palette.main[500]}
          onPress={() => handleOpenDialog(textbook)}
        >
          <View style={styles.buttonContent}>
            <Ionicons name="book" size={20} color="#FFF" />
            <Text style={styles.buttonText}>시험 시작하기</Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  textbookItem: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: palette.grey[100]
  },
  textbookContent: {
    flexDirection: 'column',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  textbookHeader: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  coverImage: {
    width: 96,
    height: 121,
    objectFit: 'contain',
    marginRight: 12
  },
  textbookInfo: {
    gap: 16,
    flex: 1,
    width: '100%'
  },
  textbookTitle: {
    ...TYPO.heading3,
    color: palette.grey[900]
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  metaText: {
    ...TYPO.body4,
    color: palette.grey[900]
  },
  dateText: {
    color: palette.grey[500]
  },
  startButton: {
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 180
  },
  filterButton: {
    paddingVertical: 6,
    borderRadius: 6,
    position: 'absolute',
    bottom: 10,
    left: 24,
    right: 24
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  buttonText: {
    ...TYPO.button1,
    color: '#FFF'
  },
  emptyText: {
    ...TYPO.caption,
    color: palette.grey[500],
    textAlign: 'center'
  }
})

export default TextbookItem
