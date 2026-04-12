import { palette, TYPO } from '@/theme'
import React from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Text } from 'react-native'
import useRecentTextbook from '../hooks/useRecentTextbook'
import { utcToLocalTime } from '@/utils/helpers'
import ArrowRight from '@/assets/iconJSX/arrowRight'


const styles = StyleSheet.create({
  container: {
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    ...TYPO.heading1,
    color: palette.grey[900],
  },
  contentContainer: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  subjectBadge: {
    backgroundColor: palette.grey[100],
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  subjectBadgeDark: {
    backgroundColor: palette.grey[900],
  },
  subjectBadgeText: {
    ...TYPO.body4,
    color: palette.grey[700],
    fontWeight: '600',
  },
  subjectBadgeTextDark: {
    color: '#FFFFFF',
  },
  textbookName: {
    ...TYPO.heading3,
    color: palette.grey[900],
    flex: 1,
  },
  deadline: {
    fontSize: 12,
    fontWeight: 400,
    color: palette.grey[500],
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: 500,
    color: palette.grey[500],
    minWidth: 20,
  },
  progressBarWrapper: {
    flex: 1,
    height: 8,
    backgroundColor: palette.grey[200],
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: palette.main[600],
    borderRadius: 999,
  },
  startButton: {
    backgroundColor: palette.main[600],
    borderRadius: 999,
    paddingVertical: 8,
    paddingRight: 8,
    paddingLeft: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  startButtonText: {
    ...TYPO.button3,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyText: {
    ...TYPO.caption,
    color: palette.grey[500],
    textAlign: 'center',
  },
})

const RecentTextbook = () => {
  const { t, textbookList, handleDoTextbook } = useRecentTextbook()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('continue_solving_textbook')}</Text>
      </View>
      <ScrollView scrollEnabled={false}>
        <View style={styles.contentContainer}>
          {textbookList.map((textbook, index) => {
            const total = textbook?.totalQuestions || 1
            const completed = textbook.completedQuestions || 0
            const percent = Math.round((completed / total) * 100)

            return (
              <View key={textbook.id} style={styles.card}>
                <View style={styles.cardTop}>
                  <View style={[styles.subjectBadge, styles.subjectBadgeDark]}>
                    <Text style={[styles.subjectBadgeText, styles.subjectBadgeTextDark]}>
                      {textbook.subject?.name || textbook.subjectName || '—'}
                    </Text>
                  </View>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.textbookName}>
                    {textbook.name}
                  </Text>
                </View>

                <Text style={styles.deadline}>
                  {utcToLocalTime(textbook.publicationDate, t('date_format'))}
                </Text>

                <View style={styles.progressRow}>
                  <Text style={styles.progressPercent}>{percent}%</Text>
                  <View style={styles.progressBarWrapper}>
                    <View style={[styles.progressBarFill, { width: `${percent}%` as any }]} />
                  </View>
                  <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => handleDoTextbook(textbook)}
                  >
                    <Text style={styles.startButtonText}>{t('start')}</Text>
                    <ArrowRight color='#FFF' />
                  </TouchableOpacity>
                </View>
              </View>
            )
          })}
          {textbookList?.length === 0 && <Text style={styles.emptyText}>{t('no_data')}</Text>}
        </View>
      </ScrollView>
    </View>
  )
}

export default RecentTextbook
