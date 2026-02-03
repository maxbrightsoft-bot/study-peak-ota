import React, { useMemo, useState } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import { BarChart } from 'react-native-gifted-charts'
import { DataResponse, QuestionAnswerOverallResponse } from '../configs/types'
import { calcFocusTime, ceilTo } from '../configs/helper'
import { timeTypeOptions, TypeText } from '../configs/constants'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'

type Props = {
  categories: string[]
  data?: DataResponse
  renderChart?: () => void
  timeType: number
  label: string
  loading: boolean
  isPrint?: boolean
  overallData?: QuestionAnswerOverallResponse
  isTimerTab?: boolean
}

type ItemProps = {
  title: string
  staticsNumber: number
  isCompared?: boolean
  unit: string
  isOverall?: boolean
  subStaticsNumber?: number
  subStaticsTitle?: string
}

const StudyTimeDescriptionItem = ({
  title,
  subStaticsNumber,
  staticsNumber,
  unit,
  isOverall,
  subStaticsTitle,
  isCompared = false
}: ItemProps) => {
  const valueColor = !isOverall && isCompared ? (staticsNumber >= 0 ? '#059669' : '#DC2626') : '#111827'

  return (
    <View style={styles.statsItem}>
      <View style={styles.statsTitleRow}>
        <Text style={styles.statsTitle}>{title}</Text>
        {!!subStaticsTitle && <Text style={styles.statsTitle}>{subStaticsTitle}</Text>}
      </View>

      <View style={styles.statsValueRow}>
        <Text style={[styles.statsValue, { color: valueColor }]}>
          {isCompared ? `${staticsNumber >= 0 ? '+' : '-'}${Math.abs(staticsNumber)}` : staticsNumber}
          <Text style={styles.statsUnit}>{` ${unit}`}</Text>
        </Text>

        {!!subStaticsNumber && (
          <Text style={styles.subStatsValue}>
            {`${subStaticsNumber >= 0 ? '+' : '-'}${Math.abs(subStaticsNumber)}${unit}`}
          </Text>
        )}
      </View>
    </View>
  )
}

const BAR_WIDTH = 8
const BARS_PER_GROUP = 2
const H_PADDING = 16 * 2

const StudyTimeChart = ({
  data,
  label,
  loading,
  timeType,
  overallData,
  categories = [],
  renderChart,
  isTimerTab = true
}: Props) => {
  const { t } = useTranslation()
  const totalP = useMemo(() => calcFocusTime(data?.pData, isTimerTab), [data?.pData, isTimerTab])
  const totalS = useMemo(() => calcFocusTime(data?.sData, isTimerTab), [data?.sData, isTimerTab])
  const [containerWidth, setContainerWidth] = useState<number | null>(null)
  const effectiveWidth = containerWidth && containerWidth > H_PADDING ? containerWidth - H_PADDING : 0

  const spacing = useMemo(() => {
    if (!effectiveWidth || !categories.length) return 20

    const totalBars = categories.length * BARS_PER_GROUP
    const totalBarWidth = totalBars * BAR_WIDTH
    const totalSpacingCount = totalBars + 1

    const s = (effectiveWidth - totalBarWidth) / totalSpacingCount
    return Math.max(s, 4)
  }, [effectiveWidth, categories.length])

  const chartData = useMemo(() => {
    if (!categories.length) return []

    const todayKey = moment().locale('en').format('ddd').toLowerCase()
    const labelWidth = Math.floor(effectiveWidth / categories.length) || 30

    return categories.flatMap((label, index) => {
      const isToday = label === todayKey

      return [
        {
          value: data?.pData[index] ?? 0,
          label,
          labelWidth,
          labelTextStyle: {
            color: isToday ? palette.main[500] : palette.grey[500]
          },
          frontColor: isToday ? palette.main[500] : palette.main[300]
        },
        {
          value: data?.sData[index] ?? 0,
          frontColor: isToday ? palette.grey[300] : palette.grey[100]
        }
      ]
    })
  }, [categories, data?.pData, data?.sData, effectiveWidth])

  const maxValue = useMemo(() => {
    if (!chartData.length) return 1
    return Math.max(...chartData.map((i) => i.value), 1) * 1.2
  }, [chartData])
  const getLabelByTimeType = (type: number, typeText: TypeText) => {
    const [WEEKLY, MONTHLY, ANNUALLY] = timeTypeOptions(t).map((o) => o.value)
    const dict = {
      [TypeText.study]: {
        [WEEKLY]: t('weekly_study_time'),
        [MONTHLY]: t('monthly_study_time'),
        [ANNUALLY]: t('annual_study_time')
      },
      [TypeText.average]: {
        [WEEKLY]: t('daily_average'),
        [MONTHLY]: t('monthly_average'),
        [ANNUALLY]: t('annual_average')
      },
      [TypeText.compare]: {
        [WEEKLY]: t('compared_to_last_week'),
        [MONTHLY]: t('compared_to_last_month'),
        [ANNUALLY]: t('compared_to_last_year')
      }
    }
    return dict[typeText][type] || ''
  }

  const renderStats = () =>
    isTimerTab ? (
      <>
        <StudyTimeDescriptionItem
          title={getLabelByTimeType(timeType, TypeText.study)}
          staticsNumber={ceilTo(totalP, 2)}
          unit={t('hour')}
        />
        <Divider />
        <StudyTimeDescriptionItem
          title={getLabelByTimeType(timeType, TypeText.average)}
          staticsNumber={ceilTo(totalP / (data?.pData.length || 1), 2)}
          unit={t('hour')}
        />
        <Divider />
        <StudyTimeDescriptionItem
          title={getLabelByTimeType(timeType, TypeText.compare)}
          staticsNumber={ceilTo(totalP - totalS, 2)}
          isCompared
          unit={t('hour')}
        />
      </>
    ) : (
      <>
        <StudyTimeDescriptionItem
          title={t('total_number_of_solved_questions')}
          staticsNumber={ceilTo(totalP, 2)}
          unit={t('question(s)')}
        />
        <Divider />
        <StudyTimeDescriptionItem
          title={t('correct_answer_rate')}
          staticsNumber={ceilTo(data?.correctRate || 0, 2)}
          subStaticsTitle={getLabelByTimeType(timeType, TypeText.compare)}
          subStaticsNumber={ceilTo((data?.correctRate || 0) - (data?.sCorrectRate || 0), 2)}
          unit="%"
        />
        <Divider />
        <StudyTimeDescriptionItem
          title={t('compared_average_accuracy_rate_all_students')}
          staticsNumber={ceilTo((data?.correctRate || 0) - (overallData?.avgData.correctRate || 0), 2)}
          isOverall
          isCompared
          unit="%"
        />
      </>
    )

  if (!data || loading) {
    return (
      <View style={styles.card}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <View style={styles.card}>
        <Text style={{ textAlign: 'center', color: '#6B7280' }}>{t('no_data')}</Text>
      </View>
    )
  }

  return (
    <View style={styles.card}>
      <View style={{ display: 'flex', gap: 24 }}>
        <View style={styles.chartBox}>
          <View style={styles.chartLabel}>
            <Text style={styles.chartLabelText}>{label}</Text>
          </View>

          <View
            onLayout={(e) => {
              if (containerWidth === null) {
                setContainerWidth(e.nativeEvent.layout.width)
                renderChart?.()
              }
            }}
            style={{ gap: 24, display: 'flex' }}
          >
            <BarChart
              data={chartData}
              height={220}
              barWidth={BAR_WIDTH}
              spacing={spacing}
              maxValue={maxValue}
              xAxisColor={palette.grey[300]}
              xAxisThickness={1}
              hideRules
              hideYAxisText
              yAxisThickness={0}
            />
          </View>
        </View>
        <View style={styles.statsBox}>{renderStats()}</View>
      </View>
    </View>
  )
}

const Divider = () => <View style={styles.divider} />

const styles = ScaledSheet.create({
  card: {},
  loading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center'
  },
  chartBox: {
    backgroundColor: '#FFF',
    width: '100%',
    borderWidth: 1,
    padding: 16,
    gap: 8,
    borderColor: palette.grey[100],
    borderRadius: 6
  },
  chartLabel: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: palette.grey[100],
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 16
  },
  chartLabelText: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.grey[900],
    textAlign: 'center'
  },
  statsBox: {
    backgroundColor: '#FFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: palette.grey[100],
    borderRadius: 6,
    gap: '8@ms',
    padding: '16@ms'
  },
  statsItem: {},
  statsTitleRow: {
    flexDirection: 'row'
  },
  statsTitle: {
    fontSize: 12,
    color: '#374151'
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700'
  },
  statsUnit: {
    fontSize: 14,
    color: '#6B7280'
  },
  subStatsValue: {
    fontSize: 12,
    color: '#059669',
    marginLeft: 4
  },
  divider: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginVertical: 8
  }
})

export default StudyTimeChart
