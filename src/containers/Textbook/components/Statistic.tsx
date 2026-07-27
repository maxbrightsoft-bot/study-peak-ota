import DonutProgress from '@/components/Progress/DonutProgress'
import { palette } from '@/theme'
import { ChapterResponse } from '@/utils/types'
import { toast } from '@/utils/helpers'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  isEnglish: boolean
  chapter: ChapterResponse
}

const Statistic = ({ t, isEnglish, chapter }: Props) => {
  const accuracyRate = chapter.accuracyRate || 0
  const isCompleted = chapter.completedChapterQuestions === chapter.totalChapterQuestions && chapter.totalChapterQuestions > 0
  const total = chapter.totalChapterQuestions || 0
  const completed = chapter.completedChapterQuestions || 0
  const progress = total !== 0 ? (completed / total) * 100 : 0

  const handleCardPress = () => {
    if (!isCompleted) {
      toast.info(t('result_will_be_displayed_after_doing_exam'))
    }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleCardPress}
      style={styles.card}
    >
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {isCompleted && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>{t('completed')}</Text>
            </View>
          )}

          <Text style={styles.title}>{chapter.name}</Text>
        </View>

        <Text style={styles.total}>{`${completed}/${total} ${t('questions')}`}</Text>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('accuracy_rate')}</Text>
          <View style={{ alignSelf: 'flex-end' }}>
            <DonutProgress percentage={accuracyRate} />
          </View>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>{t('progress')}</Text>
          <View style={{ alignSelf: 'flex-end' }}>
            <DonutProgress percentage={progress} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = ScaledSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: '14@ms',
    padding: '16@ms'
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '14@ms'
  },

  title: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: palette.grey[900]
  },

  total: {
    fontSize: '12@ms',
    color: palette.grey[500],
    fontWeight: '500'
  },

  doneBadge: {
    backgroundColor: '#D7FFE7',
    paddingHorizontal: '10@ms',
    paddingVertical: '4@ms',
    borderRadius: '12@ms'
  },

  doneText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#3DC674'
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '10@ms'
  },

  statBox: {
    flex: 1,
    backgroundColor: palette.grey[100],
    borderRadius: '12@ms',
    padding: '12@ms'
  },

  statLabel: {
    fontSize: '12@ms',
    color: palette.grey[900],
    marginBottom: '2@ms',
    fontWeight: '500'
  }
})

export default Statistic
