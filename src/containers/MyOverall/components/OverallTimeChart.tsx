import React, { FC, Fragment, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { View, StyleSheet } from 'react-native'
import OverallTabHeader from './OverallHeaderTab'
import { QuestionTimeCategoryData } from '@/utils/types'
import TimeChart from './TimeChart'
import { ScaledSheet } from 'react-native-size-matters'

interface Props {
  data: QuestionTimeCategoryData
  total: number
  index: number
  isPrint?: boolean
  onRendered?: (index: number) => void
}

const OverallTimeChart: FC<Props> = ({ data, total, index, isPrint, onRendered }) => {
  const { t } = useTranslation()

  const myTimes = useMemo(() => {
    return data.questions.map((q) => q.time / 1000)
  }, [JSON.stringify(data.questions)])

  const avgTimes = useMemo(() => {
    return data.questions.map((q) => q.avgTime / 1000)
  }, [JSON.stringify(data.questions)])

  const categories = useMemo(() => {
    return data.questions.map((q) => q.questionOrder + 1)
  }, [t, JSON.stringify(data.questions)])

  const xTooltipLabelFormatter = useCallback(
    (x: string, data: any) => {
      const dataPointIndex = data?.dataPointIndex
      if (typeof x !== 'undefined' && x !== null && dataPointIndex > 0 && dataPointIndex <= data.questions.length) {
        return t('problem_number_question', {
          number: data.questions[dataPointIndex - 1].questionOrder + 1
        })
      }
      return x
    },
    [t, JSON.stringify(data.questions)]
  )

  const yTooltipLabelFormatter = useCallback(
    (y: string, { seriesIndex, dataPointIndex }: any) => {
      if (typeof y !== 'undefined' && y !== null && dataPointIndex > 0 && dataPointIndex <= data.questions.length) {
        return t('n_seconds', {
          sec: (
            (seriesIndex === 0
              ? data.questions[dataPointIndex - 1].time
              : (data.questions[dataPointIndex - 1].avgTime ?? 0)) / 1000
          ).toFixed(2)
        })
      }
      return y
    },
    [t, JSON.stringify(data.questions)]
  )

  return (
    <Fragment>
      <OverallTabHeader title={`${t('problem_solving_speed')} (${data.categoryName})`} />
      <View
      // style={[
      //   styles.chartContainer,
      //   index % 2 === 0 &&
      //       borderRightColor: palette.grey[100]
      //     }
      // ]}
      >
        <TimeChart
          myTimes={myTimes}
          avgTimes={avgTimes}
          categories={categories}
          xTooltipLabelFormatter={xTooltipLabelFormatter}
          yTooltipLabelFormatter={yTooltipLabelFormatter}
          height={200}
        />
      </View>
    </Fragment>
  )
}

const styles = ScaledSheet.create({
  chartContainer: {
    flex: 1
  }
})

export default OverallTimeChart
