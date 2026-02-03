import React, { useMemo, useCallback } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { BarChart } from 'react-native-gifted-charts'
import { useTranslation } from 'react-i18next'
import { ceilTo, formatTime } from '../configs/helper'
import { palette } from '@/theme'
import { StudyTimeDistribution } from '../configs/types'

type Props = {
  label: string
  isPrint?: boolean
  data?: StudyTimeDistribution[]
  colorSubjects: string[]
  loading: boolean
  renderChart?: () => void
  titleTooltip: { pTitle?: string; sTitle?: string }
}

const BAR_HEIGHT = 12
const GROUP_SPACING = 18
const BAR_SPACING = 0

const ComparisonChart = ({ label, loading, data, renderChart, isPrint, titleTooltip, colorSubjects }: Props) => {
  const { t } = useTranslation()

  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((i) => Number.isFinite(i?.hours) && Number.isFinite(i?.lastHours))
  }, [data])

  const maxValue = useMemo(() => {
    if (!safeData.length) return 1
    const max = Math.max(...safeData.map((i) => Math.max(i.hours || 0, i.lastHours || 0)))
    return max > 0 ? max : 1
  }, [safeData])

  const chartData = useMemo(() => {
    return safeData.flatMap((item, index) => {
      const subjectColor = colorSubjects[index % colorSubjects.length] || palette.primary.main

      return [
        {
          value: item.lastHours,
          spacing: BAR_SPACING,
          frontColor: palette.grey[300]
        },
        {
          value: item.hours,
          spacing: GROUP_SPACING,
          frontColor: subjectColor
        }
      ]
    })
  }, [safeData, colorSubjects])

  const chartHeight = useMemo(() => {
    return safeData.length * (BAR_HEIGHT * 2 + GROUP_SPACING)
  }, [safeData.length])

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!chartData.length) {
    return null
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{label}</Text>
      <View
        style={styles.chartContainer}
        onLayout={() => {
          renderChart?.()
        }}
      >
        <View style={{ ...styles.changeColumn, left: 15 }}>
            {safeData.map((s, index) => {
              const isPositive = s.change >= 0
              const color = isPositive ? palette.main[700] : palette.error.main
              return (
                <View key={index} style={styles.changeItem}>
                  <Text style={[styles.changeText, { color }]}>{s.name}</Text>
                </View>
              )
            })}
        </View>
        <View style={{ transform: [{ rotate: '90deg' }], marginLeft: 20 }}>
          <BarChart
            data={chartData}
            hideRules
            hideYAxisText
            barWidth={BAR_HEIGHT}
            yAxisThickness={0}
            xAxisColor={palette.grey[300]}
            noOfSections={4}
            maxValue={maxValue * 1.2}
            initialSpacing={0}
          />
        </View>
        <View style={{ ...styles.changeColumn }}>
            {safeData.map((s, index) => {
              const isPositive = s.change >= 0
              const color = isPositive ? palette.main[700] : palette.error.main
              return (
                <View key={index} style={styles.changeItem}>
                  <Text style={[styles.changeText, { color }]}>
                    {isPositive ? '+' : '-'}
                    {Math.abs(ceilTo(s.change, 2))}
                    {t('hour')}
                  </Text>
                </View>
              )
            })}
        </View>
      </View>
    </View>
  )
}

export default ComparisonChart

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    backgroundColor: '#FFF',
    borderRadius: 6,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    borderColor: palette.grey[100]
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827'
  },

  chartContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    padding: 16,
    borderRadius: "6@ms",
    backgroundColor: palette.grey[50]
  },

  loading: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center'
  },

  tooltipContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minWidth: 160
  },

  tooltipTitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500'
  },
  currentBar: { position: 'absolute', height: 20, borderRadius: 4, justifyContent: 'center', paddingLeft: 4 },
  currentValueText: { color: '#FFF', fontSize: 10, fontWeight: '600', position: 'absolute', right: 4 },
  changeColumn: {
    height: "100%",
    justifyContent: 'space-between',
    position: 'absolute',
    right: 5,
    paddingVertical: 2
  },
  changeItem: { justifyContent: 'center', paddingBottom: 18 },
  changeText: { fontSize: 14, fontWeight: '500' },
  tooltipValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4
  }
})
