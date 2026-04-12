import DonutProgress from '@/components/Progress/DonutProgress'
import { palette } from '@/theme'
import { ChapterResponse } from '@/utils/types'
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'

type Props = {
  t: any
  isEnglish: boolean
  chapter: ChapterResponse
}

const Statistic = ({ t, isEnglish, chapter }: Props) => {
  const accuracyRate = chapter.accuracyRate || 0
  const isCompleted = chapter.completedChapterQuestions === chapter.totalChapterQuestions
  const total = chapter.totalChapterQuestions || 0
  const completed = chapter.completedChapterQuestions || 0
  const progress = total !== 0 ? (completed / total) * 100 : 0

  return (
    <View style={styles.card}>
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
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 16
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.grey[900]
  },

  total: {
    fontSize: 12,
    color: palette.grey[500],
    fontWeight: '500'
  },

  doneBadge: {
    backgroundColor: '#D7FFE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },

  doneText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3DC674'
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },

  statBox: {
    flex: 1,
    backgroundColor: palette.grey[100],
    borderRadius: 12,
    padding: 12
  },

  statLabel: {
    fontSize: 12,
    color: palette.grey[900],
    marginBottom: 2,
    fontWeight: '500'
  }
})

export default Statistic
