import React from 'react'
import { View, Text, ActivityIndicator, Pressable } from 'react-native'
import Svg, { Circle, G } from 'react-native-svg'
import { StudyTimeDistribution } from '../configs/types'
import { useTranslation } from 'react-i18next'
import { ceilTo, formatAccumulatedTime, formatTime } from '../configs/helper'
import { palette } from '@/theme'
import { MaterialIcons } from '@expo/vector-icons'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  data?: StudyTimeDistribution[]
  loading: boolean
  isPrint?: boolean
}

type SubjectItemProps = {
  subject: StudyTimeDistribution
  isPrint?: boolean
}

const CircularProgress = ({
  value,
  size = 80,
  stroke = 10,
  mainColor = palette.sub[400],
  restColor = palette.sub[50],
  children
}: any) => {
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius

  const ARC_ANGLE = 300
  const START_ANGLE = 120
  const DOT_COUNT = 20
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

const SubjectItem = ({ subject, isPrint }: SubjectItemProps) => {
  const { t } = useTranslation()
  const isIncrease = subject.change > 0

  const mainColor = subject.color || (isIncrease ? palette.main[600] : palette.sub[400])
  const restColor = isIncrease ? (subject.color || palette.main[600]) : palette.sub[50]
  const arrowColor = subject.change >= 0 ? palette.main[600] : palette.error.main

  const ratio = isIncrease
    ? ((subject.lastHours ? subject.change || 0 : 1) / (!!subject.lastHours ? subject.lastHours : 1)) * 100
    : ((subject.hours || 0) / (!!subject.lastHours ? subject.lastHours : 1)) * 100

  const clampedRatio = Math.min(ratio, 100)

  return (
    <View style={styles.subjectItemContainer}>
      <View style={styles.circularProgressWrapper}>
        <CircularProgress value={clampedRatio} mainColor={mainColor} restColor={restColor} size={80}>
          <View style={styles.progressText}>
            <Pressable
              onLongPress={() => {
                alert(formatTime((subject.hours || 0) * 60 * 60, t))
              }}
            >
              <Text style={styles.hoursValue} numberOfLines={1}>
                {formatAccumulatedTime((subject.hours || 0)  * 60 * 60 * 1000 || 0, t)}
              </Text>
            </Pressable>
          </View>
        </CircularProgress>
      </View>

      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName} numberOfLines={1}>
          {subject.name}
        </Text>

        <View style={styles.changeRow}>
          <Text style={[styles.changeText, { color: arrowColor }]}>
            {formatAccumulatedTime(Math.abs(subject.change * 60 * 60 * 1000), t)}
          </Text>
          {subject.change !== 0 && (
            <Text style={{ color: arrowColor, fontSize: 16, textAlign: 'center' }}>
              {isIncrease ? (
                <MaterialIcons name="arrow-drop-up" size={24} color={palette.main[600]} />
              ) : (
                <MaterialIcons name="arrow-drop-down" size={24} color={palette.error.main} />
              )}
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

const SubjectProgress = ({ data, loading, isPrint }: Props) => {
  const { t } = useTranslation()
  
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      </View>
    )
  }

  if (!data || data.length === 0) {
    return null
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('net_study_time_by_subject')}</Text>

      <View style={styles.grid}>
        {data.map((subject, index) => (
          <View key={index} style={styles.gridItem}>
            <SubjectItem subject={subject} isPrint={isPrint} />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: palette.grey[100],
    padding: '16@ms',
    gap: '16@ms'
  },
  loadingContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    color: palette.grey[900],
    marginBottom: 8
  },
  grid: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    rowGap: 16
  },
  gridItem: {
    display: 'flex',
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 4
  },
  subjectItemContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: 16
  },
  circularProgressWrapper: {
  },
  subjectInfo: {
    width: 58,
    alignItems: 'flex-start',
    justifyContent: 'center',
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
    width: '60%',
    alignItems: 'center'
  },
  hoursValue: {
    fontSize: 18,
    fontWeight: 700,
    color: "#222222",
    textAlign: 'center'
  },
  hoursUnit: {
    fontSize: 12,
    fontWeight: 400,
    color: palette.grey[500]
  },
  subjectName: {
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 24,
    color: palette.grey[900]
  },
  changeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  },
  changeText: {
    marginTop: 4,
    fontWeight: 600,
    fontSize: 12,
    lineHeight: 20
  },
  tooltipContainer: {
    position: 'relative'
  },
  tooltip: {
    position: 'absolute',
    top: -30,
    left: -20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1000
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 12
  }
})

export default SubjectProgress
