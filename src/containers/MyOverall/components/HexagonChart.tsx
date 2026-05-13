import React, { FC, useMemo } from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { RadarChart } from '@salmonco/react-native-radar-chart'
import { useTranslation } from 'react-i18next'
import { normalizeArray } from '../configs/helpers'
import { palette } from '@/theme'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  id: string
  myData: number[]
  avgData: number[]
  categories: any[]
  isPrint?: boolean
}

const HexagonChart: FC<Props> = ({ id, myData, avgData, categories, isPrint }) => {
  const { t } = useTranslation()

  const normalizedCategories = normalizeArray(categories, 6, '')
  const normalizedMyData = normalizeArray(myData, 6, null)
  const normalizedAvgData = normalizeArray(avgData, 6, null)

  const radarData = useMemo(() => {
    return normalizedMyData.map((value, index) => ({
      label: normalizedCategories?.[index] || `cat_${index}`,
      value: typeof value === 'number' ? value : 0
    }))
  }, [normalizedMyData, normalizedCategories])

  const radarAvgData = useMemo(() => {
    return normalizedAvgData.map((value, index) => ({
      label: normalizedCategories?.[index] || `cat_${index}`,
      value: typeof value === 'number' ? value : 0
    }))
  }, [normalizedAvgData, normalizedCategories])

  return (
    <View style={[styles.container, isPrint && { paddingBottom: 50 }]}>
      <View style={{ alignItems: 'center' }}>
        <RadarChart
          size={isPrint ? 200 : undefined}
          data={radarData as any}
          dataFillColor={palette.main[300]}
          dataFillOpacity={0.5}
          fillColor="#FFF"
          divisionStroke={palette.grey[300]}
          dataStrokeWidth={1}
          labelSize={12}
          stroke={['', '', '', palette.grey[900], '']}
          dataStroke={palette.main[500]}
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: palette.main[500] }]} />
            <Text style={[styles.legendLabel, { color: palette.main[500] }]}>{t('my_data')}</Text>
          </View>
        </View>
      </View>
      <View style={{ alignItems: 'center' }}>
        <RadarChart
          size={isPrint ? 200 : undefined}
          data={radarAvgData as any}
          dataFillColor={palette.primary.light}
          dataFillOpacity={0.5}
          fillColor="#FFF"
          divisionStroke={palette.grey[300]}
          dataStrokeWidth={1}
          labelSize={12}
          stroke={['', '', '', palette.grey[900], '']}
          dataStroke={palette.primary.main}
        />
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: palette.primary.light }]} />
            <Text style={[styles.legendLabel, { color: palette.primary.light }]}>{t('avg_data')}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = ScaledSheet.create({
  container: {
    width: '100%',
    padding: '16@ms',
    backgroundColor: 'white',
    paddingBottom: '150@ms'
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: '5@ms',
    borderRadius: '5@ms'
  },
  tooltipText: {
    color: 'white',
    fontSize: '12@ms',
    fontFamily: 'Pretendard'
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: '10@ms'
  },
  legendText: {
    fontSize: '12@ms',
    fontFamily: 'Pretendard',
    fontWeight: '600'
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: '8@ms',
    gap: '8@ms'
  },
  legendColor: {
    width: '25@ms',
    height: '2@ms',
    borderRadius: '4@ms',
    marginRight: '6@ms'
  },
  legendLabel: {
    fontSize: '14@ms',
    fontWeight: 700
  }
})

export default HexagonChart
