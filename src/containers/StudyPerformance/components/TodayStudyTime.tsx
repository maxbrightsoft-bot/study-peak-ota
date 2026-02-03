import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Circle } from 'react-native-svg'
import { palette } from '@/theme'
import { MaterialIcons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { ceilTo, roundTo } from '@/utils/helpers'
import { MILLISECONDS_PER_HOUR } from '../configs/constants'
import { sum } from '../configs/helper'

type Props = {
  data?: any
  loading: boolean
  isTimerTab?: boolean
  isPrint?: boolean
}

const CircularProgress = ({ value, size = 150, stroke = 8, mainColor, restColor, children }: any) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke={restColor} strokeWidth={stroke} fill="transparent" />
      </Svg>
      <Svg width={size} height={size} style={[styles.svg, styles.progressSvg]}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={mainColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>

      <View style={[styles.center, { width: size, height: size }]}>{children}</View>
    </View>
  )
}

const TodayStudyTime = ({ data, loading, isTimerTab = true, isPrint }: Props) => {
  const { t } = useTranslation()

  const pData = isTimerTab ? data?.pData : data?.pData?.filter((i: any) => !!i?.correctRate)

  const sData = isTimerTab ? data?.sData : data?.sData?.filter((i: any) => i?.correctRate)

  const currentValue = isTimerTab
    ? sum(pData, undefined, true)
    : sum(pData, 'correctRate', false) / (pData?.length || 1)

  const lastValue = isTimerTab ? sum(sData, undefined, true) : sum(sData, 'correctRate', false) / (sData?.length || 1)

  const change = currentValue - lastValue

  const accumulatedTime = ceilTo((data?.totalTime || 0) / MILLISECONDS_PER_HOUR, 2)

  const totalAnsweredQuestions = sum(data?.pData, 'totalAnsweredQuestions', false)

  const isIncrease = change > 0

  const mainColor = isIncrease ? palette.main[700] : palette.main[500]
  const restColor = isIncrease ? palette.main[500] : isTimerTab || change === 0 ? palette.grey[300] : palette.error.main

  const ratio = isIncrease
    ? ((lastValue ? change || 0 : 1) / (!!lastValue ? lastValue : 1)) * 100
    : ((currentValue || 0) / (!!lastValue ? lastValue : 1)) * 100

  const clampedRatio = Math.min(ratio, 100)

  const renderChangeText = (value: number, suffix = '') => {
    const color = value >= 0 ? palette.success.main : palette.error.main
    const arrow =
      value > 0 ? (
        <MaterialIcons name="arrow-drop-up" size={24} color={palette.success.main} />
      ) : value < 0 ? (
        <MaterialIcons name="arrow-drop-down" size={24} color={palette.error.main} />
      ) : null

    return (
      <View style={styles.changeRow}>
        <Text style={[styles.changeText, { color }]}>
          {`${value >= 0 ? '+' : '-'}${ceilTo(Math.abs(value), 2)}${suffix}`}
        </Text>
        {arrow && <Text style={{ color, fontSize: 16, marginLeft: 4 }}>{arrow}</Text>}
      </View>
    )
  }

  const renderDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.title}>{isTimerTab ? t('today_net_study_time') : t('today_correct_answer_rate')}</Text>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{t('compared_to_yesterday')}</Text>
        {renderChangeText(change, isTimerTab ? t('hour') : '%')}
      </View>

      <View style={styles.detailRow}>
        <Text style={styles.detailLabel}>{isTimerTab ? t('accumulated') : t('total_number_questions_solved')}</Text>
        <Text style={styles.detailValue}>
          {isTimerTab ? (
            `${accumulatedTime}${t('hour')}`
          ) : (
            <>
              {totalAnsweredQuestions}
              <Text style={styles.unitText}>{` ${t('question(s)')}`}</Text>
            </>
          )}
        </Text>
      </View>

      {!isTimerTab && (
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('cumulative_correct_answer_rate')}</Text>
          <Text style={[styles.detailValue, { fontWeight: '700' }]}>
            {`${roundTo(data.totalCorrectRate, 2)}`}
            <Text style={styles.unitText}>%</Text>
          </Text>
        </View>
      )}
    </View>
  )

  if (!data || loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.progressSection}>
          <CircularProgress value={clampedRatio} mainColor={mainColor} restColor={restColor} size={160}>
            <View style={styles.progressText}>
              <Text style={styles.progressValue}>{ceilTo(currentValue, 2)}</Text>
              <Text style={styles.progressUnit}>{isTimerTab ? t('hour') : '%'}</Text>
            </View>
          </CircularProgress>
        </View>

        <View style={styles.detailsSection}>{renderDetails()}</View>
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    padding: '16@ms',
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100]
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  progressSection: {},
  detailsSection: {
    justifyContent: 'center'
  },
  svg: {
    position: 'absolute'
  },
  progressSvg: {
    transform: [{ rotateZ: '-90deg' }]
  },
  center: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressText: {
    alignItems: 'center'
  },
  progressValue: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.grey[900]
  },
  progressUnit: {
    fontSize: 16,
    fontWeight: '500',
    color: palette.grey[500]
  },
  detailsContainer: {
    justifyContent: 'center',
    gap: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    color: palette.grey[900]
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: palette.grey[500]
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: palette.grey[900]
  },
  unitText: {
    fontSize: 14,
    color: palette.grey[500]
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  changeText: {
    fontSize: 14,
    fontWeight: '600'
  }
})

export default TodayStudyTime
