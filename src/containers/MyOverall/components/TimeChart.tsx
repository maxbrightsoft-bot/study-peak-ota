import { palette } from '@/theme'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Text, View } from 'react-native'
import { LineChart } from 'react-native-gifted-charts'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  myTimes: number[]
  avgTimes: number[]
  categories: number[]
  height?: number
  yTooltipLabelFormatter: (y: string, { seriesIndex, dataPointIndex }: any) => string
  xTooltipLabelFormatter: (x: string, data: any) => string
}

const TimeChartGifted: React.FC<Props> = ({ myTimes, avgTimes, categories }) => {
  const screenWidth = Dimensions.get('window').width
  const maxTime = Math.max(...myTimes, ...avgTimes, 300)
  const { t } = useTranslation()

  const convertToLineData = (values: number[], color: string) =>
    values.map((y, index) => ({
      value: y,
      label: `${categories[index]}`,
      dataPointText: `${y}`,
    }))
    
  const myLineData = convertToLineData(myTimes, palette.main[500])
  const avgLineData = convertToLineData(avgTimes, palette.grey[500])

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: 40, paddingHorizontal: 5}}>
      <LineChart
        data={myLineData}
        data2={avgLineData}
        hideRules
        startFillColor={palette.grey[100]}
        color={palette.main[300]}
        yAxisColor={palette.grey[300]}
        xAxisColor={palette.grey[300]}
        animateOnDataChange
        areaChart2
        maxValue={maxTime + 50}
        stepValue={50}
        thickness={1}
        textShiftY={-5}
        width={screenWidth - 80}
        dataPointsHeight={10}
        dataPointsWidth={10}
        endFillColor2={palette.grey[300]}
        startFillColor2={palette.grey[300]}
        xAxisLabelTextStyle={{ fontSize: 10 }}
        yAxisTextStyle={{ fontSize: 10 }}
        hideDataPoints2
        dataPointsColor={palette.main[500]}
      />
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: palette.main[500] }]} />
          <Text style={[styles.legendLabel, { color: palette.main[500] }]}>{t('my_data')}</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: palette.grey[500] }]} />
          <Text style={[styles.legendLabel, { color: palette.grey[500] }]}>{t('avg_data')}</Text>
        </View>
      </View>
      </View>
    </View>
  )
}

export const styles = ScaledSheet.create({
  container : {
    paddingBottom: 200
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    gap: 8
  },
  legendColor: {
    width: 25,
    height: 2,
    borderRadius: 4,
    marginRight: 6
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: 700
  }
})

export default TimeChartGifted
