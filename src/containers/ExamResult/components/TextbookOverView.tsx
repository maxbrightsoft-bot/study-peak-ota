import { palette, TYPO } from '@/theme'
import { utcToLocalTime } from '@/utils/helpers'
import { TextbookResult } from '@/utils/types'
import moment from 'moment'
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  resultData?: TextbookResult
}

const TextbookOverView = ({ t, resultData }: Props) => {
  const examTime = useMemo(() => {
    if (!resultData?.startTime) return ''

    const startTime = moment(resultData.startTime)
    if (!startTime.isValid()) return ''

    const endTime = startTime.clone().add(resultData.totalTime, 'minutes')

    return `${utcToLocalTime(startTime, 'HH:mm')} ~ ${utcToLocalTime(endTime, 'HH:mm')}`
  }, [resultData?.startTime, resultData?.totalTime])

  return (
    <ScrollView style={styles.overviewContainer}>
      <View style={styles.overviewItem}>
        <Text style={styles.overviewLabel}>시험 접수</Text>
        <Text style={{ ...TYPO.heading1, color: palette.main[500] }}>
          {t('score_format', {
            score: resultData?.score
          })}
        </Text>
      </View>

      <View style={styles.overviewItem}>
        <Text style={styles.overviewLabel}>{t('test_name')}</Text>
        <Text style={styles.overviewValue}>{resultData?.chapterName}</Text>
      </View>

      <View style={styles.doubleColumn}>
        <View style={styles.columnItem}>
          <Text style={styles.overviewLabel}>{t('exam_date')}</Text>
          <Text style={styles.overviewValue}>{utcToLocalTime(resultData?.startTime, t('date_format'))}</Text>
        </View>
        <View style={styles.columnItem}>
          <Text style={styles.overviewLabel}>{t('exam_time')}</Text>
          <Text style={styles.overviewValue}>{examTime}</Text>
        </View>
      </View>
      <View style={styles.doubleColumn}>
        <View style={styles.columnItem}>
          <Text style={styles.overviewLabel}>{t('total_number_of_problems')}</Text>
          <Text style={styles.overviewValue}>
            {t('question_count_format', { number: resultData?.totalQuestions || 0 })}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default TextbookOverView

const styles = ScaledSheet.create({
  overviewContainer: {
    padding: '24@ms',
    gap: '16@ms',
    backgroundColor: '#FFF'
  },
  overviewItem: {
    marginBottom: 16
  },
  overviewLabel: {
    ...TYPO.caption,
    color: palette.grey[500],
    marginBottom: 4
  },
  overviewValue: {
    ...TYPO.button3,
    fontWeight: 700,
    color: palette.grey[900]
  },
  doubleColumn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  columnItem: {
    width: '48%'
  }
})
