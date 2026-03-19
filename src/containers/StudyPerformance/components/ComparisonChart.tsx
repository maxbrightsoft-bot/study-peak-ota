import React, { useMemo } from 'react'
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import { useTranslation } from 'react-i18next'
import { palette } from '@/theme'
import { StudyTimeDistribution } from '../configs/types'

type Props = {
  label: string
  isPrint?: boolean
  data?: StudyTimeDistribution[]
  colorSubjects: string[]
  loading: boolean
  renderChart?: () => void
}

const BAR_HEIGHT = 15
const GROUP_SPACING = 8
const DOT_SIZE = 3
const DOT_GAP = 12

const ComparisonChart = ({ label, loading, data, renderChart, colorSubjects }: Props) => {
  const safeData = useMemo(() => {
    if (!Array.isArray(data)) return []
    return data.filter((i) => Number.isFinite(i?.hours) && Number.isFinite(i?.lastHours))
  }, [data])


  const maxValue = useMemo(() => {
    if (!safeData.length) return 1
    const max = Math.max(...safeData.map((i) => Math.max(i.hours || 0, i.lastHours || 0)))
    return max > 0 ? max : 1
  }, [safeData])

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  if (!safeData.length) return null

  const DOT_COUNT = 20

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{label}</Text>

      <View
        style={styles.container}
        onLayout={() => {
          renderChart?.()
        }}
      >
        {safeData.map((item, index) => {
          const subjectColor = colorSubjects[index % colorSubjects.length] || palette.main[500]

          const percentCurrent = ((item.hours || 0) / maxValue) * 100
          const percentLast = ((item.lastHours || 0) / maxValue) * 100

          return (
            <View key={index} style={{ marginBottom: GROUP_SPACING }}>
              <View style={styles.rowTop}>
                <Text style={styles.subjectName}>{item.name}</Text>
              </View>

              <View style={styles.barTrack}>
                <View style={styles.dotsRow} pointerEvents="none">
                  {Array.from({ length: DOT_COUNT }).map((_, i) => (
                    <View key={i} style={[styles.dot, { backgroundColor: palette.grey[500] }]} />
                  ))}
                </View>

                {/* <View
                  style={[
                    styles.barSegment,
                    {
                      width: `${percentLast}%`,
                      backgroundColor: palette.grey[300],
                      borderRadius: BAR_HEIGHT / 2
                    }
                  ]}
                /> */}

                <View
                  style={[
                    styles.barSegment,
                    {
                      width: `${percentCurrent}%`,
                      backgroundColor: subjectColor,
                      borderRadius: BAR_HEIGHT / 2
                    }
                  ]}
                />
              </View>
            </View>
          )
        })}
      </View>
    </View>
  )
}

export default ComparisonChart

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 12,
  },

  title: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    color: '#111827',
    marginBottom: 4
  },

  container: {
    paddingVertical: 4,
    padding: 16,
    borderRadius: 6,
    backgroundColor: palette.bg[100]
  },

  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },

  subjectName: {
    fontSize: 12,
    fontWeight: '400',
    color: "#222222",
    lineHeight: 20
  },

  changeText: {
    fontSize: 12,
    fontWeight: '600'
  },

  barTrack: {
    height: BAR_HEIGHT,
    position: 'relative',
    justifyContent: 'center'
  },

  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    height: 15,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.grey[300],
    paddingHorizontal: DOT_GAP,
    borderRadius: 100,
    gap: DOT_GAP,
    overflow: 'hidden'
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    flexShrink: 0
  },

  barSegment: {
    position: 'absolute',
    left: 0,
    height: BAR_HEIGHT
  },

  loading: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
