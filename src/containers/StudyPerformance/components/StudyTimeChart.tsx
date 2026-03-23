import React, { useMemo, useState } from 'react'
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Dimensions } from 'react-native'
import { useTranslation } from 'react-i18next'
import { DataResponse, QuestionAnswerOverallResponse } from '../configs/types'
import { calcFocusTime, ceilTo } from '../configs/helper'
import { timeTypeOptions, TypeText } from '../configs/constants'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'
import moment from 'moment'
import { Octicons } from '@expo/vector-icons'

type Props = {
  categories: string[]
  data?: DataResponse
  renderChart?: () => void
  timeType: number
  label: string
  loading: boolean
  isPrint?: boolean
  currentTime: number
  onPrevious: () => void
  onNext: () => void
  isDisableNavigation: (time: number, type?: 'PREVIOUS' | 'NEXT') => boolean
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
  const valueColor = isCompared ? (staticsNumber >= 0 ? palette.main[600] : '#DC2626') : '#111827'

  return (
    <View style={styles.statsItem}>
      <View style={styles.statsTitleRow}>
        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.statsTitle}>
          {title}
        </Text>
        {!!subStaticsTitle && <Text style={styles.statsTitle}>{subStaticsTitle}</Text>}
      </View>

      <View style={styles.statsValueRow}>
        <Text style={[styles.statsValue, { color: valueColor }]}>
          {isCompared ? `${staticsNumber >= 0 ? '+' : '-'}${Math.abs(staticsNumber)}` : staticsNumber}
          <Text
            style={[
              styles.statsUnit,
              { color: isCompared ? (staticsNumber >= 0 ? palette.main[600] : '#DC2626') : palette.grey[500] }
            ]}
          >{` ${unit}`}</Text>
        </Text>

        {/* {!!subStaticsNumber && (
          <Text style={styles.subStatsValue}>
            {`${subStaticsNumber >= 0 ? '+' : '-'}${Math.abs(subStaticsNumber)}${unit}`}
          </Text>
        )} */}
      </View>
    </View>
  )
}

const CHART_HEIGHT = 165
const BAR_BG_COLOR = palette.main[100]
const COLOR_PRIMARY = '#B09FFF'
const COLOR_SECONDARY = '#FFD572'

type PillBarProps = {
  pValue: number
  sValue: number
  maxValue: number
  label: string
  isToday?: boolean
  barWidth: number
}

const PillBar = ({ pValue, sValue, maxValue, label, isToday, barWidth }: PillBarProps) => {
  const safeMax = maxValue > 0 ? maxValue : 1
  const pHeight = Math.max((pValue / safeMax) * CHART_HEIGHT, pValue > 0 ? 8 : 0)
  const sHeight = Math.max((sValue / safeMax) * CHART_HEIGHT, sValue > 0 ? 8 : 0)

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View
        style={{
          width: barWidth,
          height: CHART_HEIGHT,
          backgroundColor: BAR_BG_COLOR,
          borderRadius: barWidth / 2,
          justifyContent: 'flex-end',
          overflow: 'hidden',
          marginBottom: 8
        }}
      >
        {pHeight > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: pHeight,
              backgroundColor: COLOR_PRIMARY,
              borderRadius: barWidth / 2
            }}
          />
        )}

        {sHeight > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: sHeight,
              backgroundColor: COLOR_SECONDARY,
              borderRadius: barWidth / 2
            }}
          />
        )}

        {pHeight > 0 && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: Math.min(pHeight, sHeight > 0 ? pHeight : pHeight),
              backgroundColor: COLOR_PRIMARY,
              borderRadius: barWidth / 2
            }}
          />
        )}
      </View>

      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={{
          fontSize: 13,
          color: isToday ? palette.main[500] : palette.grey[500],
          fontWeight: isToday ? '600' : '400'
        }}
      >
        {label}
      </Text>
    </View>
  )
}

const H_PADDING = 32
const BAR_MIN_WIDTH = 18
const BAR_MAX_WIDTH = 48

const StudyTimeChart = ({
  data,
  label,
  loading,
  timeType,
  isDisableNavigation,
  onNext,
  currentTime,
  onPrevious,
  overallData,
  categories = [],
  renderChart,
  isTimerTab = true
}: Props) => {
  const { t } = useTranslation()
  const totalP = useMemo(() => calcFocusTime(data?.pData, isTimerTab), [data?.pData, isTimerTab])
  const totalS = useMemo(() => calcFocusTime(data?.sData, isTimerTab), [data?.sData, isTimerTab])
  const [containerWidth, setContainerWidth] = useState<number>(Dimensions.get('window').width - H_PADDING)

  console.log({ data })

  const barWidth = useMemo(() => {
    if (!categories.length) return BAR_MIN_WIDTH
    const w = (containerWidth / categories.length) * 0.55
    return Math.min(Math.max(w, BAR_MIN_WIDTH), BAR_MAX_WIDTH)
  }, [containerWidth, categories.length])

  const maxValue = useMemo(() => {
    if (!data) return 1
    return Math.max(...(data.pData || []), ...(data.sData || []), 1) * 1.15
  }, [data])

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

  if (!categories.length) {
    return (
      <View style={styles.card}>
        <Text style={{ textAlign: 'center', color: '#6B7280' }}>{t('no_data')}</Text>
      </View>
    )
  }

  const isDisablePrev = isDisableNavigation(currentTime, 'PREVIOUS')
  const isDisableNext = isDisableNavigation(currentTime, 'NEXT')
  const todayKey = moment().locale('en').format('ddd').toLowerCase()

  return (
    <View style={styles.card}>
      <View style={{ gap: 10 }}>
        <View style={styles.chartBox}>
          <View style={styles.chartLabel}>
            <TouchableOpacity onPress={onPrevious} disabled={isDisablePrev}>
              <Octicons name="chevron-left" size={18} color={isDisablePrev ? palette.grey[200] : '#222222'} />
            </TouchableOpacity>
            <Text style={styles.chartLabelText}>{label}</Text>
            <TouchableOpacity onPress={onNext} disabled={isDisableNext}>
              <Octicons name="chevron-right" size={18} color={isDisableNext ? palette.grey[200] : '#222222'} />
            </TouchableOpacity>
          </View>

          <View
            style={styles.barsContainer}
            onLayout={(e) => {
              const w = e.nativeEvent.layout.width
              if (w > 0) {
                setContainerWidth(w)
                renderChart?.()
              }
            }}
          >
            {categories.map((cat, index) => (
              <PillBar
                key={cat}
                label={cat}
                pValue={data?.pData[index] ?? 0}
                sValue={data?.sData[index] ?? 0}
                maxValue={maxValue}
                isToday={cat === todayKey}
                barWidth={barWidth}
              />
            ))}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    gap: 20,
    shadowColor: '#0000000A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  chartLabel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 4,
    marginBottom: 14
  },
  chartLabelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center'
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between'
  },
  statsBox: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 20,
    gap: '12@ms',
    padding: '16@ms',
    shadowColor: '#0000000A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3
  },
  statsItem: {},
  statsTitleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  statsTitle: {
    fontSize: 11,
    color: '#6B7280',
    lineHeight: 16
  },
  statsValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2
  },
  statsValue: {
    fontSize: 16,
    fontWeight: '700'
  },
  statsUnit: {
    fontSize: 13,
    fontWeight: '500'
  },
  subStatsValue: {
    fontSize: 11,
    color: palette.main[600],
    marginLeft: 4
  },
  divider: {
    height: 28,
    width: 1.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center'
  }
})

export default StudyTimeChart
