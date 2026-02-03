import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { palette } from '@/theme'

export type StudyTimeDistribution = {
  name: string
  hours?: number
  percentage?: number
  correctRate?: number
  totalAnsweredQuestions?: number
}

type Props = {
  data?: StudyTimeDistribution[]
  colorSubjects: string[]
  isTimerTab?: boolean
  loading: boolean
}

const ceilTo = (num = 0, digit = 2) => Math.ceil(num * Math.pow(10, digit)) / Math.pow(10, digit)

const roundTo = (num = 0, digit = 2) => Math.round(num * Math.pow(10, digit)) / Math.pow(10, digit)

const DistributionItem = ({
  title,
  subTitle,
  staticsNumber,
  unit,
  isLastItem
}: {
  title?: string
  subTitle?: string
  staticsNumber: number
  unit: string
  isLastItem?: boolean
}) => {
  return (
    <View style={{ ...styles.statItem, borderRightWidth: isLastItem ? 0 : 1 }}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue} numberOfLines={1}>
        {subTitle}
      </Text>
      <Text style={styles.statSub}>
        {staticsNumber}
        {unit}
      </Text>
    </View>
  )
}

const DistributionBarItem = ({
  item,
  color,
  isTimerTab
}: {
  item: StudyTimeDistribution
  color: string
  isTimerTab: boolean
}) => {
  const { t } = useTranslation()

  if (!item.percentage) return null

  const topText = isTimerTab ? `${ceilTo(item.hours || 0, 2)}${t('hour')}` : `${roundTo(item.correctRate || 0, 2)}%`

  const middleText = isTimerTab
    ? `${ceilTo(item.percentage || 0, 2)}%`
    : `${item.totalAnsweredQuestions || 0} ${t('question(s)')}`

  return (
    <View style={[styles.barItem, { flex: item.percentage }]}>
      <Text style={[styles.barTop, { color }]} numberOfLines={1}>
        {topText}
      </Text>

      <View style={[styles.barBody, { backgroundColor: color }]}>
        <Text style={styles.barCenter}>{middleText}</Text>
      </View>

      <Text style={[styles.barBottom, { color }]} numberOfLines={1}>
        {item.name}
      </Text>
    </View>
  )
}

const SubjectDistribution = ({ data, loading, colorSubjects, isTimerTab = true }: Props) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!data || data.length === 0) {
    return null
  }

  const most = data[0]
  const least = data[data.length - 1]

  return (
    <View style={styles.card}>
      <View style={styles.barRow}>
        {data.map((item, index) => (
          <DistributionBarItem
            key={index}
            item={item}
            color={colorSubjects[index] || '#1877F2'}
            isTimerTab={isTimerTab}
          />
        ))}
      </View>

      <View style={styles.statsRow}>
        {isTimerTab ? (
          <>
            <DistributionItem
              title={t('most_studied_subject')}
              subTitle={most.name}
              staticsNumber={ceilTo(most.hours || 0, 2)}
              unit={t('hour')}
            />
            <DistributionItem
              title={t('least_studied_subject')}
              subTitle={least.name}
              staticsNumber={ceilTo(least.hours || 0, 2)}
              unit={t('hour')}
            />
            <DistributionItem
              title={t('study_imbalance_rate')}
              subTitle={t('imbalance_rate', {
                rate: ceilTo((most.hours || 0) / (least.hours || 1), 2)
              })}
              staticsNumber={ceilTo((most.hours || 0) - (least.hours || 0), 2)}
              isLastItem
              unit={t('hour')}
            />
          </>
        ) : (
          <>
            <DistributionItem
              title={t('highest_accuracy_rate')}
              subTitle={most.name}
              staticsNumber={most.correctRate || 0}
              unit="%"
            />
            <DistributionItem
              title={t('lowest_accuracy_rate')}
              subTitle={least.name}
              staticsNumber={least.correctRate || 0}
              unit="%"
            />
            <DistributionItem
              title={t('accuracy_rate_difference')}
              subTitle={t('imbalance_rate', {
                rate: ceilTo((most.correctRate || 0) / (least.correctRate || 1), 2)
              })}
              staticsNumber={roundTo((most.correctRate || 0) - (least.correctRate || 0), 2)}
              unit="%"
              isLastItem
            />
          </>
        )}
      </View>
    </View>
  )
}

export default SubjectDistribution

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 16,
    gap: 16,
    borderWidth: 1,
    borderColor: palette.grey[100]
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },

  barItem: {
    alignItems: 'center',
    justifyContent: 'flex-end'
  },

  barTop: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4
  },

  barBody: {
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },

  barCenter: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFF'
  },

  barBottom: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderColor: palette.grey[100]
  },

  statTitle: {
    fontSize: 12,
    color: '#9CA3AF'
  },

  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827'
  },

  statSub: {
    fontSize: 12,
    color: '#6B7280'
  }
})
