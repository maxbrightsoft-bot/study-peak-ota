import CommonDialog from '@/components/ModalBase/CommonDialog'
import { StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-paper'
import useLiveResult from '../hooks/useLiveResult'
import { utcToLocalTime } from '@/utils/helpers'
import { palette, TYPO } from '@/theme'
import { Question } from '@/utils/types'
import Loading from '@/components/Loading'

interface Props {
  title: string
  open: boolean
  examCode: string
  onClose?: () => void
  handleExamEnd: () => void
  handleDetailExamResult: () => void
}

const LiveResultDialog = ({
  title,
  open,
  onClose = () => {},
  examCode,
  handleExamEnd,
  handleDetailExamResult
}: Props) => {
  const { t, examResult, totalTime, resultData, isLoading } = useLiveResult({ examCode })
  return (
    <CommonDialog onClose={onClose} isVisible={open} title={title}>
      {isLoading && <Loading isOverlay={false} />}
      <View style={styles.examInfo}>
        <Text style={styles.examTitle}>{examResult?.title || ''}</Text>
        <View style={{ }}>
          <Text style={styles.examSubtitle}>{utcToLocalTime(examResult?.startTime, t('full_date_time_format'))}</Text>
          {!!examResult?.courses?.length && <Text style={styles.examSubtitle}>{examResult?.courses?.map((course) => course.name).join(', ')}</Text>}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={styles.examDetails}>{`${t('exam_end')} ${totalTime}`}</Text>
          <Text style={styles.examDetails}>{t('total_questions_title', { total: resultData?.questions?.length })}</Text>
        </View>
      </View>

      <View style={styles.scoreBlock}>
        <Text style={styles.score}>{t('score_format', { score: examResult?.score || 0 })}</Text>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Text style={{ ...styles.scoreText, color: palette.grey[500] }}> {t('percentage')}:</Text>
          <Text style={{ ...styles.scoreText, color: palette.grey[700] }}>
            {' '}
            {examResult?.percentageAmongStudents?.toFixed(2) || 0}%
          </Text>
        </View>
        {!examResult?.questionSolvingOrderEfficiency ||
          (examResult?.questionSolvingOrderEfficiency === 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Text style={{ ...styles.scoreText, color: palette.grey[500] }}>
                {' '}
                {t('solution_sequence_efficiency')}:
              </Text>
              <Text style={{ ...styles.scoreText, color: palette.grey[700] }}>
                {' '}
                {examResult?.questionSolvingOrderEfficiency.toFixed(2)}%
              </Text>
            </View>
          ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button mode="contained" style={styles.confirmButton} onPress={handleExamEnd}>
          <Text style={styles.confirmText}>{t('exam_end')}</Text>
        </Button>
        <Button mode="outlined" style={styles.detailButton} onPress={handleDetailExamResult}>
          <Text style={styles.detailText}>{t('view_details')}</Text>
        </Button>
      </View>
    </CommonDialog>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },
  card: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    position: 'relative'
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 10
  },
  examInfo: {
    marginBottom: 24
  },
  examTitle: {
    ...TYPO.heading3,
    marginBottom: 8
  },
  examSubtitle: {
    ...TYPO.button4,
    color: palette.grey[500],
    marginBottom: 8
  },
  examDetails: {
    ...TYPO.button4,
    color: palette.grey[500]
  },
  scoreBlock: {
    borderWidth: 1,
    borderColor: palette.grey[100],
    borderRadius: 6,
    padding: 12,
    marginBottom: 24
  },
  score: {
    ...TYPO.heading2,
    color: palette.yellow[900],
    marginBottom: 8
  },
  scoreText: {
    ...TYPO.button3,
    marginBottom: 8
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  confirmButton: {
    marginRight: 8,
    borderRadius: 6,
    backgroundColor: palette.main[500],
    paddingVertical: 4
  },
  detailButton: {
    marginLeft: 8,
    borderRadius: 6,
    borderColor: palette.main[500],
    color: palette.main[500]
  },
  confirmText: {
    ...TYPO.button2,
    color: '#FFF'
  },
  detailText: {
    ...TYPO.button,
    color: palette.main[500]
  }
})

export default LiveResultDialog
