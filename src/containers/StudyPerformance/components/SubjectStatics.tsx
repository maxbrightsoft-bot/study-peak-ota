import React from 'react'
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { ScaledSheet } from 'react-native-size-matters'

export type StudyTimeDistribution = {
  name: string
  correctRate?: number
  totalAnsweredQuestions?: number
  totalCorrectQuestions?: number
}

type Props = {
  data: StudyTimeDistribution[]
  loading: boolean
}

const roundTo = (num = 0, digit = 2) => Math.round(num * Math.pow(10, digit)) / Math.pow(10, digit)

type ItemProps = {
  title: string
  staticsNumber: number
  unit: string
}

const SubjectStaticsItem = ({ title, staticsNumber, unit }: ItemProps) => {
  return (
    <View style={styles.rowBetween}>
      <Text style={styles.itemTitle}>{title}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.itemValue}>{staticsNumber}</Text>
        <Text style={styles.itemUnit}>{unit}</Text>
      </View>
    </View>
  )
}

const SubjectStaticsCard = ({ category }: { category: StudyTimeDistribution }) => {
  const { t } = useTranslation()

  return (
    <View style={styles.card}>
      <Text style={styles.subjectName} numberOfLines={1}>
        {category.name}
      </Text>
      <View style={{ gap: 4 }}>
        <SubjectStaticsItem title={t('correct_rate')} staticsNumber={roundTo(category.correctRate || 0, 2)} unit="%" />
        <SubjectStaticsItem
          title={t('number_questions_solved')}
          staticsNumber={category.totalAnsweredQuestions || 0}
          unit={t('question(s)')}
        />
        <SubjectStaticsItem
          title={t('number_correct_answers')}
          staticsNumber={category.totalCorrectQuestions || 0}
          unit={t('question(s)')}
        />
      </View>
    </View>
  )
}

const SubjectStatics = ({ data, loading }: Props) => {
  const { t } = useTranslation()

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator />
      </View>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <View style={styles.container}>
      {data.map((item, index) => (
        <View key={index} style={styles.gridItem}>
          <SubjectStaticsCard category={item} />
        </View>
      ))}
    </View>
  )
}

export default SubjectStatics

const styles = ScaledSheet.create({
  container: {
    gap: '10@ms'
  },

  gridItem: {},

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    padding: '16@ms',
    gap: '12@ms'
  },

  subjectName: {
    fontSize: '14@ms',
    fontWeight: '600',
    textAlign: 'center',
    paddingVertical: '4@ms',
    borderRadius: '999@ms',
    color: '#111827'
  },

  divider: {
    height: '1@ms',
    backgroundColor: '#E5E7EB',
    marginVertical: '12@ms'
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: '4@ms'
  },

  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '6@ms'
  },

  itemTitle: {
    fontSize: '14@ms',
    color: '#374151'
  },

  itemValue: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#111827'
  },

  itemUnit: {
    fontSize: '14@ms',
    color: '#6B7280'
  },

  loading: {
    height: '300@ms',
    justifyContent: 'center',
    alignItems: 'center'
  }
})
