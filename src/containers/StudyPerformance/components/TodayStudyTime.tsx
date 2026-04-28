import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useTranslation } from 'react-i18next'
import Svg, { Circle, G } from 'react-native-svg'
import { palette } from '@/theme'
import { MaterialIcons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'
import { ceilTo, roundTo } from '@/utils/helpers'
import { formatAccumulatedTime, formatAccumulatedTimeSplit, sum } from '../configs/helper'

type Props = {
  data?: any
  loading: boolean
  isTimerTab?: boolean
  isPrint?: boolean
}

const CircularProgress = ({
  value,
  size = 180,
  stroke = 18,
  mainColor = palette.sub[400],
  restColor = palette.sub[50],
  children
}: any) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const ARC_ANGLE = 300
  const START_ANGLE = 120
  const DOT_COUNT = 30
  const dotRadius = 1

  const arcLength = (ARC_ANGLE / 360) * circumference

  const progress = Math.min(Math.max(value, 0), 100)
  const progressLength = (progress / 100) * arcLength
  const dashOffset = arcLength - progressLength

  const renderDots = () => {
    return Array.from({ length: DOT_COUNT }).map((_, i) => {
      const dotPathRadius = radius - stroke
      const angle = ((START_ANGLE + (ARC_ANGLE * i) / (DOT_COUNT - 1)) * Math.PI) / 180

      const cx = size / 2 + dotPathRadius * Math.cos(angle)

      const cy = size / 2 + dotPathRadius * Math.sin(angle)

      return <Circle key={i} cx={cx} cy={cy} r={dotRadius} fill={mainColor} />
    })
  }

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={restColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(${START_ANGLE} ${size / 2} ${size / 2})`}
        />

        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={mainColor}
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform={`rotate(${START_ANGLE} ${size / 2} ${size / 2})`}
        />

        {renderDots()}
      </Svg>

      <View
        style={{
          width: size,
          height: size,
          position: 'absolute',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {children}
      </View>
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

  const accumulatedTime = formatAccumulatedTime(data?.totalTime || 0, t)

  const totalAnsweredQuestions = sum(data?.pData, 'totalAnsweredQuestions', false)

  const isIncrease = change > 0

  const mainColor = isIncrease ? palette.main[600] : palette.sub[400]
  const restColor = isIncrease ? palette.main[600] : isTimerTab || change === 0 ? palette.sub[50] : palette.error.main

  const ratio = isIncrease
    ? ((lastValue ? change || 0 : 1) / (!!lastValue ? lastValue : 1)) * 100
    : ((currentValue || 0) / (!!lastValue ? lastValue : 1)) * 100

  const clampedRatio = Math.min(ratio, 100)

  const renderChangeText = (value: number, isTimer: boolean) => {
    const color = value >= 0 ? palette.main[600] : palette.error.main
    const arrow =
      value > 0 ? (
        <MaterialIcons name="arrow-drop-up" size={24} color={palette.main[600]} />
      ) : value < 0 ? (
        <MaterialIcons name="arrow-drop-down" size={24} color={palette.error.main} />
      ) : null

    return (
      <View style={styles.changeRow}>
        <Text style={[styles.changeText, { color }]}>{isTimer ? `${value >= 0 ? '+' : '-'}${formatAccumulatedTime(Math.abs(value) * 3600000, t)}` : `${value >= 0 ? '+' : '-'}${ceilTo(Math.abs(value), 2)}%`}</Text>
        {arrow && <Text style={{ color, fontSize: 16, marginLeft: 4 }}>{arrow}</Text>}
      </View>
    )
  }

  const renderDetails = () => (
    <View style={styles.detailsContainer}>
      <Text style={styles.title}>{isTimerTab ? t('today_net_study_time') : t('today_correct_answer_rate')}</Text>

      <View style={{ gap: 4 }}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('compared_to_yesterday')}</Text>
          {renderChangeText(change, isTimerTab)}
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{isTimerTab ? t('accumulated') : t('total_number_questions_solved')}</Text>
          <Text style={styles.detailValue}>
            {isTimerTab ? (
              `${accumulatedTime}`
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
              <Text style={styles.progressValue}>{isTimerTab ? formatAccumulatedTimeSplit(currentValue * 3600000, t).value : ceilTo(currentValue, 2)}</Text>
              <Text style={styles.progressUnit}>{isTimerTab ? formatAccumulatedTimeSplit(currentValue * 3600000, t).unit : '%'}</Text>
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
    borderBottomColor: palette.grey[100],
    alignItems: 'center'
  },
  loadingContainer: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 24
  },
  progressSection: {},
  detailsSection: {
    flex: 1,
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
    fontSize: 14,
    fontWeight: '500',
    color: palette.grey[500]
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: "#222222"
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
