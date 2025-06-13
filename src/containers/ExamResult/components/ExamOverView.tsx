import { palette, TYPO } from '@/theme'
import { utcToLocalTime } from '@/utils/helpers'
import { ExamResult } from '@/utils/types'
import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { ScaledSheet } from 'react-native-size-matters'

type Props = {
  t: any
  resultData?: ExamResult
}

const ExamOverView = ({ t, resultData }: Props) => {
  const examTime = useMemo(() => {
    return `${utcToLocalTime(resultData?.startTime, 'HH:mm')} ~ ${utcToLocalTime(resultData?.finishTime, 'HH:mm')}`
  }, [resultData?.startTime, resultData?.finishTime])

  return (
    <ScrollView style={styles.overviewContainer}>
      {/* Score */}
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
        <Text style={styles.overviewValue}>{resultData?.title}</Text>
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
          <Text style={styles.overviewLabel}>응시 인원</Text>
          <Text style={styles.overviewValue}>{t('number_people', { number: resultData?.totalStudent })}</Text>
        </View>
        <View style={styles.columnItem}>
          <Text style={styles.overviewLabel}>{t('total_number_of_problems')}</Text>
          <Text style={styles.overviewValue}>
            {t('question_count_format', { number: resultData?.questions.length || 0 })}
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default ExamOverView

const styles = ScaledSheet.create({
  overviewContainer: {
    padding: '24@ms',
    gap: '16@ms',
    backgroundColor: "#FFF"
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
